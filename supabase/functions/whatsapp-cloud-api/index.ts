import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-no-log',
};

interface SendMessageRequest {
  to: string; // Phone number in E.164 format
  message: string;
  type?: 'text';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let userId: string | null = null;
  let endpoint = '';

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

    userId = user.id;
    const url = new URL(req.url);
    const path = url.pathname.replace('/whatsapp-cloud-api', '');
    endpoint = `${req.method} ${path}`;

    // Extract client info
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                      req.headers.get('cf-connecting-ip') || null;
    const userAgent = req.headers.get('user-agent') || null;

    // Rate limiting check
    const { data: rateLimitCheck } = await supabaseClient.rpc('check_wa_rate_limit', {
      p_tenant_id: user.id,
      p_endpoint: endpoint,
      p_max_requests: 60,
      p_window_minutes: 1,
      p_ip_address: ipAddress
    }).single();

    if (rateLimitCheck && !rateLimitCheck.allowed) {
      // Log rate limit exceeded
      await supabaseClient.rpc('log_wa_audit', {
        p_tenant_id: user.id,
        p_action: 'RATE_LIMIT_EXCEEDED',
        p_endpoint: endpoint,
        p_response_status: 429,
        p_ip_address: ipAddress,
        p_user_agent: userAgent,
        p_success: false,
        p_error_message: 'Rate limit exceeded',
        p_metadata: { reset_at: rateLimitCheck.reset_at }
      });

      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          reset_at: rateLimitCheck.reset_at,
          remaining: 0
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': '60',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimitCheck.reset_at).toISOString()
          } 
        }
      );
    }

    // Route: POST /send - Send message via WhatsApp Cloud API
    if (req.method === 'POST' && path === '/send') {
      const requestBody = await req.json();
      const { to, message, type = 'text' }: SendMessageRequest = requestBody;

      // Log request
      const auditLogPromise = supabaseClient.rpc('log_wa_audit', {
        p_tenant_id: user.id,
        p_action: 'SEND_MESSAGE',
        p_endpoint: endpoint,
        p_request_data: { to: to.substring(0, 5) + '***', message_length: message.length },
        p_ip_address: ipAddress,
        p_user_agent: userAgent
      });

      // Validate inputs
      if (!to || !message) {
        await auditLogPromise;
        await supabaseClient.rpc('log_wa_audit', {
          p_tenant_id: user.id,
          p_action: 'SEND_MESSAGE',
          p_endpoint: endpoint,
          p_response_status: 400,
          p_success: false,
          p_error_message: 'Missing required fields'
        });
        
        return new Response(
          JSON.stringify({ error: 'Missing required fields: to, message' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get user's WhatsApp account from wa_accounts
      const { data: account, error: accountError } = await supabaseClient
        .from('wa_accounts')
        .select('phone_number_id, token_encrypted, status')
        .eq('tenant_id', user.id)
        .eq('status', 'active')
        .single();

      if (accountError || !account) {
        await auditLogPromise;
        await supabaseClient.rpc('log_wa_audit', {
          p_tenant_id: user.id,
          p_action: 'SEND_MESSAGE',
          p_endpoint: endpoint,
          p_response_status: 404,
          p_success: false,
          p_error_message: 'No active WhatsApp account found'
        });
        
        return new Response(
          JSON.stringify({ error: 'No active WhatsApp account found. Please configure your WhatsApp Business Account first.' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Call WhatsApp Cloud API
      const waApiUrl = `https://graph.facebook.com/v18.0/${account.phone_number_id}/messages`;
      
      const waResponse = await fetch(waApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${account.token_encrypted}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to,
          type: type,
          text: {
            body: message
          }
        })
      });

      const waData = await waResponse.json();

      if (!waResponse.ok) {
        console.error('WhatsApp API Error:', waData);
        
        await auditLogPromise;
        await supabaseClient.rpc('log_wa_audit', {
          p_tenant_id: user.id,
          p_action: 'SEND_MESSAGE',
          p_endpoint: endpoint,
          p_response_status: waResponse.status,
          p_success: false,
          p_error_message: 'WhatsApp API error',
          p_metadata: { wa_error: waData }
        });
        
        return new Response(
          JSON.stringify({ error: 'Failed to send message', details: waData }),
          { status: waResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get or create contact
      const normalizedPhone = to.replace(/[^0-9]/g, '');
      let contactId: string;

      const { data: existingContact } = await supabaseClient
        .from('wa_contacts')
        .select('id')
        .eq('tenant_id', user.id)
        .eq('wa_id', normalizedPhone)
        .single();

      if (existingContact) {
        contactId = existingContact.id;
      } else {
        const { data: newContact, error: contactError } = await supabaseClient
          .from('wa_contacts')
          .insert({
            tenant_id: user.id,
            wa_id: normalizedPhone,
            name: to,
            last_interaction: new Date().toISOString()
          })
          .select('id')
          .single();

        if (contactError) {
          console.error('Error creating contact:', contactError);
          return new Response(
            JSON.stringify({ error: 'Failed to create contact' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        contactId = newContact.id;
      }

      // Get or create thread
      let threadId: string;
      const { data: existingThread } = await supabaseClient
        .from('wa_threads')
        .select('id')
        .eq('tenant_id', user.id)
        .eq('contact_id', contactId)
        .single();

      if (existingThread) {
        threadId = existingThread.id;
      } else {
        const { data: newThread, error: threadError } = await supabaseClient
          .from('wa_threads')
          .insert({
            tenant_id: user.id,
            contact_id: contactId,
            last_message_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (threadError) {
          console.error('Error creating thread:', threadError);
          return new Response(
            JSON.stringify({ error: 'Failed to create thread' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        threadId = newThread.id;
      }

      // Save message to database
      const { error: messageError } = await supabaseClient
        .from('wa_messages')
        .insert({
          tenant_id: user.id,
          thread_id: threadId,
          direction: 'out',
          wa_message_id: waData.messages?.[0]?.id || null,
          type: type,
          text_body: message,
          status: 'sent',
          timestamp: new Date().toISOString(),
          raw_json: waData
        });

      if (messageError) {
        console.error('Error saving message:', messageError);
      }

      // Update thread's last_message_at
      await supabaseClient
        .from('wa_threads')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', threadId);

      // Log successful send
      await auditLogPromise;
      await supabaseClient.rpc('log_wa_audit', {
        p_tenant_id: user.id,
        p_action: 'SEND_MESSAGE',
        p_endpoint: endpoint,
        p_response_status: 200,
        p_success: true,
        p_metadata: { 
          message_id: waData.messages?.[0]?.id,
          duration_ms: Date.now() - startTime
        }
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: waData,
          rate_limit: {
            remaining: rateLimitCheck?.remaining || 0
          }
        }),
        { 
          status: 200, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': String(rateLimitCheck?.remaining || 0)
          } 
        }
      );
    }

    // Route: GET /contacts - Get all contacts with their latest messages
    if (req.method === 'GET' && path === '/contacts') {
      const { data: contacts, error } = await supabaseClient
        .from('wa_contacts')
        .select(`
          *,
          wa_threads!inner(
            id,
            last_message_at
          )
        `)
        .eq('tenant_id', user.id)
        .order('last_interaction', { ascending: false });

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ contacts }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: GET /messages?contact_id=xxx - Get messages for a specific contact
    if (req.method === 'GET' && path === '/messages') {
      const contactId = url.searchParams.get('contact_id');
      
      if (!contactId) {
        return new Response(
          JSON.stringify({ error: 'contact_id parameter is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify contact belongs to user
      const { data: contact } = await supabaseClient
        .from('wa_contacts')
        .select('id')
        .eq('id', contactId)
        .eq('tenant_id', user.id)
        .single();

      if (!contact) {
        return new Response(
          JSON.stringify({ error: 'Contact not found or unauthorized' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get thread for this contact
      const { data: thread } = await supabaseClient
        .from('wa_threads')
        .select('id')
        .eq('tenant_id', user.id)
        .eq('contact_id', contactId)
        .single();

      if (!thread) {
        return new Response(
          JSON.stringify({ messages: [] }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get messages for this thread
      const { data: messages, error } = await supabaseClient
        .from('wa_messages')
        .select('*')
        .eq('thread_id', thread.id)
        .order('timestamp', { ascending: true });

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ messages }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route not found
    return new Response(
      JSON.stringify({ error: 'Route not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);

    // Log error
    if (userId) {
      try {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );
        
        await supabaseClient.rpc('log_wa_audit', {
          p_tenant_id: userId,
          p_action: 'ERROR',
          p_endpoint: endpoint || 'unknown',
          p_response_status: 500,
          p_success: false,
          p_error_message: error.message
        });
      } catch (logError) {
        console.error('Failed to log error:', logError);
      }
    }
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
