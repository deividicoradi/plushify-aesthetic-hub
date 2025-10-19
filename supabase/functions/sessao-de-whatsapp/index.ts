import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      console.warn('Unauthorized: invalid JWT');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authorized user:', user.id);

    const WPP_SERVER_URL = Deno.env.get('WPP_SERVER_URL') || 'http://127.0.0.1:21465';
    const WPP_SECRET_TOKEN = Deno.env.get('WPP_SECRET_TOKEN') || 'THISISMYSECURETOKEN';

    const sessionName = `plushify-${user.id}`;
    console.log('Creating session:', sessionName);

    // Step 1: Generate bcrypt token
    const tokenResponse = await fetch(`${WPP_SERVER_URL}/api/${sessionName}/${WPP_SECRET_TOKEN}/generate-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.text();
      console.error('Token generation failed:', tokenError);
      return new Response(
        JSON.stringify({ error: 'Falha ao gerar token', details: tokenError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tokenData = await tokenResponse.json();
    const bcryptToken = tokenData.token;
    console.log('Token generated successfully');

    // Step 2: Start session with bcrypt token
    const startResponse = await fetch(`${WPP_SERVER_URL}/api/${sessionName}/start-session`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${bcryptToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        webhook: null,
        waitQrCode: true
      })
    });

    if (!startResponse.ok) {
      const startError = await startResponse.text();
      console.error('Session start failed:', startError);
      return new Response(
        JSON.stringify({ error: 'Falha ao iniciar sessão', details: startError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const startData = await startResponse.json();
    console.log('Session started:', startData.state);

    // Step 3: Save to database
    const { data: existingSession } = await supabaseClient
      .from('whatsapp_sessions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const sessionData = {
      user_id: user.id,
      session_id: sessionName,
      token_bcrypt: bcryptToken,
      status: startData.state === 'CONNECTED' ? 'conectado' : 'pareando',
      qr_code: startData.qrcode || null,
      server_url: WPP_SERVER_URL,
      last_activity: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (existingSession) {
      await supabaseClient
        .from('whatsapp_sessions')
        .update(sessionData)
        .eq('user_id', user.id);
    } else {
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
          qr_code: startData.qrcode,
          state: startData.state
        },
        message: startData.state === 'CONNECTED' 
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
