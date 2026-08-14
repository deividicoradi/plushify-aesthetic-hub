import { createClient } from 'npm:@supabase/supabase-js@2'
import { buildCorsHeaders } from '../_shared/cors.ts'

// Correção do relatório de bug bounty "enumeracao-usuarios-login-signup":
// antes, o front chamava supabase.auth.signUp() direto do navegador pro
// GoTrue, sem nenhum limite — um script conseguia criar contas não
// confirmadas em volume ilimitado (foi assim que duas contas de teste
// sobraram no banco durante a própria pesquisa de segurança). Esta função
// vira um proxy obrigatório: aplica rate limit por IP (reaproveitando a
// mesma infra de public_rate_limits/check_public_rate_limit já usada no
// agendamento público) antes de repassar pro signUp de verdade.
Deno.serve(async (req) => {
  const corsHeaders = {
    ...buildCorsHeaders(req.headers.get('origin')),
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, password, options } = await req.json()

    if (!email || !password) {
      return new Response(JSON.stringify({ error: { message: 'E-mail e senha são obrigatórios.' } }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // IP do chamador real (edge function recebe isso via header, algo que
    // uma RPC chamada direto via PostgREST não tem de forma confiável).
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('cf-connecting-ip')
      || 'unknown'

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Até 5 cadastros a cada 15 minutos por IP — generoso pra uso real
    // (alguém tentando de novo após erro de digitação), mas barra um
    // script criando contas em massa.
    const { data: allowed, error: rateLimitError } = await admin.rpc('check_public_rate_limit', {
      p_identifier: `ip:${ip}`,
      p_endpoint: 'signup',
      p_max_requests: 5,
      p_window_minutes: 15,
    })

    if (rateLimitError) {
      console.error('Erro ao checar rate limit de signup:', rateLimitError)
    } else if (allowed === false) {
      return new Response(
        JSON.stringify({ error: { message: 'Muitas tentativas de cadastro. Tente novamente em alguns minutos.' } }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Repassa pro signUp de verdade com a chave anon — mesmo comportamento
    // que o cliente tinha antes (confirmação por e-mail, metadata, etc),
    // só que agora atrás do rate limit acima.
    const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data, error } = await anonClient.auth.signUp({ email, password, options })

    if (error) {
      return new Response(JSON.stringify({ error: { message: error.message, status: error.status } }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Erro em secure-signup:', err)
    return new Response(JSON.stringify({ error: { message: 'Não foi possível concluir o cadastro.' } }), {
      status: 200,
      headers: { ...buildCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
    })
  }
})
