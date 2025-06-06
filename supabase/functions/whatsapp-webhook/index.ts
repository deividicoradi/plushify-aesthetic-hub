
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('WhatsApp Webhook recebido:', JSON.stringify(body, null, 2));

    // Processar diferentes tipos de eventos
    switch (body.event) {
      case 'qrcode.updated':
        console.log('QR Code atualizado:', body.data);
        break;

      case 'connection.update':
        console.log('Status de conexão atualizado:', body.data);
        break;

      case 'messages.upsert':
        console.log('Nova mensagem recebida:', body.data);
        // Aqui você pode processar mensagens recebidas
        // Por exemplo, salvar no banco de dados ou enviar respostas automáticas
        break;

      default:
        console.log('Evento não tratado:', body.event);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro no webhook WhatsApp:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro ao processar webhook',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
