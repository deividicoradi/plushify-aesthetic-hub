import { createClient } from 'npm:@supabase/supabase-js@2'
import { buildCorsHeaders } from '../_shared/cors.ts'

// Correção do item 1 do bug bounty "enumeracao-usuarios-login-signup": o
// GoTrue retorna erros diferentes pra "senha errada" (invalid_credentials)
// e "conta existe mas e-mail não confirmado" (email_not_confirmed) — isso
// permite descobrir por tentativa e erro quais e-mails têm conta no
// Plushify. Esta função vira um proxy obrigatório de login: chama o
// signInWithPassword real internamente, mas devolve sempre a MESMA
// mensagem genérica pro cliente, seja qual for o motivo real da falha
// (senha errada, e-mail não existe, e-mail não confirmado). O motivo real
// só fica no log desta função (backend), nunca na resposta.
Deno.serve(async (req) => {
  const corsHeaders = {
    ...buildCorsHeaders(req.headers.get('origin')),
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const GENERIC_ERROR = { error: { message: 'E-mail ou senha inválidos.' } }

  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return new Response(JSON.stringify(GENERIC_ERROR), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('cf-connecting-ip')
      || 'unknown'

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Até 10 tentativas a cada 15 minutos por IP — mais generoso que o
    // signup (erro de digitação de senha é comum), mas barra força bruta.
    const { data: allowed, error: rateLimitError } = await admin.rpc('check_public_rate_limit', {
      p_identifier: `ip:${ip}`,
      p_endpoint: 'login',
      p_max_requests: 10,
      p_window_minutes: 15,
    })

    if (rateLimitError) {
      console.error('Erro ao checar rate limit de login:', rateLimitError)
    } else if (allowed === false) {
      return new Response(
        JSON.stringify({ error: { message: 'Muitas tentativas. Tente novamente em alguns minutos.' } }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data, error } = await anonClient.auth.signInWithPassword({ email, password })

    if (error || !data.session) {
      // Motivo real só no log do backend — nunca na resposta ao cliente.
      console.log(`Login falhou para ${email}: ${error?.message ?? 'sem sessão'}`)
      return new Response(JSON.stringify(GENERIC_ERROR), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({
      data: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      },
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Erro em secure-login:', err)
    return new Response(JSON.stringify(GENERIC_ERROR), {
      status: 200,
      headers: { ...buildCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
    })
  }
})
