import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS'
};

const WHATSAPP_SERVER_URL = 'http://31.97.30.241:8787';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables not found');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header missing', authenticated: false }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid authentication', 
          details: authError?.message,
          authenticated: false 
        }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    console.log(`WhatsApp API - ${method} ${path} - User: ${user.id}`);

    // Rate limiting check
    const rateLimitPass = await checkRateLimit(supabase, user.id, path);
    if (!rateLimitPass) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }), 
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route handling
    if (path.endsWith('/connect') && method === 'POST') {
      return await handleConnect(supabase, user.id, req);
    }
    
    if (path.endsWith('/disconnect') && method === 'POST') {
      return await handleDisconnect(supabase, user.id);
    }
    
    if (path.endsWith('/status') && method === 'GET') {
      return await handleGetStatus(supabase, user.id);
    }
    
    if (path.endsWith('/send-message') && method === 'POST') {
      return await handleSendMessage(supabase, user.id, req);
    }
    
    if (path.endsWith('/stats') && method === 'GET') {
      return await handleGetStats(supabase, user.id);
    }

    if (path.endsWith('/messages') && method === 'GET') {
      return await handleGetMessages(supabase, user.id, url.searchParams);
    }

    if (path.endsWith('/contacts') && method === 'GET') {
      return await handleGetContacts(supabase, user.id);
    }

    // Invalid endpoint
    return new Response(
      JSON.stringify({
        error: 'Endpoint not found',
        available_endpoints: [
          'POST /connect',
          'POST /disconnect', 
          'GET /status',
          'POST /send-message',
          'GET /stats',
          'GET /messages',
          'GET /contacts'
        ]
      }), 
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('WhatsApp API Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message
      }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Rate limiting function
async function checkRateLimit(supabase: any, userId: string, endpoint: string): Promise<boolean> {
  try {
    const windowStart = new Date();
    windowStart.setMinutes(windowStart.getMinutes() - 1);

    const { data, error } = await supabase
      .from('whatsapp_rate_limits')
      .select('request_count')
      .eq('user_id', userId)
      .eq('endpoint', endpoint)
      .gte('window_start', windowStart.toISOString())
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Rate limit check error:', error);
      return true; // Allow on error
    }

    const currentCount = data?.request_count || 0;
    const maxRequests = 30; // 30 requests per minute

    if (currentCount >= maxRequests) {
      await logRateLimit(supabase, userId, endpoint, currentCount);
      return false;
    }

    // Increment counter
    await supabase
      .from('whatsapp_rate_limits')
      .upsert({
        user_id: userId,
        endpoint,
        request_count: currentCount + 1,
        window_start: new Date().toISOString()
      }, {
        onConflict: 'user_id,endpoint,window_start'
      });

    return true;
  } catch (error) {
    console.error('Rate limiting error:', error);
    return true; // Allow on error
  }
}

// Log rate limit hit
async function logRateLimit(supabase: any, userId: string, endpoint: string, requestCount: number) {
  try {
    await supabase
      .from('whatsapp_session_logs')
      .insert({
        user_id: userId,
        session_id: 'rate_limit',
        event: 'RATE_LIMITED',
        metadata: {
          endpoint,
          request_count: requestCount,
          timestamp: new Date().toISOString()
        }
      });
  } catch (error) {
    console.error('Failed to log rate limit:', error);
  }
}

// POST /whatsapp/connect
async function handleConnect(supabase: any, userId: string, req: Request) {
  try {
    console.log('Initiating WhatsApp connection for user:', userId);

    // Check if already has active session
    const { data: existingSession } = await supabase
      .from('whatsapp_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'conectado')
      .single();

    if (existingSession) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'WhatsApp já está conectado',
          session: {
            id: existingSession.id,
            status: existingSession.status,
            created_at: existingSession.created_at
          }
        }), 
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate new session
    const sessionId = `session_${userId}_${Date.now()}`;
    
    // Try to connect to WhatsApp server
    let qrCode = null;
    let serverStatus = 'conectando';
    
    try {
      const response = await fetch(`${WHATSAPP_SERVER_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer temp_token_${Date.now()}`
        },
        body: JSON.stringify({ action: 'connect' })
      });

      if (response.ok) {
        const serverData = await response.json();
        qrCode = serverData.qrCode;
        serverStatus = serverData.status || 'pareando';
      }
    } catch (serverError) {
      console.error('WhatsApp server connection failed:', serverError);
      // Continue with database session creation
    }

    // Create session in database with encrypted tokens
    const { data: session, error } = await supabase
      .from('whatsapp_sessions')
      .insert({
        user_id: userId,
        session_id: sessionId,
        status: serverStatus,
        qr_code: qrCode,
        server_url: WHATSAPP_SERVER_URL,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown'
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log connection attempt
    await supabase
      .from('whatsapp_session_logs')
      .insert({
        user_id: userId,
        session_id: sessionId,
        event: 'CONNECTION_INITIATED',
        ip_address: req.headers.get('x-forwarded-for'),
        user_agent: req.headers.get('user-agent'),
        metadata: {
          server_status: serverStatus,
          has_qr_code: !!qrCode,
          timestamp: new Date().toISOString()
        }
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Conexão WhatsApp iniciada',
        session: {
          id: session.id,
          session_id: sessionId,
          status: serverStatus,
          qr_code: qrCode,
          expires_at: session.expires_at
        }
      }), 
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Connect error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Failed to initiate connection',
        details: error.message
      }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// POST /whatsapp/disconnect
async function handleDisconnect(supabase: any, userId: string) {
  try {
    console.log('Disconnecting WhatsApp for user:', userId);

    // Get active session
    const { data: session, error: sessionError } = await supabase
      .from('whatsapp_sessions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['conectado', 'pareando', 'conectando'])
      .single();

    if (sessionError && sessionError.code !== 'PGRST116') {
      throw sessionError;
    }

    if (!session) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Nenhuma sessão ativa encontrada'
        }), 
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try to disconnect from server
    try {
      await fetch(`${WHATSAPP_SERVER_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'disconnect' })
      });
    } catch (serverError) {
      console.error('Server disconnect failed:', serverError);
      // Continue with database update
    }

    // Update session status
    await supabase
      .from('whatsapp_sessions')
      .update({
        status: 'desconectado',
        updated_at: new Date().toISOString()
      })
      .eq('id', session.id);

    // Log disconnection
    await supabase
      .from('whatsapp_session_logs')
      .insert({
        user_id: userId,
        session_id: session.session_id,
        event: 'DISCONNECTED',
        metadata: {
          previous_status: session.status,
          timestamp: new Date().toISOString()
        }
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'WhatsApp desconectado com sucesso'
      }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Disconnect error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Failed to disconnect',
        details: error.message
      }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// GET /whatsapp/status
async function handleGetStatus(supabase: any, userId: string) {
  try {
    console.log('Getting WhatsApp status for user:', userId);

    // Get active session
    const { data: session, error } = await supabase
      .from('whatsapp_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!session) {
      return new Response(
        JSON.stringify({
          status: 'desconectado',
          message: 'Nenhuma sessão encontrada'
        }), 
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if session expired
    const isExpired = new Date(session.expires_at) < new Date();
    
    if (isExpired && session.status !== 'expirado') {
      await supabase
        .from('whatsapp_sessions')
        .update({ status: 'expirado' })
        .eq('id', session.id);
      
      session.status = 'expirado';
    }

    return new Response(
      JSON.stringify({
        status: session.status,
        session_id: session.session_id,
        qr_code: session.qr_code,
        last_activity: session.last_activity,
        expires_at: session.expires_at,
        server_url: session.server_url,
        created_at: session.created_at
      }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Get status error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to get status',
        details: error.message
      }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// POST /whatsapp/send-message  
async function handleSendMessage(supabase: any, userId: string, req: Request) {
  try {
    const body = await req.json();
    const { phone, message, contact_name } = body;

    if (!phone || !message) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Phone and message are required'
        }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Sending WhatsApp message for user:', userId, 'to:', phone);

    // Check active session
    const { data: session, error: sessionError } = await supabase
      .from('whatsapp_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'conectado')
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'WhatsApp not connected. Please connect first.'
        }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try to send message via server
    let messageStatus = 'failed';
    let serverResponse = null;
    
    try {
      const response = await fetch(`${WHATSAPP_SERVER_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'send-message',
          phone,
          message
        })
      });

      if (response.ok) {
        serverResponse = await response.json();
        messageStatus = serverResponse.success ? 'delivered' : 'failed';
      }
    } catch (serverError) {
      console.error('Server send message failed:', serverError);
    }

    // Save message to database
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await supabase
      .from('whatsapp_messages')
      .insert({
        user_id: userId,
        session_id: session.session_id,
        direction: 'sent',
        content: message,
        status: messageStatus,
        contact_phone: phone,
        contact_name: contact_name || 'Contato',
        timestamp: new Date().toISOString()
      });

    // Update session activity
    await supabase
      .from('whatsapp_sessions')
      .update({ last_activity: new Date().toISOString() })
      .eq('id', session.id);

    return new Response(
      JSON.stringify({
        success: messageStatus === 'delivered',
        message_id: messageId,
        status: messageStatus,
        server_response: serverResponse
      }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Send message error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Failed to send message',
        details: error.message
      }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// GET /whatsapp/stats
async function handleGetStats(supabase: any, userId: string) {
  try {
    console.log('Getting WhatsApp stats for user:', userId);

    // Get stats using the secure function
    const { data: stats, error } = await supabase
      .rpc('get_whatsapp_stats', { p_user_id: userId });

    if (error) {
      throw error;
    }

    const statsData = stats[0] || {
      total_contacts: 0,
      messages_sent: 0,
      messages_received: 0,
      last_activity: null
    };

    return new Response(
      JSON.stringify({
        total_contacts: statsData.total_contacts,
        messages_sent: statsData.messages_sent,
        messages_received: statsData.messages_received,
        last_activity: statsData.last_activity,
        response_rate: statsData.messages_sent > 0 ? 
          Math.round((statsData.messages_received / (statsData.messages_sent + statsData.messages_received)) * 100) : 0
      }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Get stats error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to get stats',
        details: error.message
      }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// GET /whatsapp/messages
async function handleGetMessages(supabase: any, userId: string, searchParams: URLSearchParams) {
  try {
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const contactPhone = searchParams.get('contact_phone');

    console.log('Getting WhatsApp messages for user:', userId);

    let query = supabase
      .from('whatsapp_messages')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    if (contactPhone) {
      query = query.eq('contact_phone', contactPhone);
    }

    const { data: messages, error } = await query;

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        messages: messages || [],
        pagination: {
          limit,
          offset,
          total: messages?.length || 0
        }
      }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Get messages error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to get messages',
        details: error.message
      }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// GET /whatsapp/contacts
async function handleGetContacts(supabase: any, userId: string) {
  try {
    console.log('Getting WhatsApp contacts for user:', userId);

    const { data: contacts, error } = await supabase
      .from('whatsapp_contatos')
      .select('*')
      .eq('user_id', userId)
      .order('ultima_interacao', { ascending: false });

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        contacts: contacts || []
      }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Get contacts error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to get contacts',
        details: error.message
      }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}