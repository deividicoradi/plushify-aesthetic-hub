import { createClient } from 'npm:@supabase/supabase-js@2'
import { buildCorsHeaders } from '../_shared/cors.ts'

type Action = 'connect' | 'qr' | 'status' | 'disconnect'

function sessionNameFor(userId: string) {
  return `t-${userId}`
}

Deno.serve(async (req) => {
  const corsHeaders = {
    ...buildCorsHeaders(req.headers.get('origin')),
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return json({ error: 'Unauthorized' }, 401)
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const OPENWA_BASE_URL = Deno.env.get('OPENWA_BASE_URL')!
    const OPENWA_API_KEY = Deno.env.get('OPENWA_API_KEY')!

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })
    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token)
    if (claimsError || !claimsData?.claims?.sub) {
      return json({ error: 'Unauthorized' }, 401)
    }
    const userId = claimsData.claims.sub as string

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { action } = (await req.json().catch(() => ({}))) as { action?: Action }
    if (!action || !['connect', 'qr', 'status', 'disconnect'].includes(action)) {
      return json({ error: 'Ação inválida' }, 400)
    }

    const sessionName = sessionNameFor(userId)
    const owaHeaders = {
      'X-Api-Key': OPENWA_API_KEY,
      'Content-Type': 'application/json',
    }
    const owaFetch = (path: string, init: RequestInit = {}) =>
      fetch(`${OPENWA_BASE_URL}${path}`, {
        ...init,
        headers: { ...owaHeaders, ...(init.headers ?? {}) },
      })

    if (action === 'connect') {
      // Ensure the wa_sessions row exists for this tenant.
      await admin
        .from('wa_sessions')
        .upsert({ tenant_id: userId, session_name: sessionName, status: 'connecting' }, { onConflict: 'tenant_id' })

      // Create the OpenWA session if it doesn't exist yet (idempotent-ish: ignore 409/already-exists).
      const createRes = await owaFetch('/api/sessions', {
        method: 'POST',
        body: JSON.stringify({ name: sessionName }),
      })
      if (!createRes.ok && createRes.status !== 409) {
        const detail = await createRes.text()
        console.error('whatsapp-proxy: create session failed', createRes.status, detail)
        return json({ error: 'Falha ao criar sessão do WhatsApp' }, 502)
      }

      const startRes = await owaFetch(`/api/sessions/${sessionName}/start`, { method: 'POST' })
      if (!startRes.ok) {
        const detail = await startRes.text()
        console.error('whatsapp-proxy: start session failed', startRes.status, detail)
        return json({ error: 'Falha ao iniciar sessão do WhatsApp' }, 502)
      }

      return json({ success: true })
    }

    if (action === 'qr') {
      const qrRes = await owaFetch(`/api/sessions/${sessionName}/qr`)
      if (!qrRes.ok) {
        const detail = await qrRes.text()
        console.error('whatsapp-proxy: qr fetch failed', qrRes.status, detail)
        return json({ error: 'QR Code ainda não disponível' }, 202)
      }
      const data = await qrRes.json()
      return json({ success: true, qr: data })
    }

    if (action === 'status') {
      const statusRes = await owaFetch(`/api/sessions/${sessionName}/status`)
      if (!statusRes.ok) {
        return json({ error: 'Falha ao consultar status' }, 502)
      }
      const data = await statusRes.json()
      const connected = data?.status === 'connected' || data?.connected === true

      await admin
        .from('wa_sessions')
        .update({
          status: connected ? 'connected' : 'connecting',
          phone_number: data?.phoneNumber ?? data?.phone ?? null,
          connected_at: connected ? new Date().toISOString() : null,
        })
        .eq('tenant_id', userId)

      return json({ success: true, status: data })
    }

    if (action === 'disconnect') {
      await owaFetch(`/api/sessions/${sessionName}/logout`, { method: 'POST' }).catch(() => null)
      await owaFetch(`/api/sessions/${sessionName}`, { method: 'DELETE' }).catch(() => null)

      await admin
        .from('wa_sessions')
        .update({ status: 'disconnected', phone_number: null, connected_at: null })
        .eq('tenant_id', userId)

      return json({ success: true })
    }

    return json({ error: 'Ação não implementada' }, 400)
  } catch (err) {
    console.error('whatsapp-proxy: unexpected error', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
