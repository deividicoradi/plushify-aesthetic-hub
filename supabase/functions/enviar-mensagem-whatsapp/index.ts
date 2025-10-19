import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendMessageRequest {
  phone: string;
  message: string;
  contactName?: string;
}

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

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { phone, message, contactName }: SendMessageRequest = await req.json();

    if (!phone || !message) {
      return new Response(
        JSON.stringify({ error: 'Phone e message são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        JSON.stringify({ error: 'Sessão WhatsApp não encontrada. Conecte primeiro.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (session.status !== 'conectado') {
      return new Response(
        JSON.stringify({ error: 'WhatsApp não está conectado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const WPP_SERVER_URL = session.server_url || Deno.env.get('WPP_SERVER_URL') || 'http://127.0.0.1:21465';

    // Format phone number (add 55 if needed)
    let formattedPhone = phone.replace(/\D/g, '');
    if (!formattedPhone.startsWith('55')) {
      formattedPhone = '55' + formattedPhone;
    }

    console.log('Sending message to:', formattedPhone);

    // Try send-message endpoint first
    let sendResponse = await fetch(`${WPP_SERVER_URL}/api/${session.session_id}/send-message`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.token_bcrypt}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: formattedPhone,
        message: message
      })
    });

    // If send-message fails, try send-text endpoint
    if (!sendResponse.ok) {
      console.log('Trying send-text endpoint...');
      sendResponse = await fetch(`${WPP_SERVER_URL}/api/${session.session_id}/send-text`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.token_bcrypt}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: `${formattedPhone}@c.us`,
          message: message
        })
      });
    }

    if (!sendResponse.ok) {
      const sendError = await sendResponse.text();
      console.error('Send failed:', sendError);
      return new Response(
        JSON.stringify({ error: 'Falha ao enviar mensagem', details: sendError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sendData = await sendResponse.json();
    console.log('Message sent successfully:', sendData);

    // Update last_activity
    await supabaseClient
      .from('whatsapp_sessions')
      .update({
        last_activity: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Mensagem enviada com sucesso',
        data: sendData
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in enviar-mensagem-whatsapp:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
