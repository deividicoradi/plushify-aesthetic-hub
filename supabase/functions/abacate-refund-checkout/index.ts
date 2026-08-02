import { createClient } from 'npm:@supabase/supabase-js@2'
import { buildCorsHeaders } from '../_shared/cors.ts'

// Reembolso de uma assinatura específica direto do painel admin, sem
// precisar pedir pro cliente ou mexer manualmente no painel da AbacatePay.
// Endpoint confirmado via doc oficial (docs.abacatepay.com, 2026-08-02):
//   POST https://api.abacatepay.com/v2/checkouts/refund
// Corpo exato não documentado com exemplo — usamos { id: <checkout_id> },
// padrão mais comum nas outras rotas de ação sobre um recurso já existente
// da AbacatePay. Se o campo estiver errado, a resposta de erro da própria
// API é repassada pro admin ver na hora (nunca falha silenciosamente).
//
// Só grava o resultado em user_subscriptions (via admin_mark_subscription_refunded)
// DEPOIS da AbacatePay confirmar o estorno com sucesso — nunca antes, pra não
// marcar "reembolsado" um dinheiro que na verdade não voltou.

Deno.serve(async (req) => {
  const corsHeaders = {
    ...buildCorsHeaders(req.headers.get('origin')),
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })
    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token)
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const userId = claimsData.claims.sub as string

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data: isAdmin, error: roleError } = await admin.rpc('has_role', {
      _user_id: userId,
      _role: 'admin',
    })
    if (roleError || !isAdmin) {
      return new Response(JSON.stringify({ error: 'Acesso negado: apenas administradores' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const apiKey = Deno.env.get('ABACATE_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'MISCONFIG: ABACATE_API_KEY ausente' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = (await req.json()) as { target_user_id?: string; subscription_id?: string; reason?: string }
    const targetUserId = body.target_user_id
    const subscriptionId = body.subscription_id
    if (!targetUserId || !subscriptionId) {
      return new Response(JSON.stringify({ error: 'target_user_id e subscription_id são obrigatórios' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: subRow, error: subError } = await admin
      .from('user_subscriptions')
      .select('id, abacate_checkout_id, status')
      .eq('id', subscriptionId)
      .eq('user_id', targetUserId)
      .maybeSingle()

    if (subError || !subRow) {
      return new Response(JSON.stringify({ error: 'Assinatura não encontrada' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (!subRow.abacate_checkout_id) {
      return new Response(JSON.stringify({ error: 'Essa assinatura não tem um checkout da AbacatePay associado (trial/cortesia não pode ser reembolsado)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (subRow.status === 'refunded') {
      return new Response(JSON.stringify({ error: 'Essa assinatura já foi reembolsada' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const res = await fetch('https://api.abacatepay.com/v2/checkouts/refund', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: subRow.abacate_checkout_id }),
    })
    const json = await res.json()
    if (!res.ok || json?.error) {
      return new Response(JSON.stringify({ error: json?.error ?? 'Falha ao reembolsar na AbacatePay' }), {
        status: res.status || 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Grava o resultado usando o JWT do próprio admin (não service role),
    // pra manter a checagem de MFA/has_role dentro da RPC e o registro de
    // auditoria com o admin_user_id correto.
    const { error: markError } = await userClient.rpc('admin_mark_subscription_refunded', {
      p_user_id: targetUserId,
      p_subscription_id: subscriptionId,
      p_reason: body.reason ?? null,
    })
    if (markError) {
      console.error('[ABACATE-REFUND-CHECKOUT] estorno feito na AbacatePay mas falhou ao gravar no banco', markError)
      return new Response(JSON.stringify({
        error: 'Reembolso realizado na AbacatePay, mas houve falha ao atualizar o status aqui. Avise o time técnico.',
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true, abacate: json }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[ABACATE-REFUND-CHECKOUT] erro inesperado', err instanceof Error ? err.message : String(err))
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...buildCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
    })
  }
})
