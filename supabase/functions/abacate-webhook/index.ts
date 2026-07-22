import { createClient } from 'npm:@supabase/supabase-js@2'

// Recebe as notificações de pagamento do AbacatePay e ativa/renova o plano
// pago do usuário. Sem esta função, um pagamento aprovado nunca é refletido
// em user_subscriptions e o cliente fica preso no plano trial mesmo após pagar.
//
// IMPORTANTE — antes de ir pra produção:
// 1. Configure esta URL como webhook no painel do AbacatePay:
//    https://<seu-projeto>.supabase.co/functions/v1/abacate-webhook?webhookSecret=SEU_SEGREDO
//    (AbacatePay valida o webhook via query param `webhookSecret`, não via
//    header assinado — confirme isso no painel deles ao cadastrar a URL).
// 2. Defina o secret no Supabase: `supabase secrets set ABACATE_WEBHOOK_SECRET=SEU_SEGREDO`
// 3. Dispare um evento de teste real (ou um pagamento de R$1) e confira os logs
//    desta função — o formato exato do payload (nomes dos campos dentro de
//    `data`) precisa ser validado contra o evento real antes de confiar 100%.
//    Os pontos marcados com "// AJUSTAR" abaixo são os mais prováveis de
//    precisar de ajuste fino conforme o payload real.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const log = (step: string, details?: unknown) => {
  const suffix = details === undefined ? '' : ` - ${JSON.stringify(details)}`
  console.log(`[ABACATE-WEBHOOK] ${step}${suffix}`)
}

// Eventos que representam "cliente pagou / assinatura está ativa".
// AJUSTAR: confirmar os nomes exatos de evento no payload real do AbacatePay.
const PAID_EVENTS = new Set([
  'billing.paid',
  'subscription.paid',
  'subscription.created',
  'subscription.renewed',
  'subscription.updated',
])

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

    const body = await req.json().catch(() => null)
    if (!body) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    log('event received', body)

    // AJUSTAR: confirmar onde vive o nome do evento no payload real.
    const eventType = String(body.event ?? body.type ?? '')

    // AJUSTAR: confirmar se os dados vêm em body.data ou na raiz do payload.
    const data = (body.data ?? body) as Record<string, unknown>

    // metadata foi enviado por nós em abacate-create-subscription
    // (user_id, plan_type, billing_period) — deve voltar aqui.
    const metadata = (data.metadata ?? {}) as Record<string, unknown>
    const userId = String(metadata.user_id ?? '')
    const planType = String(metadata.plan_type ?? '')
    const billingPeriod = String(metadata.billing_period ?? 'monthly')

    if (!userId || !planType) {
      log('SKIP: payload sem metadata.user_id/plan_type — provavelmente evento não relacionado a assinatura', {
        eventType,
      })
      // Retorna 200 para o AbacatePay não ficar re-tentando um evento que não nos interessa.
      return new Response(JSON.stringify({ received: true, skipped: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!PAID_EVENTS.has(eventType)) {
      log('SKIP: evento não é de pagamento confirmado', { eventType })
      return new Response(JSON.stringify({ received: true, skipped: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const billingInterval = billingPeriod === 'annual' ? 'year' : 'month'

    // AJUSTAR: confirmar os nomes de campo abaixo contra o payload real.
    const abacateSubscriptionId = data.id ? String(data.id) : null
    const abacateCustomerId = data.customerId
      ? String(data.customerId)
      : (data.customer as Record<string, unknown> | undefined)?.id
        ? String((data.customer as Record<string, unknown>).id)
        : null
    const abacateCheckoutId = data.billId ? String(data.billId) : null
    const currentPeriodEnd = data.nextBillingDate ? String(data.nextBillingDate) : null

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data: subscriptionId, error } = await admin.rpc('start_subscription', {
      p_user_id: userId,
      p_plan_code: planType,
      p_payment_kind: 'recurring_card',
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

    log('subscription activated', { userId, planType, billingInterval, subscriptionId })

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
