import { createClient } from 'npm:@supabase/supabase-js@2'
import { buildCorsHeaders } from '../_shared/cors.ts'

// Gestão de cupons de desconto direto do painel admin — antes só existia
// via chamada manual à API da AbacatePay. Endpoints confirmados na doc
// oficial (docs.abacatepay.com/pages/coupons/create + llms.txt, 2026-08-01):
//   POST https://api.abacatepay.com/v2/coupons/create
//   GET  https://api.abacatepay.com/v2/coupons/list
// Mesmo padrão de autenticação (Bearer ABACATE_API_KEY) já usado em
// abacate-create-checkout/abacate-create-subscription.

type ListAction = { action: 'list' }
type CreateAction = {
  action: 'create'
  code: string
  discountKind: 'PERCENTAGE' | 'FIXED'
  discount: number
  notes?: string
  maxRedeems?: number
}

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

    const body = (await req.json()) as ListAction | CreateAction

    if (body.action === 'list') {
      const res = await fetch('https://api.abacatepay.com/v2/coupons/list', {
        headers: { Authorization: `Bearer ${apiKey}` },
      })
      const json = await res.json()
      if (!res.ok || json?.error) {
        return new Response(JSON.stringify({ error: json?.error ?? 'Falha ao listar cupons' }), {
          status: res.status || 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      return new Response(JSON.stringify({ coupons: json?.data ?? [] }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (body.action === 'create') {
      const code = body.code?.trim().toUpperCase()
      if (!code) {
        return new Response(JSON.stringify({ error: 'Código do cupom é obrigatório' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      if (!['PERCENTAGE', 'FIXED'].includes(body.discountKind)) {
        return new Response(JSON.stringify({ error: 'Tipo de desconto inválido' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      if (!Number.isFinite(body.discount) || body.discount <= 0) {
        return new Response(JSON.stringify({ error: 'Valor de desconto inválido' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      if (body.discountKind === 'PERCENTAGE' && body.discount > 100) {
        return new Response(JSON.stringify({ error: 'Desconto percentual não pode passar de 100' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const res = await fetch('https://api.abacatepay.com/v2/coupons/create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          discountKind: body.discountKind,
          // AbacatePay espera o desconto percentual multiplicado por 100
          // (ex: 10% deve ser enviado como 1000) — mesma lógica de "centavos"
          // já aplicada pelo frontend para FIXED. Confirmado em teste real:
          // enviar 10 criou um cupom de 0.1% no painel deles (mesmo bug visto
          // depois nos cupons TESTE10-40, criados antes desta correção).
          discount: body.discountKind === 'PERCENTAGE' ? Math.round(body.discount * 100) : body.discount,
          notes: body.notes || undefined,
          maxRedeems: body.maxRedeems ?? -1,
        }),
      })
      const json = await res.json()
      if (!res.ok || json?.error) {
        return new Response(JSON.stringify({ error: json?.error ?? 'Falha ao criar cupom' }), {
          status: res.status || 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Auditoria: mesma tabela usada pelas outras ações administrativas
      // (promover/revogar admin, cancelar assinatura, estender trial).
      await admin.from('admin_actions_log').insert({
        admin_user_id: userId,
        target_user_id: userId, // não há "usuário-alvo" pra um cupom; usa o próprio admin como referência
        action: 'create_coupon',
        reason: body.notes ?? null,
        details: { code, discountKind: body.discountKind, discount: body.discount, maxRedeems: body.maxRedeems ?? -1 },
      })

      return new Response(JSON.stringify({ coupon: json?.data ?? null }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Ação inválida' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[ABACATE-MANAGE-COUPONS] erro inesperado', err instanceof Error ? err.message : String(err))
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...buildCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
    })
  }
})
