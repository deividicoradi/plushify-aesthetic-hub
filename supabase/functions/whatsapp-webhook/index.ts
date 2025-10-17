import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to verify webhook signature
async function verifyWebhookSignature(payload: string, signature: string): Promise<boolean> {
  const appSecret = Deno.env.get('WHATSAPP_APP_SECRET');
  if (!appSecret) {
    console.warn('WHATSAPP_APP_SECRET not configured - signature verification skipped');
    return true; // Allow if not configured (for backward compatibility)
  }

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(appSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(payload)
    );

    const expectedSignature = 'sha256=' + Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return expectedSignature === signature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);

    // GET request - Webhook verification from Meta
    if (req.method === 'GET') {
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');

      // Verify the token matches your configured verify token
      const VERIFY_TOKEN = Deno.env.get('WHATSAPP_VERIFY_TOKEN') || 'my_verify_token';

      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('Webhook verified successfully');
        return new Response(challenge, { status: 200 });
      } else {
        console.log('Webhook verification failed');
        return new Response('Forbidden', { status: 403 });
      }
    }

    // POST request - Incoming webhook from Meta
    if (req.method === 'POST') {
      const rawBody = await req.text();
      const signature = req.headers.get('x-hub-signature-256') || '';

      // Verify webhook signature
      const isValid = await verifyWebhookSignature(rawBody, signature);
      
      if (!isValid) {
        console.error('Invalid webhook signature');
        
        // Create security alert
        await supabaseAdmin.rpc('create_wa_security_alert', {
          p_alert_type: 'WEBHOOK_SIGNATURE_FAILED',
          p_severity: 'high',
          p_description: 'Webhook signature verification failed',
          p_endpoint: '/whatsapp-webhook',
          p_metadata: {
            signature_provided: signature ? 'yes' : 'no',
            timestamp: new Date().toISOString()
          }
        });

        return new Response(JSON.stringify({ error: 'Invalid signature' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const payload = JSON.parse(rawBody);
      console.log('Received webhook:', JSON.stringify(payload, null, 2));

      // Save raw event
      const phoneNumberId = payload.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id;
      
      if (phoneNumberId) {
        await supabaseAdmin
          .from('wa_incoming_events')
          .insert({
            phone_number_id: phoneNumberId,
            payload: payload,
            received_at: new Date().toISOString()
          });
      }

      // Process messages
      const changes = payload.entry?.[0]?.changes || [];
      
      for (const change of changes) {
        const value = change.value;
        if (!value.messages) continue;

        // Find tenant by phone_number_id
        const { data: account } = await supabaseAdmin
          .from('wa_accounts')
          .select('tenant_id')
          .eq('phone_number_id', value.metadata.phone_number_id)
          .single();

        if (!account) {
          console.log('No account found for phone_number_id:', value.metadata.phone_number_id);
          continue;
        }

        const tenantId = account.tenant_id;

        // Log webhook received
        await supabaseAdmin.rpc('log_wa_audit', {
          p_tenant_id: tenantId,
          p_action: 'WEBHOOK_RECEIVED',
          p_endpoint: '/whatsapp-webhook',
          p_request_data: { message_count: value.messages.length },
          p_response_status: 200,
          p_success: true,
          p_metadata: { phone_number_id: value.metadata.phone_number_id }
        });

        // Process each message
        for (const message of value.messages) {
          const fromPhone = message.from.replace(/[^0-9]/g, '');
          const messageId = message.id;
          const timestamp = new Date(parseInt(message.timestamp) * 1000).toISOString();

          // Check if message already exists (idempotency)
          const { data: existing } = await supabaseAdmin
            .from('wa_messages')
            .select('id')
            .eq('tenant_id', tenantId)
            .eq('wa_message_id', messageId)
            .single();

          if (existing) {
            console.log('Message already processed:', messageId);
            continue;
          }

          // Get or create contact
          let contactId: string;
          const { data: existingContact } = await supabaseAdmin
            .from('wa_contacts')
            .select('id')
            .eq('tenant_id', tenantId)
            .eq('wa_id', fromPhone)
            .single();

          if (existingContact) {
            contactId = existingContact.id;
            // Update last_interaction
            await supabaseAdmin
              .from('wa_contacts')
              .update({ last_interaction: timestamp })
              .eq('id', contactId);
          } else {
            const { data: newContact } = await supabaseAdmin
              .from('wa_contacts')
              .insert({
                tenant_id: tenantId,
                wa_id: fromPhone,
                name: value.contacts?.[0]?.profile?.name || fromPhone,
                last_interaction: timestamp
              })
              .select('id')
              .single();

            contactId = newContact!.id;
          }

          // Get or create thread
          let threadId: string;
          const { data: existingThread } = await supabaseAdmin
            .from('wa_threads')
            .select('id')
            .eq('tenant_id', tenantId)
            .eq('contact_id', contactId)
            .single();

          if (existingThread) {
            threadId = existingThread.id;
          } else {
            const { data: newThread } = await supabaseAdmin
              .from('wa_threads')
              .insert({
                tenant_id: tenantId,
                contact_id: contactId,
                last_message_at: timestamp
              })
              .select('id')
              .single();

            threadId = newThread!.id;
          }

          // Extract message content based on type
          let textBody = '';
          let messageType = 'text';

          if (message.type === 'text') {
            textBody = message.text.body;
            messageType = 'text';
          } else if (message.type === 'image') {
            textBody = message.image.caption || '[Image]';
            messageType = 'image';
          } else if (message.type === 'video') {
            textBody = message.video.caption || '[Video]';
            messageType = 'video';
          } else if (message.type === 'audio') {
            textBody = '[Audio]';
            messageType = 'audio';
          } else if (message.type === 'document') {
            textBody = message.document.filename || '[Document]';
            messageType = 'document';
          } else if (message.type === 'location') {
            textBody = '[Location]';
            messageType = 'location';
          } else if (message.type === 'sticker') {
            textBody = '[Sticker]';
            messageType = 'sticker';
          }

          // Save incoming message
          await supabaseAdmin
            .from('wa_messages')
            .insert({
              tenant_id: tenantId,
              thread_id: threadId,
              direction: 'in',
              wa_message_id: messageId,
              type: messageType,
              text_body: textBody,
              status: 'delivered',
              timestamp: timestamp,
              raw_json: message
            });

          // Update thread's last_message_at
          await supabaseAdmin
            .from('wa_threads')
            .update({ last_message_at: timestamp })
            .eq('id', threadId);

          // Log message received
          await supabaseAdmin.rpc('log_wa_audit', {
            p_tenant_id: tenantId,
            p_action: 'MESSAGE_RECEIVED',
            p_endpoint: '/whatsapp-webhook',
            p_success: true,
            p_metadata: {
              message_id: messageId,
              message_type: messageType,
              from: fromPhone.substring(0, 5) + '***'
            }
          });

          console.log('Message processed successfully:', messageId);
        }

        // Process status updates (delivered, read, failed)
        if (value.statuses) {
          for (const status of value.statuses) {
            const messageId = status.id;
            const newStatus = status.status; // 'sent', 'delivered', 'read', 'failed'

            // Update message status
            await supabaseAdmin
              .from('wa_messages')
              .update({ status: newStatus })
              .eq('wa_message_id', messageId);

            console.log('Status updated:', messageId, newStatus);
          }
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response('Method not allowed', { status: 405 });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
