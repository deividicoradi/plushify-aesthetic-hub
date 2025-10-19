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
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get session from database
    const { data: session, error: sessionError } = await supabaseClient
      .from('whatsapp_sessions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: 'Sessão não encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const WPP_SERVER_URL = session.server_url || Deno.env.get('WPP_SERVER_URL') || 'http://127.0.0.1:21465';

    // Check status on WPPConnect
    const statusResponse = await fetch(`${WPP_SERVER_URL}/api/${session.session_id}/status-session`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.token_bcrypt}`,
        'Content-Type': 'application/json',
      }
    });

    if (!statusResponse.ok) {
      const statusError = await statusResponse.text();
      console.error('Status check failed:', statusError);
      return new Response(
        JSON.stringify({ error: 'Falha ao verificar status', details: statusError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const statusData = await statusResponse.json();
    const newStatus = statusData.state === 'CONNECTED' ? 'conectado' : 
                      statusData.state === 'DISCONNECTED' ? 'desconectado' : 'pareando';

    // Update database if status changed
    if (newStatus !== session.status) {
      await supabaseClient
        .from('whatsapp_sessions')
        .update({
          status: newStatus,
          last_activity: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: newStatus,
        state: statusData.state,
        qrcode: statusData.qrcode
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in whatsapp-status:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
