import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WHATSAPP_SERVER_URL = 'https://whatsapp.plushify.com.br';

serve(async (req) => {
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
      return new Response('Authorization header missing', { status: 401, headers: corsHeaders });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Invalid authentication', details: authError?.message }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const { pathname } = new URL(req.url);
    const method = req.method;
    const xRequestPath = req.headers.get('X-Request-Path') || req.headers.get('x-request-path') || '';

    // Rotas da API
    if (method === 'GET') {
      if (xRequestPath.startsWith('messages') || pathname.includes('messages')) {
        return await getMessages(supabase, user.id, req, token);
      }
      if (xRequestPath.startsWith('contacts') || pathname.includes('contacts')) {
        return await getContacts(supabase, user.id);
      }
      return await getSessionStatus(supabase, user.id, token);
    }
    
    if (method === 'POST') {
      const body = await req.json();
      const { action } = body;
      
      switch (action) {
        case 'connect':
          return await initiateConnection(supabase, user.id, token);
        case 'disconnect':
          return await disconnectSession(supabase, user.id, token);
        case 'send-message':
          return await sendMessage(supabase, user.id, body, token);
        case 'get-contacts':
          return await getContacts(supabase, user.id);
        case 'simulate-message':
          return await simulateIncomingMessage(supabase, user.id, body.sessionId || 'default-session');
        default:
          return new Response('Invalid action', { status: 400, headers: corsHeaders });
      }
    }
    
    return new Response('Not found', { status: 404, headers: corsHeaders });
  } catch (error) {
    console.error('WhatsApp Manager Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function getSessionStatus(supabase: any, userId: string, token: string) {
  try {
    // Verificar sessão no banco
    const { data: session } = await supabase
      .from('whatsapp_sessoes')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    // Verificar status no servidor real
    const response = await fetch(`${WHATSAPP_SERVER_URL}/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    });

    if (response.ok) {
      const serverStatus = await response.json();
      
      // Atualizar status no banco se necessário
      if (session && session.status !== serverStatus.status) {
        await supabase
          .from('whatsapp_sessoes')
          .update({ 
            status: serverStatus.status,
            sessao_serializada: JSON.stringify(serverStatus),
            atualizado_em: new Date().toISOString()
          })
          .eq('user_id', userId);
      }

      return new Response(
        JSON.stringify({ 
          status: serverStatus.status || 'desconectado',
          sessionId: session?.id || null,
          qrCode: serverStatus.qrCode || null,
          ready: serverStatus.ready || false
        }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Se o servidor não responder, usar dados do banco
    let qrCode: string | null = null;
    try {
      if (session?.sessao_serializada) {
        const meta = JSON.parse(session.sessao_serializada);
        qrCode = meta?.qrCode ?? null;
      }
    } catch (_) {}

    return new Response(
      JSON.stringify({ 
        status: session?.status || 'desconectado',
        sessionId: session?.id || null,
        qrCode,
        ready: false
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error getting session status:', error);
    return new Response(
      JSON.stringify({ 
        status: 'desconectado',
        sessionId: null,
        qrCode: null,
        ready: false
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function initiateConnection(supabase: any, userId: string, token: string) {
  try {
    // Verificar se já existe uma sessão ativa
    const { data: existingSession } = await supabase
      .from('whatsapp_sessoes')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'conectado')
      .maybeSingle();

    if (existingSession) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Sessão já conectada',
          sessionId: existingSession.id 
        }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Solicitar conexão ao servidor real
    const response = await fetch(`${WHATSAPP_SERVER_URL}/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      throw new Error(`Servidor WhatsApp retornou erro: ${response.status}`);
    }

    const serverResponse = await response.json();
    
    // Criar ou atualizar sessão no banco
    const { data: newSession, error } = await supabase
      .from('whatsapp_sessoes')
      .upsert({
        user_id: userId,
        status: serverResponse.status || 'pareando',
        sessao_serializada: JSON.stringify(serverResponse)
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar sessão:', error);
    }

    console.log('Conexão WhatsApp iniciada:', {
      success: serverResponse.success,
      sessionId: newSession?.id,
      status: serverResponse.status,
      hasQrCode: !!serverResponse.qrCode
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        qrCode: serverResponse.qrCode,
        sessionId: newSession?.id || serverResponse.sessionId,
        status: serverResponse.status,
        message: serverResponse.message || 'Conexão iniciada com sucesso'
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro ao iniciar conexão WhatsApp:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: `Erro ao conectar: ${error.message}` 
      }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function disconnectSession(supabase: any, userId: string, token: string) {
  try {
    // Desconectar no servidor real (se existir endpoint)
    const response = await fetch(`${WHATSAPP_SERVER_URL}/disconnect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    }).catch(() => null); // Ignorar erros de rede

    // Atualizar status no banco independente da resposta do servidor
    const { error } = await supabase
      .from('whatsapp_sessoes')
      .update({ 
        status: 'desconectado',
        sessao_serializada: null,
        atualizado_em: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Erro ao atualizar status no banco:', error);
    }

    const serverResponse = response.ok ? await response.json() : { success: true };

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: serverResponse.message || 'Sessão desconectada' 
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro ao desconectar:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: `Erro ao desconectar: ${error.message}` 
      }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function sendMessage(supabase: any, userId: string, body: any, token: string) {
  const { phone, message, contactName } = body;

  if (!phone || !message) {
    return new Response(
      JSON.stringify({ error: 'Telefone e mensagem são obrigatórios' }), 
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Verificar se há sessão conectada
    const { data: session } = await supabase
      .from('whatsapp_sessoes')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'conectado')
      .maybeSingle();

    if (!session) {
      return new Response(
        JSON.stringify({ error: 'WhatsApp não conectado' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Enviar mensagem via servidor real
    const response = await fetch(`${WHATSAPP_SERVER_URL}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        phone: phone,
        message: message
      })
    });

    if (!response.ok) {
      throw new Error(`Servidor retornou erro: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Falha ao enviar mensagem');
    }

    // Buscar ou criar contato
    let { data: contact } = await supabase
      .from('whatsapp_contatos')
      .select('*')
      .eq('user_id', userId)
      .eq('telefone', phone)
      .maybeSingle();

    if (!contact) {
      const { data: newContact, error: contactError } = await supabase
        .from('whatsapp_contatos')
        .insert({
          user_id: userId,
          nome: contactName || phone,
          telefone: phone,
          ultima_interacao: new Date().toISOString()
        })
        .select()
        .single();

      if (contactError) {
        console.error('Erro ao criar contato:', contactError);
      } else {
        contact = newContact;
      }
    }

    // Salvar mensagem no banco se temos o contato
    if (contact) {
      const { data: savedMessage, error: messageError } = await supabase
        .from('whatsapp_mensagens_temp')
        .insert({
          user_id: userId,
          contato_id: contact.id,
          direcao: 'enviada',
          conteudo: message,
          tipo: 'text',
          status: 'enviada'
        })
        .select()
        .single();

      if (messageError) {
        console.error('Erro ao salvar mensagem:', messageError);
      }

      // Atualizar última interação do contato
      await supabase
        .from('whatsapp_contatos')
        .update({ ultima_interacao: new Date().toISOString() })
        .eq('id', contact.id);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Mensagem enviada com sucesso',
        messageId: result.messageId 
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: `Erro ao enviar mensagem: ${error.message}` 
      }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function getMessages(supabase: any, userId: string, req: Request, token: string) {
  const url = new URL(req.url);
  let contactId = url.searchParams.get('contactId') || '';
  let limit = parseInt(url.searchParams.get('limit') || '50');

  // Suporte para cabeçalho X-Request-Path (quando não podemos alterar o path da Edge Function)
  const headerPath = req.headers.get('X-Request-Path') || req.headers.get('x-request-path') || '';
  if (headerPath) {
    const qs = headerPath.split('?')[1];
    if (qs) {
      const params = new URLSearchParams(qs);
      contactId = params.get('contactId') || contactId;
      limit = parseInt(params.get('limit') || String(limit));
    }
  }

  const serverUrl = new URL(`${WHATSAPP_SERVER_URL}/messages`);
  if (contactId) serverUrl.searchParams.set('contactId', contactId);
  serverUrl.searchParams.set('limit', String(limit));

  const response = await fetch(serverUrl.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
  });

  if (!response.ok) {
    throw new Error(`Servidor retornou erro: ${response.status}`);
  }

  const result = await response.json();

  return new Response(
    JSON.stringify({ messages: result.messages || [] }), 
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getContacts(supabase: any, userId: string) {
  const { data: contacts, error } = await supabase
    .from('whatsapp_contatos')
    .select('*')
    .eq('user_id', userId)
    .order('ultima_interacao', { ascending: false });

  if (error) {
    throw error;
  }

  return new Response(
    JSON.stringify({ contacts: contacts || [] }), 
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function simulateIncomingMessage(supabase: any, userId: string, sessionId: string) {
  // Simular mensagem recebida (para teste)
  const mockMessages = [
    { phone: '5511999999999', message: 'Olá, gostaria de informações sobre seus serviços!' },
    { phone: '5511888888888', message: 'Bom dia! Posso agendar um horário?' }
  ];

  const randomMessage = mockMessages[Math.floor(Math.random() * mockMessages.length)];
  
  // Buscar ou criar contato
  let { data: contact } = await supabase
    .from('whatsapp_contatos')
    .select('*')
    .eq('user_id', userId)
    .eq('telefone', randomMessage.phone)
    .maybeSingle();

  if (!contact) {
    const { data: newContact } = await supabase
      .from('whatsapp_contatos')
      .insert({
        user_id: userId,
        nome: randomMessage.phone,
        telefone: randomMessage.phone,
        ultima_interacao: new Date().toISOString()
      })
      .select()
      .single();
    contact = newContact;
  }

  // Salvar mensagem recebida
  await supabase
    .from('whatsapp_mensagens_temp')
    .insert({
      user_id: userId,
      contato_id: contact.id,
      direcao: 'recebida',
      conteudo: randomMessage.message,
      tipo: 'text',
      status: 'recebida'
    });

  console.log(`Mensagem simulada recebida de ${randomMessage.phone}: ${randomMessage.message}`);
}