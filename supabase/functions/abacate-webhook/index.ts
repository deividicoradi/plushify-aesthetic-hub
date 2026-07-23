import { createClient } from 'npm:@supabase/supabase-js@2'

// Recebe as notificações de pagamento do AbacatePay e ativa/renova o plano
// pago do usuário. Sem esta função, um pagamento aprovado nunca é refletido
// em user_subscriptions e o cliente fica preso no plano trial mesmo após pagar.
//
// Baseado em https://docs.abacatepay.com/pages/webhooks (consultado em 2026-07-22).
//
// Formato confirmado pela documentação:
//   { "id": "log_...", "event": "subscription.completed", "apiVersion": 2,
//     "devMode": false, "data": { "subscription": { "id": "subs_...", "amount": ...,
//     "status": "ACTIVE", "method": "CARD", "customerId": "cust_...", ... } } }
//
// Eventos disponíveis (subscription): subscription.completed, subscription.renewed,
// subscription.cancelled, subscription.trial_started.
//
// Plano anual não usa assinatura recorrente (AbacatePay não suporta Pix/parcelamento
// em recorrência) — é um checkout avulso via /v2/checkouts/create, então também
// tratamos aqui o evento `checkout.completed`. Nesse caso `data` já é o objeto
// "bill" direto (sem aninhar em "subscription"), com `id` no formato bill_...,
// `installmentsCount` e (supostamente) `method` indicando PIX ou CARD.
//
// NÃO confirmado pela documentação (validar com evento real antes de confiar):
//   - se `externalId` (o que definimos na criação do checkout) volta dentro de
//     data.subscription, ou só no objeto "bill" original — por isso o código
//     tenta os dois lugares e, como último recurso, usa `metadata`.
//   - o nome exato do campo de próxima cobrança (assumido `nextBillingDate`).
// Pontos marcados com "// AJUSTAR" são os candidatos a corrigir ao ver o payload real.
//
// Configuração necessária antes de produção:
// 1. Painel AbacatePay > Webhooks > cadastrar:
//    https://<seu-projeto>.supabase.co/functions/v1/abacate-webhook?webhookSecret=SEU_SEGREDO
// 2. `supabase secrets set ABACATE_WEBHOOK_SECRET=SEU_SEGREDO` (mesmo valor acima)
// 3. No mesmo painel de Webhooks, copie a "chave pública" (public key) da sua
//    conta AbacatePay — usada para verificar a assinatura HMAC do payload —
//    e rode `supabase secrets set ABACATE_WEBHOOK_PUBLIC_KEY=SUA_CHAVE_PUBLICA`.
//    Sem isso a função ainda funciona, mas só com a camada mais fraca (secret
//    na URL) — um log de WARN aparece até isso ser configurado.
// 4. Disparar um pagamento de teste e conferir os logs desta função no painel do Supabase.
//
// `subscription.cancelled` chama a RPC cancel_subscription, que marca
// status='cancelled' — get_user_plan() já ignora linhas não-ativas e volta
// pro trial automaticamente, então não precisa mexer em plan_type.

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

// Verificação de assinatura HMAC-SHA256 (camada forte, igual Stripe/GitHub).
// A AbacatePay assina o corpo bruto (raw body) da requisição com a chave
// pública da conta e envia em base64 no header X-Webhook-Signature.
// Isso é MAIS forte que o `webhookSecret` da query string (que pode vazar em
// logs de proxy/URL) — mantemos os dois como defesa em profundidade.
const timingSafeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return result === 0
}

const verifyHmacSignature = async (rawBody: string, publicKey: string, signatureB64: string): Promise<boolean> => {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(publicKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const mac = await crypto.subtle.sign('HMAC', key, enc.encode(rawBody))
  const computedB64 = btoa(String.fromCharCode(...new Uint8Array(mac)))
  return timingSafeEqual(computedB64, signatureB64)
}
const CANCELLATION_EVENTS = new Set(['subscription.cancelled'])

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

    // 2. Autenticidade forte via HMAC-SHA256 (X-Webhook-Signature).
    // Lemos o corpo como texto bruto primeiro — a assinatura é sobre os bytes
    // exatos recebidos, não sobre um JSON reserializado.
    const rawBody = await req.text()
    const publicKey = Deno.env.get('ABACATE_WEBHOOK_PUBLIC_KEY')
    const signatureHeader = req.headers.get('X-Webhook-Signature')

    if (publicKey && signatureHeader) {
      const validSignature = await verifyHmacSignature(rawBody, publicKey, signatureHeader)
      if (!validSignature) {
        log('AUTH: assinatura HMAC (X-Webhook-Signature) inválida')
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    } else {
      // Ainda funciona só com o webhookSecret da URL, mas é a camada mais fraca.
      // Configure ABACATE_WEBHOOK_PUBLIC_KEY (painel AbacatePay > Webhooks > sua
      // chave pública da conta) assim que possível.
      log('WARN: ABACATE_WEBHOOK_PUBLIC_KEY não configurado — validando apenas via webhookSecret na URL')
    }

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

    if (CANCELLATION_EVENTS.has(eventType)) {
      const cancelExternalId = (checkoutObj.externalId ?? sub.externalId ?? dataRoot.externalId ?? null) as string | null
      const cancelParsed = parseExternalId(cancelExternalId)
      const cancelMetadata = (checkoutObj.metadata ?? sub.metadata ?? dataRoot.metadata ?? {}) as Record<string, unknown>
      const cancelUserId = cancelParsed?.userId ?? (cancelMetadata.user_id ? String(cancelMetadata.user_id) : null)
      const cancelSubscriptionId = sub.id ? String(sub.id) : null

      if (!cancelUserId) {
        log('ERROR: cancelamento recebido mas não foi possível identificar o usuário', {
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
      })

      if (cancelError) {
        log('ERROR: rpc cancel_subscription falhou', cancelError)
        return new Response(JSON.stringify({ error: 'Failed to cancel subscription' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      log('subscription cancelled', { userId: cancelUserId, subscriptionId: cancelSubscriptionId, applied: cancelled })
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
