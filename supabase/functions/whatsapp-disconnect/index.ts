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

    const { data: session } = await supabaseClient
      .from('whatsapp_sessions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Sessão não encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const WPP_SERVER_URL = session.server_url || Deno.env.get('WPP_SERVER_URL') || 'http://127.0.0.1:21465';

    // Try to close session, logout and delete
    try {
      await fetch(`${WPP_SERVER_URL}/api/${session.session_id}/close-session`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.token_bcrypt}` }
      });
    } catch (e) {
      console.warn('close-session failed:', e.message);
    }

    try {
      await fetch(`${WPP_SERVER_URL}/api/${session.session_id}/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.token_bcrypt}` }
      });
    } catch (e) {
      console.warn('logout failed:', e.message);
    }

    try {
      await fetch(`${WPP_SERVER_URL}/api/${session.session_id}/delete-session`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session.token_bcrypt}` }
      });
    } catch (e) {
      console.warn('delete-session failed:', e.message);
    }

    // Update database
    await supabaseClient
      .from('whatsapp_sessions')
      .update({
        status: 'desconectado',
        qr_code: null,
        token_bcrypt: null,
        last_activity: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'WhatsApp desconectado com sucesso'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in whatsapp-disconnect:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
