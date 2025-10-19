import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-verify',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const QR_WEBHOOK_VERIFY_TOKEN = Deno.env.get('QR_WEBHOOK_VERIFY_TOKEN');
    
    // Verify webhook token
    const verifyToken = req.headers.get('x-verify');
    if (!verifyToken || verifyToken !== QR_WEBHOOK_VERIFY_TOKEN) {
      console.error('Invalid webhook verification token');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload = await req.json();
    console.log('Webhook received:', JSON.stringify(payload, null, 2));

    const { session, event, qrcode, status } = payload;

    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Session name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract user_id from session name (format: user_<uuid>)
    const userId = session.replace('user_', '');

    console.log('Processing webhook for user:', userId);

    // Map WPPConnect status to our status
    let sessionStatus = 'desconectado';
    if (status === 'CONNECTED' || event === 'qrReadSuccess') {
      sessionStatus = 'conectado';
    } else if (status === 'QRCODE' || event === 'qrReadCode') {
      sessionStatus = 'pareando';
    } else if (status === 'DISCONNECTED' || event === 'disconnected') {
      sessionStatus = 'desconectado';
    }

    // Find existing session
    const { data: existingSession } = await supabaseAdmin
      .from('whatsapp_sessions')
      .select('*')
      .eq('user_id', userId)
      .single();

    const sessionData: any = {
      status: sessionStatus,
      last_activity: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Add QR code if present
    if (qrcode) {
      sessionData.qr_code = qrcode;
    }

    if (existingSession) {
      // Update existing session
      const { error: updateError } = await supabaseAdmin
        .from('whatsapp_sessions')
        .update(sessionData)
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating session:', updateError);
        throw updateError;
      }

      console.log('Session updated:', userId, sessionStatus);
    } else {
      // Create new session (shouldn't happen normally)
      sessionData.user_id = userId;
      sessionData.session_id = session;

      const { error: insertError } = await supabaseAdmin
        .from('whatsapp_sessions')
        .insert(sessionData);

      if (insertError) {
        console.error('Error creating session:', insertError);
        throw insertError;
      }

      console.log('Session created:', userId, sessionStatus);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Webhook processed successfully',
        status: sessionStatus
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in whatsapp-qr-webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
