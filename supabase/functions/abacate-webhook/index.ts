import { createClient } from 'npm:@supabase/supabase-js@2'

// Recebe as notificações de pagamento do AbacatePay e ativa/renova/revoga o
// plano pago do usuário. Sem esta função, um pagamento aprovado nunca é
// refletido em user_subscriptions e o cliente fica preso no plano trial mesmo
// após pagar — e um reembolso/chargeback nunca revoga o acesso já concedido.
//
// Baseado em https://docs.abacatepay.com/pages/webhooks e teste real de ponta
// a ponta (pagamento sandbox + inspeção do payload de entrega) em 2026-07-23.
//
// Estrutura REAL confirmada via payload de entrega (não só a doc, que é vaga
// nesse ponto): `data` tem até três objetos irmãos — nunca aninhados um dentro
// do outro:
//   data.subscription  -> presente em eventos subscription.* (id subs_..., status,
//                          frequency, method, SEM externalId/metadata)
//   data.customer       -> presente em eventos subscription.* (id cust_..., name, email, taxId)
//   data.checkout        -> presente em TODOS os eventos (id bill_..., externalId,
//                          metadata, methods[], installmentsCount, status) — é
//                          aqui que externalId/metadata realmente ficam, não em
//                          data.subscription nem direto em data.
// Em checkout.completed/refunded/disputed, data só tem o campo "checkout" (não
// há subscription/customer irmãos).
//
// Todos os 13 eventos documentados: checkout.completed/refunded/disputed,
// transparent.completed/refunded/disputed, subscription.completed/renewed/
// cancelled, transfer.completed/failed, payout.completed/failed. Só os 8
// primeiros interessam ao Plushify (transfer/payout são sobre saques da
// AbacatePay pra conta do MERCHANT, não pagamento de cliente).
//
// Configuração necessária antes de produção:
// 1. Painel AbacatePay > Webhooks > cadastrar:
//    https://<seu-projeto>.supabase.co/functions/v1/abacate-webhook?webhookSecret=SEU_SEGREDO
// 2. `supabase secrets set ABACATE_WEBHOOK_SECRET=SEU_SEGREDO` (mesmo valor acima)
// 3. Disparar um pagamento de teste e conferir os logs desta função no painel do Supabase.
//
// Sobre a verificação HMAC (X-Webhook-Signature) que a doc da AbacatePay
// menciona: removida deste código de propósito. Testado exaustivamente em
// 2026-07-23 — essa conta/versão da AbacatePay não expõe em lugar nenhum do
// painel (Webhook, API, Perfil) a chave pública que seria necessária para
// verificar essa assinatura. Qualquer valor colocado em ABACATE_WEBHOOK_PUBLIC_KEY
// é adivinhação e faz TODA entrega real da AbacatePay falhar com 401 (ela manda
// o header, mas com uma chave que não há como obter/conferir). Autenticação
// fica só no webhookSecret da URL — camada única, mas real e funcional.
//
// REVOGAÇÃO (cancelamento, reembolso, disputa): as três chamam a mesma RPC
// cancel_subscription, cada uma com um status diferente ('cancelled' /
// 'refunded' / 'disputed') — get_user_plan() já ignora linhas não-ativas e
// volta pro trial automaticamente, então não precisa mexer em plan_type.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const log = (step: string, details?: unknown) => {
  const suffix = details === undefined ? '' : ` - ${JSON.stringify(details)}`
  console.log(`[ABACATE-WEBHOOK] ${step}${suffix}`)
}

const ACTIVATION_EVENTS = new Set(['subscription.completed', 'subscription.renewed', 'checkout.completed'])

// CONFIRMADO via https://docs.abacatepay.com/pages/webhooks (2026-07-23): a AbacatePay
// dispara eventos de reembolso (`*.refunded`) e disputa/chargeback (`*.disputed`) — antes
// desta mudança, nenhum dos dois revogava o plano: um estorno ou chargeback deixava o
// usuário com acesso pago para sempre, mesmo sem o pagamento estar mais confirmado.
// `transparent.*` cobre o checkout transparente (Pix/Boleto avulso via /transparents/create),
// não usado hoje pelo Plushify, mas tratado aqui para não deixar a lacuna se for adotado.
const REVOCATION_EVENTS: Record<string, 'cancelled' | 'refunded' | 'disputed'> = {
  'subscription.cancelled': 'cancelled',
  'checkout.refunded': 'refunded',
  'transparent.refunded': 'refunded',
  'checkout.disputed': 'disputed',
  'transparent.disputed': 'disputed',
}

// externalId foi criado por nós em abacate-create-subscription no formato:
// "plushify:<userId>:<planType>:<billingPeriod>:<uuid>"
const parseExternalId = (externalId: string | null) => {
  if (!externalId) return null
  const parts = externalId.split(':')
  if (parts.length < 4 || parts[0] !== 'plushify') return null
  const [, userId, planType, billingPeriod] = parts
  return { userId, planType, billingPeriod }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Autenticidade do webhook via secret na query string
    const url = new URL(req.url)
    const receivedSecret = url.searchParams.get('webhookSecret')
    const expectedSecret = Deno.env.get('ABACATE_WEBHOOK_SECRET')

    if (!expectedSecret) {
      log('MISCONFIG: ABACATE_WEBHOOK_SECRET não configurado')
      return new Response(JSON.stringify({ error: 'Misconfigured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (receivedSecret !== expectedSecret) {
      log('AUTH: webhookSecret inválido ou ausente')
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const rawBody = await req.text()

    const body = (() => {
      try {
        return JSON.parse(rawBody)
      } catch {
        return null
      }
    })()
    if (!body) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    log('event received', body)

    const eventType = String(body.event ?? '')
    const dataRoot = (body.data ?? {}) as Record<string, unknown>

    // Eventos de assinatura vêm aninhados em data.subscription (confirmado na doc).
    // Fallback para data direto, caso algum evento não siga o mesmo formato.
    const sub = (dataRoot.subscription ?? dataRoot) as Record<string, unknown>

    // CONFIRMADO via payload real (entrega de 2026-07-23): externalId e metadata
    // não vêm em data.subscription nem direto em data — vêm em data.checkout,
    // que é irmão de data.subscription (não filho). Checkout avulso (anual)
    // também usa este objeto. Mantemos os fallbacks antigos por segurança.
    const checkoutObj = (dataRoot.checkout ?? {}) as Record<string, unknown>

    const revocationStatus = REVOCATION_EVENTS[eventType]
    if (revocationStatus) {
      const cancelExternalId = (checkoutObj.externalId ?? sub.externalId ?? dataRoot.externalId ?? null) as string | null
      const cancelParsed = parseExternalId(cancelExternalId)
      const cancelMetadata = (checkoutObj.metadata ?? sub.metadata ?? dataRoot.metadata ?? {}) as Record<string, unknown>
      const cancelUserId = cancelParsed?.userId ?? (cancelMetadata.user_id ? String(cancelMetadata.user_id) : null)
      const cancelSubscriptionId = sub.id ? String(sub.id) : null
      // checkout.refunded/disputed (plano anual) não têm abacate_subscription_id —
      // só o id do checkout/bill, que é onde o registro fica gravado.
      const cancelCheckoutId = checkoutObj.id ? String(checkoutObj.id) : null

      if (!cancelUserId) {
        log('ERROR: revogação recebida mas não foi possível identificar o usuário', {
          eventType,
          externalId: cancelExternalId,
          sub,
        })
        return new Response(JSON.stringify({ received: true, error: 'unresolved_metadata' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
      const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      })

      const { data: cancelled, error: cancelError } = await admin.rpc('cancel_subscription', {
        p_user_id: cancelUserId,
        p_abacate_subscription_id: cancelSubscriptionId,
        p_abacate_checkout_id: cancelCheckoutId,
        p_status: revocationStatus,
      })

      if (cancelError) {
        log('ERROR: rpc cancel_subscription falhou', cancelError)
        return new Response(JSON.stringify({ error: 'Failed to revoke subscription' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      log('subscription revoked', {
        userId: cancelUserId,
        subscriptionId: cancelSubscriptionId,
        checkoutId: cancelCheckoutId,
        status: revocationStatus,
        applied: cancelled,
      })
      return new Response(JSON.stringify({ received: true, cancelled }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!ACTIVATION_EVENTS.has(eventType)) {
      log('SKIP: evento não tratado por esta função', { eventType })
      return new Response(JSON.stringify({ received: true, skipped: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // externalId e metadata vêm em data.checkout (ver checkoutObj acima).
    const externalId = (checkoutObj.externalId ?? sub.externalId ?? dataRoot.externalId ?? null) as string | null
    let parsed = parseExternalId(externalId)

    if (!parsed) {
      const metadata = (checkoutObj.metadata ?? sub.metadata ?? dataRoot.metadata ?? {}) as Record<string, unknown>
      const userId = metadata.user_id ? String(metadata.user_id) : null
      const planType = metadata.plan_type ? String(metadata.plan_type) : null
      const billingPeriod = metadata.billing_period ? String(metadata.billing_period) : 'monthly'
      if (userId && planType) {
        parsed = { userId, planType, billingPeriod }
      }
    }

    if (!parsed) {
      log('ERROR: não foi possível identificar o usuário/plano no payload — precisa de ajuste manual no parsing', {
        eventType,
        externalId,
        sub,
      })
      // 200 para o AbacatePay não retentar um payload que nunca vai conseguirmos processar
      // sem antes corrigir o código — mas fica registrado no log para investigação.
      return new Response(JSON.stringify({ received: true, error: 'unresolved_metadata' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { userId, planType, billingPeriod } = parsed
    const billingInterval = billingPeriod === 'annual' ? 'year' : 'month'
    const isAnnualCheckout = eventType === 'checkout.completed'

    // Checkout avulso (anual): não é uma "assinatura" AbacatePay, então não tem
    // abacate_subscription_id — guardamos só o id do checkout (bill_...).
    const abacateSubscriptionId = !isAnnualCheckout && sub.id ? String(sub.id) : null
    // CONFIRMADO via payload real: customer.id (cust_...) vem em data.customer,
    // irmão de data.subscription — checkout.customerId observado sempre null.
    const customerObj = (dataRoot.customer ?? {}) as Record<string, unknown>
    const customerIdRaw = customerObj.id ?? checkoutObj.customerId ?? sub.customerId ?? null
    const abacateCustomerId = customerIdRaw ? String(customerIdRaw) : null
    // CONFIRMADO via payload real: id do bill (bill_...) vem em data.checkout.id
    // em ambos os eventos (subscription.completed e checkout.completed).
    const abacateCheckoutId = checkoutObj.id ? String(checkoutObj.id) : null

    // AJUSTAR: nome real do campo de próxima cobrança de assinatura mensal
    // não confirmado na documentação.
    let currentPeriodEnd = sub.nextBillingDate ? String(sub.nextBillingDate) : null

    // Checkout anual é pagamento único — não existe "próxima cobrança" vinda da
    // AbacatePay. Calculamos nós mesmos: acesso válido por 1 ano a partir de agora.
    if (isAnnualCheckout && !currentPeriodEnd) {
      const oneYearFromNow = new Date()
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
      currentPeriodEnd = oneYearFromNow.toISOString()
    }

    // CONFIRMADO via payload real: checkout.completed não tem "method" singular —
    // o método vem em checkout.methods (array, ex.: ["CARD"] ou ["PIX"]).
    // installmentsCount ainda não confirmado (só vimos pagamento à vista em
    // teste); mantemos leitura best-effort.
    let paymentKind: 'recurring_card' | 'pix' | 'installments' = 'recurring_card'
    if (isAnnualCheckout) {
      const installmentsCount = Number(checkoutObj.installmentsCount ?? 0)
      const methods = Array.isArray(checkoutObj.methods) ? (checkoutObj.methods as unknown[]) : []
      const usedPix = methods.some((m) => String(m).toUpperCase() === 'PIX')
      if (usedPix) {
        paymentKind = 'pix'
      } else if (installmentsCount > 1) {
        paymentKind = 'installments'
      }
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data: subscriptionId, error } = await admin.rpc('start_subscription', {
      p_user_id: userId,
      p_plan_code: planType,
      p_payment_kind: paymentKind,
      p_billing_interval: billingInterval,
      p_trial_days: 0,
      p_abacate_subscription_id: abacateSubscriptionId,
      p_abacate_customer_id: abacateCustomerId,
      p_abacate_checkout_id: abacateCheckoutId,
      p_current_period_end: currentPeriodEnd,
    })

    if (error) {
      log('ERROR: rpc start_subscription falhou', error)
      // 500 para o AbacatePay tentar reenviar o evento depois.
      return new Response(JSON.stringify({ error: 'Failed to activate subscription' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    log('subscription activated', { userId, planType, billingInterval, paymentKind, subscriptionId })

    return new Response(JSON.stringify({ received: true, subscription_id: subscriptionId }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    log('UNEXPECTED ERROR', err instanceof Error ? err.message : String(err))
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
