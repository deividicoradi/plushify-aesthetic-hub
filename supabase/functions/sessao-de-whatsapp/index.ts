import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Authenticate user using JWT from Authorization header
    const authHeader = req.headers.get('Authorization') || '';
    const hasBearer = authHeader.toLowerCase().startsWith('bearer ');
    if (!hasBearer) {
      console.warn('Unauthorized: missing Authorization Bearer header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized', reason: 'missing_bearer' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError) {
      console.warn('Unauthorized: invalid JWT', authError.message);
    }

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', reason: 'invalid_jwt' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const WPP_SERVER_URL = Deno.env.get('WPP_SERVER_URL');
    const WPP_SERVER_TOKEN = Deno.env.get('WPP_SERVER_TOKEN');

    if (!WPP_SERVER_URL || !WPP_SERVER_TOKEN) {
      console.error('WPPConnect credentials not configured');
      return new Response(
        JSON.stringify({ error: 'WPPConnect não configurado no servidor' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sessionName = `user_${user.id}`;
    console.log('Authorized user:', user.id);
    console.log('Creating/starting session:', sessionName);

    // Call WPPConnect to start session
    const wppResponse = await fetch(`${WPP_SERVER_URL}/api/${sessionName}/start-session`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WPP_SERVER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        webhook: `${Deno.env.get('SUPABASE_URL')}/functions/v1/whatsapp-qr-webhook`,
        waitQrCode: true
      })
    });

    const wppData = await wppResponse.json();
    console.log('WPPConnect response:', wppData);

    if (!wppResponse.ok) {
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao iniciar sessão no WPPConnect',
          details: wppData 
        }),
        { status: wppResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if session already exists
    const { data: existingSession } = await supabaseClient
      .from('whatsapp_sessions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const sessionData = {
      user_id: user.id,
      session_id: sessionName,
      status: wppData.state === 'CONNECTED' ? 'conectado' : 'pareando',
      qr_code: wppData.qrcode || null,
      server_url: WPP_SERVER_URL,
      last_activity: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (existingSession) {
      // Update existing session
      await supabaseClient
        .from('whatsapp_sessions')
        .update(sessionData)
        .eq('user_id', user.id);
    } else {
      // Create new session
      await supabaseClient
        .from('whatsapp_sessions')
        .insert(sessionData);
    }

    return new Response(
      JSON.stringify({
        success: true,
        session: {
          session_id: sessionName,
          status: sessionData.status,
          qr_code: wppData.qrcode,
          state: wppData.state
        },
        message: wppData.state === 'CONNECTED' 
          ? 'WhatsApp já conectado' 
          : 'Escaneie o QR Code para conectar'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in sessao-de-whatsapp:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
