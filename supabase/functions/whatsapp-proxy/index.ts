import { createClient } from 'npm:@supabase/supabase-js@2'
import { buildCorsHeaders } from '../_shared/cors.ts'

// Proxy para a Evolution API (self-hosted, whatsapp.plushify.com.br).
//
// Salvaguardas anti-banimento aplicadas aqui (ver protocolo do projeto):
// - 1 instância por tenant, nunca recriada à toa: connect() reaproveita a
//   instância existente em vez de apagar/criar de novo a cada tentativa —
//   cada create/delete é, ele mesmo, um evento de risco de detecção.
// - Nome de instância isolado por tenant_id (uuid), nunca o número de
//   telefone, para não vazar dado sensível nos logs da Evolution API.
const EVOLUTION_BASE_URL = Deno.env.get('EVOLUTION_BASE_URL') ?? 'https://whatsapp.plushify.com.br'
const EVOLUTION_API_KEY = Deno.env.get('EVOLUTION_API_KEY')!

function evoHeaders() {
  return { 'Content-Type': 'application/json', apikey: EVOLUTION_API_KEY }
}

async function evoFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${EVOLUTION_BASE_URL}${path}`, {
    ...init,
    headers: { ...evoHeaders(), ...(init?.headers ?? {}) },
  })
  const body = await res.json().catch(() => ({}))
  return { ok: res.ok, status: res.status, body }
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

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { action } = await req.json().catch(() => ({ action: null }))
    const instanceName = `tenant-${userId}`

    if (action === 'connect') {
      const { data: existing } = await admin
        .from('wa_sessions')
        .select('*')
        .eq('tenant_id', userId)
        .maybeSingle()

      // Sessão já conectada ou em andamento: não recriar, só devolver o estado.
      if (existing?.status === 'connected') {
        return new Response(JSON.stringify({ status: 'connected', phone_number: existing.phone_number }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Instância pode já existir na Evolution API de uma tentativa anterior
      // (ex.: usuário recarregou a página) — connect() reaproveita, create()
      // só roda na primeira vez. Nunca fazemos delete+create em sequência.
      const state = await evoFetch(`/instance/connectionState/${instanceName}`)
      let qrcode: { base64?: string; pairingCode?: string } | null = null

      if (state.status === 404) {
        const created = await evoFetch('/instance/create', {
          method: 'POST',
          body: JSON.stringify({ instanceName, integration: 'WHATSAPP-BAILEYS', qrcode: true }),
        })
        if (!created.ok) {
          return new Response(JSON.stringify({ error: 'Falha ao criar sessão do WhatsApp' }), {
            status: 502,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
        qrcode = created.body?.qrcode ?? null
        await admin.from('wa_sessions').upsert({
          tenant_id: userId,
          instance_name: instanceName,
          instance_token: created.body?.hash ?? null,
          status: 'connecting',
          warmup_started_at: new Date().toISOString(),
        }, { onConflict: 'tenant_id' })
      } else {
        const currentState = state.body?.instance?.state
        if (currentState !== 'open') {
          const reconnected = await evoFetch(`/instance/connect/${instanceName}`)
          qrcode = { base64: reconnected.body?.base64, pairingCode: reconnected.body?.pairingCode }
        }
        await admin.from('wa_sessions').upsert({
          tenant_id: userId,
          instance_name: instanceName,
          status: currentState === 'open' ? 'connected' : 'connecting',
        }, { onConflict: 'tenant_id' })
      }

      return new Response(JSON.stringify({ status: 'connecting', qrcode }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'status') {
      const { data: session } = await admin
        .from('wa_sessions')
        .select('*')
        .eq('tenant_id', userId)
        .maybeSingle()

      if (!session) {
        return new Response(JSON.stringify({ status: 'disconnected' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const state = await evoFetch(`/instance/connectionState/${session.instance_name}`)
      const evoState = state.body?.instance?.state

      if (evoState === 'open' && session.status !== 'connected') {
        const info = await evoFetch(`/instance/fetchInstances?instanceName=${session.instance_name}`)
        const phoneNumber = info.body?.[0]?.number ?? info.body?.[0]?.ownerJid?.split('@')[0] ?? null
        await admin
          .from('wa_sessions')
          .update({ status: 'connected', phone_number: phoneNumber, connected_at: new Date().toISOString() })
          .eq('tenant_id', userId)
        return new Response(JSON.stringify({ status: 'connected', phone_number: phoneNumber }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (evoState === 'close' && session.status === 'connected') {
        // Sessão caiu do lado do WhatsApp — nunca reconectar sozinho em loop
        // (camada de monitoramento do protocolo). O dono do salão precisa
        // re-escanear manualmente.
        await admin.from('wa_sessions').update({ status: 'disconnected' }).eq('tenant_id', userId)
        return new Response(JSON.stringify({ status: 'disconnected' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ status: session.status, phone_number: session.phone_number }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'disconnect') {
      const { data: session } = await admin
        .from('wa_sessions')
        .select('instance_name')
        .eq('tenant_id', userId)
        .maybeSingle()

      if (session) {
        await evoFetch(`/instance/logout/${session.instance_name}`, { method: 'DELETE' })
        await admin.from('wa_sessions').update({ status: 'disconnected', phone_number: null, connected_at: null }).eq('tenant_id', userId)
      }

      return new Response(JSON.stringify({ status: 'disconnected' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Ação inválida' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('whatsapp-proxy error', error)
    return new Response(JSON.stringify({ error: 'Erro interno' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
