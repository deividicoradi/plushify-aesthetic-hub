
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

// Configuração da Evolution API
const getWhatsAppConfig = (): WhatsAppConfig => {
  return {
    instanceId: Deno.env.get('EVOLUTION_INSTANCE_ID') || 'plushify-instance',
    apiKey: Deno.env.get('EVOLUTION_API_KEY') || 'your-api-key-here',
    baseUrl: Deno.env.get('EVOLUTION_BASE_URL') || 'https://api.z-api.io'
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
    // Para fins de demonstração, vou gerar um QR Code mock
    // Em produção, você deve usar uma API real como Z-API ou Evolution API
    const mockQRCode = generateMockQRCode();
    
    console.log('Gerando QR Code para sessão WhatsApp...');
    
    return new Response(
      JSON.stringify({
        success: true,
        qr: mockQRCode,
        sessionId: config.instanceId,
        message: 'QR Code gerado com sucesso'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
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
    
    // Simular verificação de status
    // Em produção, fazer chamada real para a API
    return new Response(
      JSON.stringify({
        status: 'close', // 'open' quando conectado
        sessionId: instanceId,
        message: 'Aguardando conexão'
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
    
    console.log(`Encerrando sessão: ${instanceId}`);
    
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
    console.log(`Enviando mensagem para ${number}: ${message}`);
    
    return new Response(
      JSON.stringify({
        success: true,
        messageId: 'mock-message-id',
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

// Função para gerar QR Code mock (SVG)
function generateMockQRCode(): string {
  const qrCodeSvg = `
    <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="white"/>
      <!-- QR Code pattern mock -->
      <rect x="10" y="10" width="20" height="20" fill="black"/>
      <rect x="40" y="10" width="20" height="20" fill="black"/>
      <rect x="80" y="10" width="20" height="20" fill="black"/>
      <rect x="110" y="10" width="20" height="20" fill="black"/>
      <rect x="170" y="10" width="20" height="20" fill="black"/>
      
      <rect x="10" y="40" width="20" height="20" fill="black"/>
      <rect x="80" y="40" width="20" height="20" fill="black"/>
      <rect x="140" y="40" width="20" height="20" fill="black"/>
      <rect x="170" y="40" width="20" height="20" fill="black"/>
      
      <rect x="10" y="70" width="20" height="20" fill="black"/>
      <rect x="40" y="70" width="20" height="20" fill="black"/>
      <rect x="80" y="70" width="20" height="20" fill="black"/>
      <rect x="140" y="70" width="20" height="20" fill="black"/>
      
      <rect x="40" y="100" width="20" height="20" fill="black"/>
      <rect x="110" y="100" width="20" height="20" fill="black"/>
      <rect x="140" y="100" width="20" height="20" fill="black"/>
      <rect x="170" y="100" width="20" height="20" fill="black"/>
      
      <rect x="10" y="130" width="20" height="20" fill="black"/>
      <rect x="70" y="130" width="20" height="20" fill="black"/>
      <rect x="110" y="130" width="20" height="20" fill="black"/>
      <rect x="170" y="130" width="20" height="20" fill="black"/>
      
      <rect x="40" y="160" width="20" height="20" fill="black"/>
      <rect x="80" y="160" width="20" height="20" fill="black"/>
      <rect x="140" y="160" width="20" height="20" fill="black"/>
      
      <rect x="10" y="190" width="20" height="20" fill="black"/>
      <rect x="40" y="190" width="20" height="20" fill="black"/>
      <rect x="80" y="190" width="20" height="20" fill="black"/>
      <rect x="110" y="190" width="20" height="20" fill="black"/>
      <rect x="140" y="190" width="20" height="20" fill="black"/>
      <rect x="170" y="190" width="20" height="20" fill="black"/>
      
      <!-- Corner squares -->
      <rect x="10" y="10" width="60" height="60" fill="none" stroke="black" stroke-width="3"/>
      <rect x="130" y="10" width="60" height="60" fill="none" stroke="black" stroke-width="3"/>
      <rect x="10" y="130" width="60" height="60" fill="none" stroke="black" stroke-width="3"/>
      
      <rect x="20" y="20" width="40" height="40" fill="none" stroke="black" stroke-width="2"/>
      <rect x="140" y="20" width="40" height="40" fill="none" stroke="black" stroke-width="2"/>
      <rect x="20" y="140" width="40" height="40" fill="none" stroke="black" stroke-width="2"/>
      
      <rect x="30" y="30" width="20" height="20" fill="black"/>
      <rect x="150" y="30" width="20" height="20" fill="black"/>
      <rect x="30" y="150" width="20" height="20" fill="black"/>
    </svg>
  `;
  
  // Converter SVG para data URL
  const base64 = btoa(qrCodeSvg);
  return `data:image/svg+xml;base64,${base64}`;
}
