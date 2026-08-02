import { createClient } from 'npm:@supabase/supabase-js@2'
import { buildCorsHeaders } from '../_shared/cors.ts'

// LGPD: cliente pede exclusão da própria conta. Anonimiza dados pessoais em
// public.* (via RPC anonymize_account_data, que roda com o JWT do próprio
// usuário) e desativa o login em auth.users com service role — não faz hard
// delete: mantém assinatura/pagamentos para obrigação fiscal/legal, só some
// com a identidade pessoal e bloqueia acesso. E-mail de confirmação é
// enviado ANTES de anonimizar o endereço.

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

    const { data: userRow } = await admin.auth.admin.getUserById(userId)
    const originalEmail = userRow?.user?.email

    // Anonimiza public.profiles + confere de novo a checagem de bloqueio
    // (defesa em profundidade — o client já checou get_account_deletion_status
    // antes de chegar aqui, mas nunca confia só nisso).
    const { error: anonError } = await userClient.rpc('anonymize_account_data')
    if (anonError) {
      return new Response(JSON.stringify({ error: anonError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Confirmação por e-mail antes de trocar o endereço — reaproveita a fila
    // de e-mail transacional já usada em notify_login/support.
    if (originalEmail) {
      try {
        let unsubToken: string | null = null
        const { data: tokenRow } = await admin
          .from('email_unsubscribe_tokens')
          .select('token')
          .eq('email', originalEmail)
          .maybeSingle()
        unsubToken = tokenRow?.token ?? null
        if (!unsubToken) {
          unsubToken = crypto.randomUUID().replace(/-/g, '')
          await admin.from('email_unsubscribe_tokens').upsert({ email: originalEmail, token: unsubToken }, { onConflict: 'email' })
        }
        const messageId = `account-deletion-${userId}-${Date.now()}`
        await admin.rpc('enqueue_email', {
          queue_name: 'transactional_emails',
          payload: {
            to: originalEmail,
            from: 'Plushify <naoresponda@notify.plushify.com.br>',
            sender_domain: 'notify.plushify.com.br',
            subject: 'Sua conta Plushify foi excluída',
            html: '<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">' +
              '<h2>Conta excluída</h2>' +
              '<p>Confirmamos a exclusão da sua conta Plushify, conforme solicitado. Seus dados pessoais foram removidos.</p>' +
              '<p style="color:#999; font-size:12px; margin-top:24px;">Se você não pediu isso, fale com plushify.suporte@gmail.com imediatamente.</p>' +
              '</div>',
            text: 'Confirmamos a exclusão da sua conta Plushify. Se você não pediu isso, fale com plushify.suporte@gmail.com imediatamente.',
            purpose: 'transactional',
            label: 'account_deletion',
            message_id: messageId,
            idempotency_key: messageId,
            unsubscribe_token: unsubToken,
            queued_at: new Date().toISOString(),
          },
        })
      } catch (emailErr) {
        console.error('[DELETE-ACCOUNT] falha ao enfileirar e-mail de confirmação', emailErr)
      }
    }

    // Desativa o login (ban de ~100 anos) e troca o e-mail por um placeholder
    // único — não faz hard delete pra não cascatear em dados financeiros que
    // precisam ser mantidos.
    const anonymizedEmail = `deleted-${userId}@deleted.plushify.com.br`
    const { error: banError } = await admin.auth.admin.updateUser(userId, {
      ban_duration: '876000h',
      email: anonymizedEmail,
      email_confirm: true,
      phone: '',
      user_metadata: {},
    })
    if (banError) {
      console.error('[DELETE-ACCOUNT] falha ao desativar login', banError)
      return new Response(JSON.stringify({ error: 'Dados anonimizados, mas falha ao desativar o login. Contate o suporte.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[DELETE-ACCOUNT] erro inesperado', err instanceof Error ? err.message : String(err))
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...buildCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' },
    })
  }
})
