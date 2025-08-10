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
  client?: any;
}

interface MessageData {
  phone: string;
  message: string;
  contactName?: string;
}

// Cache global para sessões ativas e clientes WhatsApp
const activeSessions = new Map<string, WhatsAppSession>();
const messageQueue = new Map<string, MessageData[]>();

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
        case 'get-contacts':
          return await getContacts(supabase, user.id);
        case 'simulate-message':
          return await simulateIncomingMessage(supabase, user.id, body.sessionId || 'default-session');
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
      qrCode
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
    
    // Inicializar cliente WhatsApp (simulado)
    console.log(`Configurando cliente WhatsApp para usuário ${userId}`);
    
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

    // Removido auto-conectar: manter QR visível até autenticação real
    // Para produção com QR real, a conexão deve ser confirmada pelo backend Node/whatsapp-web.js
    
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

    console.log(`Mensagem enviada e salva no banco de dados`);

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

// ==================== FUNÇÕES AUXILIARES ====================

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
    .from('whatsapp_mensagens')
    .insert({
      user_id: userId,
      contato_id: contact.id,
      sessao_id: sessionId,
      direcao: 'recebida',
      conteudo: randomMessage.message,
      tipo: 'texto',
      status: 'recebida'
    });

  console.log(`Mensagem simulada recebida de ${randomMessage.phone}: ${randomMessage.message}`);
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