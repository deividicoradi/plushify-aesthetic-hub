import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppSession {
  id: string;
  status: string;
  qrCode?: string;
}

interface ChatwootConfig {
  url: string;
  token: string;
  inboxId: string;
}

// Cache global para sessões ativas
const activeSessions = new Map<string, any>();

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
      return new Response('Invalid authentication', { status: 401, headers: corsHeaders });
    }

    const { pathname } = new URL(req.url);
    const method = req.method;

    // Rotas da API
    if (method === 'GET' && pathname === '/whatsapp-manager') {
      return await getSessionStatus(supabase, user.id);
    }
    
    if (method === 'POST') {
      const body = await req.json();
      const { action } = body;
      
      switch (action) {
        case 'connect':
          return await initiateConnection(supabase, user.id);
        case 'disconnect':
          return await disconnectSession(supabase, user.id);
        case 'send-message':
          return await sendMessage(supabase, user.id, body);
        case 'chatwoot-webhook':
          return await handleChatwootWebhook(supabase, body);
        default:
          return new Response('Invalid action', { status: 400, headers: corsHeaders });
      }
    }
    
    if (method === 'GET' && pathname.startsWith('/whatsapp-manager/messages')) {
      return await getMessages(supabase, user.id, req);
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

async function getSessionStatus(supabase: any, userId: string) {
  const { data: session } = await supabase
    .from('whatsapp_sessoes')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  return new Response(
    JSON.stringify({ 
      status: session?.status || 'desconectado',
      sessionId: session?.id || null 
    }), 
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function initiateConnection(supabase: any, userId: string) {
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

    // Criar nova sessão
    const { data: newSession, error } = await supabase
      .from('whatsapp_sessoes')
      .insert({
        user_id: userId,
        status: 'conectando'
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Inicializar WhatsApp Web.js (simulado para Deno)
    const sessionId = `session_${userId}_${newSession.id}`;
    
    // Simular inicialização do cliente WhatsApp
    console.log(`Inicializando WhatsApp Web.js para usuário ${userId}`);
    
    // Configurar webhook do Chatwoot
    await setupChatwootIntegration(supabase, userId, newSession.id);
    
    // Gerar QR Code
    const qrCodeData = `whatsapp-session-${newSession.id}-${Date.now()}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeData)}`;
    
    // Atualizar status para pareando
    await supabase
      .from('whatsapp_sessoes')
      .update({ 
        status: 'pareando',
        sessao_serializada: JSON.stringify({ sessionId, qrCode: qrCodeUrl })
      })
      .eq('id', newSession.id);

    // Simular processo de QR Code scan
    setTimeout(async () => {
      await supabase
        .from('whatsapp_sessoes')
        .update({ status: 'conectado' })
        .eq('id', newSession.id);
      
      console.log(`WhatsApp conectado para usuário ${userId}`);
      
      // Iniciar monitoramento de mensagens
      await startMessageMonitoring(supabase, userId, newSession.id);
    }, 10000); // Simular 10 segundos para conexão
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        qrCode: qrCodeUrl,
        sessionId: newSession.id,
        message: 'QR Code gerado, escaneie com seu WhatsApp' 
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro ao iniciar conexão WhatsApp:', error);
    throw error;
  }
}

async function disconnectSession(supabase: any, userId: string) {
  const { error } = await supabase
    .from('whatsapp_sessoes')
    .update({ status: 'desconectado' })
    .eq('user_id', userId);

  if (error) {
    throw error;
  }

  return new Response(
    JSON.stringify({ success: true, message: 'Sessão desconectada' }), 
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function sendMessage(supabase: any, userId: string, body: any) {
  const { phone, message, contactName } = body;

  if (!phone || !message) {
    return new Response(
      JSON.stringify({ error: 'Telefone e mensagem são obrigatórios' }), 
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

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
        throw contactError;
      }
      contact = newContact;
    }

    // Buscar sessão ativa
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

    // Enviar mensagem via WhatsApp Web.js (simulado)
    console.log(`Enviando mensagem para ${phone}: ${message}`);
    
    // Simular envio da mensagem
    const success = await sendWhatsAppMessage(userId, phone, message);
    
    if (!success) {
      throw new Error('Falha ao enviar mensagem via WhatsApp');
    }

    // Salvar mensagem no banco
    const { data: savedMessage, error: messageError } = await supabase
      .from('whatsapp_mensagens')
      .insert({
        user_id: userId,
        contato_id: contact.id,
        sessao_id: session.id,
        direcao: 'enviada',
        conteudo: message,
        tipo: 'texto',
        status: 'enviada'
      })
      .select()
      .single();

    if (messageError) {
      throw messageError;
    }

    // Atualizar última interação do contato
    await supabase
      .from('whatsapp_contatos')
      .update({ ultima_interacao: new Date().toISOString() })
      .eq('id', contact.id);

    // Enviar para Chatwoot
    await sendToChatwoot(supabase, userId, contact, message, 'outgoing');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Mensagem enviada com sucesso',
        messageId: savedMessage.id 
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    return new Response(
      JSON.stringify({ error: 'Erro ao enviar mensagem: ' + error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function getMessages(supabase: any, userId: string, req: Request) {
  const url = new URL(req.url);
  const contactId = url.searchParams.get('contactId');
  const limit = parseInt(url.searchParams.get('limit') || '50');

  let query = supabase
    .from('whatsapp_mensagens')
    .select(`
      *,
      whatsapp_contatos (
        id,
        nome,
        telefone
      )
    `)
    .eq('user_id', userId)
    .order('horario', { ascending: false })
    .limit(limit);

  if (contactId) {
    query = query.eq('contato_id', contactId);
  }

  const { data: messages, error } = await query;

  if (error) {
    throw error;
  }

  return new Response(
    JSON.stringify({ messages: messages || [] }), 
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// ==================== FUNÇÕES DE INTEGRAÇÃO CHATWOOT ====================

async function setupChatwootIntegration(supabase: any, userId: string, sessionId: string) {
  console.log(`Configurando integração Chatwoot para usuário ${userId}`);
  
  // Aqui você pode buscar configurações do Chatwoot do usuário no banco
  // Por ora, vamos usar configurações padrão (seria configurável pelo usuário)
  
  return true;
}

async function sendToChatwoot(supabase: any, userId: string, contact: any, message: string, direction: 'incoming' | 'outgoing') {
  try {
    // Buscar configurações do Chatwoot do usuário
    // Por ora, vamos simular o envio
    console.log(`Enviando para Chatwoot - Usuário: ${userId}, Contato: ${contact.nome}, Mensagem: ${message}, Direção: ${direction}`);
    
    // Aqui seria a integração real com Chatwoot via Axios
    // const chatwootResponse = await axios.post(`${chatwootUrl}/api/v1/accounts/${accountId}/conversations`, {...});
    
    return true;
  } catch (error) {
    console.error('Erro ao enviar para Chatwoot:', error);
    return false;
  }
}

async function handleChatwootWebhook(supabase: any, body: any) {
  try {
    const { message_type, conversation, content } = body;
    
    // Ignorar mensagens que não são de saída (outgoing)
    if (message_type !== 'outgoing') {
      return new Response('OK', { status: 200, headers: corsHeaders });
    }
    
    // Extrair número do WhatsApp da conversa
    const whatsappNumber = conversation?.meta?.sender?.phone_number || 
                          conversation?.meta?.sender?.identifier;
    
    if (!whatsappNumber || !content) {
      return new Response('Invalid webhook data', { status: 400, headers: corsHeaders });
    }
    
    // Buscar usuário pela configuração do Chatwoot
    // Por ora, vamos usar um usuário padrão
    const userId = conversation?.account_id; // Isso seria mapeado corretamente
    
    if (userId) {
      // Enviar mensagem via WhatsApp
      await sendWhatsAppMessage(userId, whatsappNumber, content);
    }
    
    return new Response('OK', { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error('Erro no webhook Chatwoot:', error);
    return new Response('Error', { status: 500, headers: corsHeaders });
  }
}

async function startMessageMonitoring(supabase: any, userId: string, sessionId: string) {
  console.log(`Iniciando monitoramento de mensagens para usuário ${userId}`);
  
  // Simular recebimento de mensagens do WhatsApp
  setInterval(async () => {
    // Aqui seria o listener real do whatsapp-web.js
    // client.on('message', async (msg) => { ... });
    
    console.log(`Monitorando mensagens para sessão ${sessionId}`);
  }, 30000); // Check a cada 30 segundos
}

async function sendWhatsAppMessage(userId: string, phone: string, message: string): Promise<boolean> {
  try {
    // Aqui seria o envio real via whatsapp-web.js
    // const chatId = phone.includes('@c.us') ? phone : `${phone}@c.us`;
    // await client.sendMessage(chatId, message);
    
    console.log(`Simulando envio WhatsApp - Usuário: ${userId}, Para: ${phone}, Mensagem: ${message}`);
    
    return true;
  } catch (error) {
    console.error('Erro ao enviar mensagem WhatsApp:', error);
    return false;
  }
}