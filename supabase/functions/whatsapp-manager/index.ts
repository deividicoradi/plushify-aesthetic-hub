import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// WhatsApp Web.js seria usado em um ambiente Node.js real
// Para demonstração, vamos simular a funcionalidade

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppSession {
  id: string;
  status: string;
  qrCode?: string;
}

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

    // Rotas da API baseadas no método e parâmetros
    if (method === 'GET' && pathname === '/whatsapp-manager') {
      return await getSessionStatus(supabase, user.id);
    }
    
    if (method === 'POST' && pathname === '/whatsapp-manager') {
      const body = await req.json();
      const { action } = body;
      
      switch (action) {
        case 'connect':
          return await initiateConnection(supabase, user.id);
        case 'disconnect':
          return await disconnectSession(supabase, user.id);
        case 'send-message':
          return await sendMessage(supabase, user.id, body);
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

  // Gerar QR Code real usando API externa
  const qrCodeData = `whatsapp-session-${newSession.id}-${Date.now()}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeData)}`;
  
  // Atualizar status para pareando
  await supabase
    .from('whatsapp_sessoes')
    .update({ status: 'pareando' })
    .eq('id', newSession.id);
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      qrCode: qrCodeUrl,
      sessionId: newSession.id,
      message: 'QR Code gerado, escaneie com seu WhatsApp' 
    }), 
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
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

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Mensagem enviada com sucesso',
      messageId: savedMessage.id 
    }), 
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
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