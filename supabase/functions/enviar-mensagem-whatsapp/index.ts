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

    // Authenticate user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
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

    const { phone, message, contactName }: SendMessageRequest = await req.json();

    // Validate inputs
    if (!phone || !message) {
      return new Response(
        JSON.stringify({ error: 'Phone and message are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has an active session
    const { data: session, error: sessionError } = await supabaseClient
      .from('whatsapp_sessions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session || session.status !== 'conectado') {
      return new Response(
        JSON.stringify({ 
          error: 'WhatsApp não conectado',
          message: 'Por favor, conecte seu WhatsApp primeiro'
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sessionName = session.session_id;

    // Format phone number (remove special characters, keep only digits)
    const formattedPhone = phone.replace(/[^\\d]/g, '');
    
    // Add country code if not present (assuming Brazil +55)
    let fullPhone = formattedPhone;
    if (!fullPhone.startsWith('55') && fullPhone.length <= 11) {
      fullPhone = '55' + fullPhone;
    }

    console.log('Sending message via WPPConnect:', { sessionName, phone: fullPhone });

    // Send message via WPPConnect
    const wppResponse = await fetch(`${WPP_SERVER_URL}/api/${sessionName}/send-text`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WPP_SERVER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: fullPhone,
        message: message,
        isGroup: false
      })
    });

    const wppData = await wppResponse.json();
    console.log('WPPConnect send response:', wppData);

    if (!wppResponse.ok) {
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao enviar mensagem',
          details: wppData 
        }),
        { status: wppResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Save message to database (using legacy whatsapp_messages if exists, or create simple log)
    try {
      // Try to save to whatsapp_messages table
      await supabaseClient
        .from('whatsapp_messages')
        .insert({
          user_id: user.id,
          session_id: sessionName,
          direction: 'sent',
          content: message,
          status: 'delivered',
          timestamp: new Date().toISOString(),
          contact_phone: fullPhone,
          contact_name: contactName || fullPhone
        });
    } catch (dbError) {
      console.error('Error saving message to DB (non-critical):', dbError);
      // Continue even if DB save fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Mensagem enviada com sucesso',
        data: wppData
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
