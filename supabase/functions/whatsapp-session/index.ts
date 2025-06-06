
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WhatsAppConfig {
  instanceId: string;
  apiKey: string;
  baseUrl: string;
}

// Configuração da Evolution API - você pode usar suas próprias credenciais
const getWhatsAppConfig = (): WhatsAppConfig => {
  return {
    instanceId: Deno.env.get('EVOLUTION_INSTANCE_ID') || 'plushify-instance',
    apiKey: Deno.env.get('EVOLUTION_API_KEY') || '',
    baseUrl: Deno.env.get('EVOLUTION_BASE_URL') || 'https://evolution-api.com'
  };
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, sessionId } = await req.json();
    const config = getWhatsAppConfig();

    console.log(`WhatsApp Action: ${action}, SessionId: ${sessionId}`);

    switch (action) {
      case 'start':
        return await startWhatsAppSession(config);
      
      case 'status':
        return await getSessionStatus(config, sessionId);
      
      case 'logout':
        return await logoutSession(config, sessionId);
      
      case 'send':
        const { number, message } = await req.json();
        return await sendMessage(config, number, message);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Ação inválida' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Erro na função WhatsApp:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function startWhatsAppSession(config: WhatsAppConfig) {
  try {
    // Criar instância na Evolution API
    const createInstanceResponse = await fetch(`${config.baseUrl}/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': config.apiKey,
      },
      body: JSON.stringify({
        instanceName: config.instanceId,
        token: config.apiKey,
        qrcode: true,
        number: '',
        webhook: `${Deno.env.get('SUPABASE_URL')}/functions/v1/whatsapp-webhook`,
        webhook_by_events: true,
        events: ['APPLICATION_STARTUP', 'QRCODE_UPDATED', 'CONNECTION_UPDATE', 'MESSAGES_UPSERT']
      })
    });

    if (!createInstanceResponse.ok) {
      const errorData = await createInstanceResponse.text();
      console.error('Erro ao criar instância:', errorData);
    }

    // Conectar instância
    const connectResponse = await fetch(`${config.baseUrl}/instance/connect/${config.instanceId}`, {
      method: 'GET',
      headers: {
        'apikey': config.apiKey,
      }
    });

    const connectData = await connectResponse.json();
    
    if (connectData.base64) {
      return new Response(
        JSON.stringify({
          success: true,
          qr: connectData.base64,
          sessionId: config.instanceId,
          message: 'QR Code gerado com sucesso'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      throw new Error('Falha ao gerar QR Code');
    }
  } catch (error) {
    console.error('Erro ao iniciar sessão:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro ao iniciar sessão WhatsApp',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function getSessionStatus(config: WhatsAppConfig, sessionId?: string) {
  try {
    const instanceId = sessionId || config.instanceId;
    
    const response = await fetch(`${config.baseUrl}/instance/connectionState/${instanceId}`, {
      method: 'GET',
      headers: {
        'apikey': config.apiKey,
      }
    });

    const data = await response.json();
    
    return new Response(
      JSON.stringify({
        status: data.instance?.state || 'close',
        sessionId: instanceId,
        message: data.instance?.state === 'open' ? 'Conectado' : 'Desconectado'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    return new Response(
      JSON.stringify({ 
        status: 'error',
        error: 'Erro ao verificar status',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function logoutSession(config: WhatsAppConfig, sessionId?: string) {
  try {
    const instanceId = sessionId || config.instanceId;
    
    const response = await fetch(`${config.baseUrl}/instance/logout/${instanceId}`, {
      method: 'DELETE',
      headers: {
        'apikey': config.apiKey,
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Sessão encerrada com sucesso'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro ao encerrar sessão',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function sendMessage(config: WhatsAppConfig, number: string, message: string) {
  try {
    const response = await fetch(`${config.baseUrl}/message/sendText/${config.instanceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': config.apiKey,
      },
      body: JSON.stringify({
        number: number,
        options: {
          delay: 1200,
          presence: 'composing',
          linkPreview: false
        },
        textMessage: {
          text: message
        }
      })
    });

    const data = await response.json();
    
    return new Response(
      JSON.stringify({
        success: true,
        messageId: data.key?.id,
        message: 'Mensagem enviada com sucesso'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro ao enviar mensagem',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
