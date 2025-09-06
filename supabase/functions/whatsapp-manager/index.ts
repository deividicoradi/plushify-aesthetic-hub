import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WHATSAPP_SERVER_URL = 'http://31.97.30.241:8787';

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

    const { pathname } = new URL(req.url);
    const method = req.method;
    const xRequestPath = req.headers.get('X-Request-Path') || req.headers.get('x-request-path') || '';

    // Rotas da API
    if (method === 'GET') {
      if (xRequestPath.startsWith('messages') || pathname.includes('messages')) {
        return await getMessages(supabase, user.id, req, token);
      }
      if (xRequestPath.startsWith('contacts') || pathname.includes('contacts')) {
        return await getContacts(supabase, user.id, token);
      }
      return await getSessionStatus(supabase, user.id, token);
    }
    
    if (method === 'POST') {
      let body;
      try {
        body = await req.json();
      } catch (error) {
        console.error('Erro ao fazer parse do JSON:', error);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Dados JSON inválidos no corpo da requisição' 
          }), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { action } = body;
      console.log('Ação solicitada:', action, 'para usuário:', user.id);
      
      switch (action) {
        case 'connect':
          return await initiateConnection(supabase, user.id, token);
        case 'disconnect':
          return await disconnectSession(supabase, user.id, token);
        case 'send-message':
          return await sendMessage(supabase, user.id, body, token);
        case 'get-contacts':
          return await getContacts(supabase, user.id, token);
        case 'get-qr':
          return await getQRCode(supabase, user.id, token);
        case 'simulate-message':
          return await simulateIncomingMessage(supabase, user.id, body.sessionId || 'default-session');
        default:
          console.error('Ação inválida:', action);
          return new Response(
            JSON.stringify({
              success: false,
              error: `Ação inválida: ${action}. Ações válidas: connect, disconnect, send-message, get-contacts, get-qr, simulate-message`
            }), 
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
      }
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Método não suportado. Use GET para status ou POST para ações.'
      }), 
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('WhatsApp Manager Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: `Erro interno do servidor: ${error.message}`,
        stack: error.stack
      }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function getSessionStatus(supabase: any, userId: string, token: string) {
  try {
    console.log('Getting WhatsApp session status for user:', userId);
    
    // Verificar sessão no banco
    const { data: session, error: sessionError } = await supabase
      .from('whatsapp_sessoes')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (sessionError) {
      console.error('Erro ao buscar sessão no banco:', sessionError);
    }

    console.log('Database session:', session ? { id: session.id, status: session.status } : 'nenhuma');

    // Verificar status no servidor real apenas se há uma sessão no banco
    let serverStatus = null;
    let serverConnected = false;
    
    if (session) {
      try {
        console.log('Verificando status no servidor WhatsApp...');
        
        // Tenta primeiro /status, depois fallback para raiz /
        let response = await fetch(`${WHATSAPP_SERVER_URL}/status`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          signal: AbortSignal.timeout(5000) // 5 segundos timeout reduzido
        });
        
        if (!response.ok) {
          console.log('Tentando endpoint alternativo...');
          response = await fetch(`${WHATSAPP_SERVER_URL}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            signal: AbortSignal.timeout(5000)
          });
        }

        console.log('Server response status:', response.status);

        if (response.ok) {
          serverStatus = await response.json();
          serverConnected = true;
          console.log('Server status data:', serverStatus);
          
          // Atualizar status no banco se necessário
          if (session && session.status !== serverStatus.status) {
            console.log(`Atualizando status no banco: ${session.status} -> ${serverStatus.status}`);
            await supabase
              .from('whatsapp_sessoes')
              .update({ 
                status: serverStatus.status,
                sessao_serializada: JSON.stringify(serverStatus),
                atualizado_em: new Date().toISOString()
              })
              .eq('user_id', userId);
          }
        } else {
          console.error('Server error response:', response.status, response.statusText);
          const errorText = await response.text();
          console.error('Server error details:', errorText);
        }
      } catch (serverError) {
        console.error('Error connecting to WhatsApp server:', serverError.message);
        console.log('Servidor WhatsApp não está disponível. Para usar WhatsApp real, configure o servidor conforme documentação.');
        // Se o servidor não responder, usar status do banco mas marcar como desconectado
        if (session) {
          await supabase
            .from('whatsapp_sessoes')
            .update({ 
              status: 'desconectado',
              atualizado_em: new Date().toISOString()
            })
            .eq('user_id', userId);
        }
      }
    } else {
      console.log('Nenhuma sessão encontrada no banco, servidor não será verificado');
    }
    
    // Se temos dados do servidor, usar eles
    if (serverStatus && serverConnected) {
      return new Response(
        JSON.stringify({ 
          status: serverStatus.status || 'desconectado',
          sessionId: session?.id || null,
          qrCode: serverStatus.qrCode || null,
          ready: serverStatus.ready || false,
          serverConnected: true,
          message: serverStatus.ready ? 'WhatsApp conectado e pronto' : 'WhatsApp em processo de conexão'
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
    } catch (e) {
      console.error('Erro ao fazer parse da sessão serializada:', e);
    }

    const finalStatus = session?.status || 'desconectado';
    console.log('Retornando status final:', finalStatus);

    return new Response(
      JSON.stringify({ 
        status: serverConnected ? finalStatus : 'desconectado',
        sessionId: session?.id || null,
        qrCode,
        ready: false,
        serverConnected: false,
        message: 'Servidor WhatsApp não disponível. Para conectar ao WhatsApp real, configure o servidor conforme documentação em docs/whatsapp-server/'
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
        ready: false,
        serverConnected: false,
        error: error.message
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function initiateConnection(supabase: any, userId: string, token: string) {
  try {
    console.log('Initiating WhatsApp connection for user:', userId);
    
    // Verificar se já existe uma sessão ativa
    const { data: existingSession } = await supabase
      .from('whatsapp_sessoes')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'conectado')
      .maybeSingle();

    if (existingSession) {
      console.log('Existing active session found');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Sessão já conectada',
          sessionId: existingSession.id,
          status: 'conectado'
        }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Solicitar conexão ao servidor real (tenta /connect, fallback para raiz com action)
    console.log('Making connection request to WhatsApp server');
    let response = await fetch(`${WHATSAPP_SERVER_URL}/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      response = await fetch(`${WHATSAPP_SERVER_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'connect' })
      });
    }

    console.log('Server connection response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server error:', response.status, errorText);
      throw new Error(`Servidor WhatsApp retornou erro: ${response.status} - ${errorText}`);
    }

    const serverResponse = await response.json();
    console.log('Server response data:', serverResponse);
    
    // Criar ou atualizar sessão no banco
    const { data: newSession, error } = await supabase
      .from('whatsapp_sessoes')
      .upsert({
        user_id: userId,
        status: serverResponse.status || 'pareando',
        sessao_serializada: JSON.stringify(serverResponse),
        atualizado_em: new Date().toISOString()
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Erro ao salvar sessão:', error);
    }

    console.log('Connection initiated successfully:', {
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
    // Desconectar no servidor real (tenta /disconnect, fallback para raiz)
    let response = await fetch(`${WHATSAPP_SERVER_URL}/disconnect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    }).catch(() => null);

    if (!response || !response.ok) {
      response = await fetch(`${WHATSAPP_SERVER_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'disconnect' })
      }).catch(() => null);
    }

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

  console.log('Iniciando envio de mensagem:', { phone, message: message?.substring(0, 50) + '...', userId });

  if (!phone || !message) {
    console.error('Parâmetros obrigatórios não fornecidos:', { phone: !!phone, message: !!message });
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Telefone e mensagem são obrigatórios' 
      }), 
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Verificar se há sessão conectada
    const { data: session, error: sessionError } = await supabase
      .from('whatsapp_sessoes')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    console.log('Sessão encontrada:', { 
      hasSession: !!session, 
      status: session?.status,
      sessionError: sessionError?.message 
    });

    if (sessionError) {
      console.error('Erro ao buscar sessão:', sessionError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Erro ao verificar sessão do WhatsApp' 
        }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!session || session.status !== 'conectado') {
      console.error('WhatsApp não conectado:', { 
        hasSession: !!session, 
        status: session?.status 
      });
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'WhatsApp não está conectado. Conecte primeiro antes de enviar mensagens.' 
        }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Tentar enviar mensagem via servidor WhatsApp
    console.log('Tentando enviar mensagem via servidor WhatsApp...');
    
    let response;
    let lastError;

    // Primeira tentativa: /send
    try {
      console.log('Tentativa 1: /send');
      response = await fetch(`${WHATSAPP_SERVER_URL}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ phone, message })
      });
      
      console.log('Resposta /send:', { status: response.status, ok: response.ok });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Sucesso /send:', result);
        
        if (result.success || result.messageId) {
          await saveMessageToDatabase(supabase, userId, phone, message, contactName, result.messageId);
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Mensagem enviada com sucesso',
              messageId: result.messageId 
            }), 
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    } catch (error) {
      console.error('Erro na tentativa /send:', error);
      lastError = error;
    }

    // Segunda tentativa: /send-message
    try {
      console.log('Tentativa 2: /send-message');
      response = await fetch(`${WHATSAPP_SERVER_URL}/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ phone, message })
      });
      
      console.log('Resposta /send-message:', { status: response.status, ok: response.ok });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Sucesso /send-message:', result);
        
        if (result.success || result.messageId) {
          await saveMessageToDatabase(supabase, userId, phone, message, contactName, result.messageId);
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Mensagem enviada com sucesso',
              messageId: result.messageId 
            }), 
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    } catch (error) {
      console.error('Erro na tentativa /send-message:', error);
      lastError = error;
    }

    // Terceira tentativa: raiz com action
    try {
      console.log('Tentativa 3: / com action');
      response = await fetch(`${WHATSAPP_SERVER_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'send-message', phone, message })
      });
      
      console.log('Resposta / com action:', { status: response.status, ok: response.ok });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Sucesso / com action:', result);
        
        if (result.success || result.messageId) {
          await saveMessageToDatabase(supabase, userId, phone, message, contactName, result.messageId);
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Mensagem enviada com sucesso',
              messageId: result.messageId 
            }), 
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    } catch (error) {
      console.error('Erro na tentativa / com action:', error);
      lastError = error;
    }

    // Se chegou até aqui, todas as tentativas falharam
    console.error('Todas as tentativas de envio falharam. Última resposta:', {
      status: response?.status,
      statusText: response?.statusText
    });

    // Tentar obter detalhes do erro da resposta
    let errorMessage = 'Falha ao enviar mensagem via WhatsApp';
    if (response) {
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        console.error('Erro ao parse da resposta de erro:', e);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: false,
        error: `${errorMessage}. Status: ${response?.status || 'desconhecido'}` 
      }), 
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro geral ao enviar mensagem:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: `Erro interno: ${error.message}` 
      }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function saveMessageToDatabase(supabase: any, userId: string, phone: string, message: string, contactName: string, messageId: string) {
  try {
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
      const { error: messageError } = await supabase
        .from('whatsapp_mensagens_temp')
        .insert({
          user_id: userId,
          contato_id: contact.id,
          direcao: 'enviada',
          conteudo: message,
          tipo: 'text',
          status: 'enviada'
        });

      if (messageError) {
        console.error('Erro ao salvar mensagem:', messageError);
      }

      // Atualizar última interação do contato
      await supabase
        .from('whatsapp_contatos')
        .update({ ultima_interacao: new Date().toISOString() })
        .eq('id', contact.id);
    }
  } catch (error) {
    console.error('Erro ao salvar mensagem no banco:', error);
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

async function getContacts(supabase: any, userId: string, token?: string) {
  try {
    // Primeiro, tentar buscar contatos do servidor WhatsApp real
    if (token) {
      try {
        const response = await fetch(`${WHATSAPP_SERVER_URL}/contacts`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          signal: AbortSignal.timeout(5000) // 5 segundos timeout
        });
      
      if (response.ok) {
        const serverData = await response.json();
        console.log('Contatos do servidor WhatsApp:', serverData.contacts?.length || 0);
        
        // Sincronizar contatos do servidor com o banco
        if (serverData.contacts && serverData.contacts.length > 0) {
          for (const contact of serverData.contacts) {
            await supabase
              .from('whatsapp_contatos')
              .upsert({
                user_id: userId,
                nome: contact.name || contact.phone,
                telefone: contact.phone,
                ultima_interacao: contact.lastInteraction || new Date().toISOString()
              }, { onConflict: 'user_id,telefone' });
          }
        }
        
        return new Response(
          JSON.stringify({ contacts: serverData.contacts || [] }), 
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
        } catch (serverError) {
          console.log('Servidor WhatsApp não disponível, usando dados do banco:', serverError.message);
        }
      }
    
    // Fallback: buscar contatos do banco de dados
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
        contacts: contacts || [],
        serverStatus: 'offline',
        message: 'Contatos carregados do banco de dados. Para sincronizar com WhatsApp real, conecte o servidor WhatsApp.' 
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro ao buscar contatos:', error);
    return new Response(
      JSON.stringify({ 
        contacts: [],
        error: error.message 
      }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
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

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Mensagem simulada criada com sucesso' 
    }), 
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getQRCode(supabase: any, userId: string, token: string) {
  try {
    console.log('Getting QR Code for user:', userId);
    
    // Tenta obter QR do GET /qr, senão tenta /status e depois /
    let response = await fetch(`${WHATSAPP_SERVER_URL}/qr`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      response = await fetch(`${WHATSAPP_SERVER_URL}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });
    }

    if (!response.ok) {
      response = await fetch(`${WHATSAPP_SERVER_URL}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });
    }

    console.log('QR Code status response:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('QR Code status error:', response.status, errorText);
      throw new Error(`Servidor WhatsApp retornou erro: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('QR from status:', result?.qrCode ? 'present' : 'absent');
    
    const qr = result?.qrCode || null;

    if (qr) {
      // Atualizar sessão com QR Code
      await supabase
        .from('whatsapp_sessoes')
        .upsert({
          user_id: userId,
          status: result.status || 'pareando',
          sessao_serializada: JSON.stringify({ qrCode: qr }),
          atualizado_em: new Date().toISOString()
        }, { onConflict: 'user_id' });
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        qrCode: qr
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro ao buscar QR Code:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: `Erro ao buscar QR Code: ${error.message}` 
      }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}