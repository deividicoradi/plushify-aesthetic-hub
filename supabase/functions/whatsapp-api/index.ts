import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-no-log',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS'
};

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

    // Route handling
    if (path.endsWith('/connect') && method === 'POST') {
      return await handleConnect(supabase, user.id);
    }
    
    if (path.endsWith('/disconnect') && method === 'POST') {
      return await handleDisconnect(supabase, user.id);
    }
    
    if (path.endsWith('/status') && method === 'GET') {
      return await handleGetStatus(supabase, user.id);
    }

    // Invalid endpoint
    return new Response(
      JSON.stringify({
        error: 'Endpoint not found',
        available_endpoints: [
          'POST /connect',
          'POST /disconnect', 
          'GET /status'
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

// POST /connect - Verificar se conta WhatsApp está configurada
async function handleConnect(supabase: any, userId: string) {
  try {
    console.log('Checking WhatsApp Cloud API configuration for user:', userId);

    // Verificar se existe conta ativa configurada
    const { data: account, error } = await supabase
      .from('wa_accounts')
      .select('*')
      .eq('tenant_id', userId)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!account) {
      return new Response(
        JSON.stringify({
          success: false,
          connected: false,
          message: 'WhatsApp Cloud API não configurado. Configure suas credenciais primeiro.'
        }), 
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se as credenciais estão completas
    if (!account.waba_id || !account.phone_number_id || !account.token_encrypted) {
      return new Response(
        JSON.stringify({
          success: false,
          connected: false,
          message: 'Credenciais incompletas. Verifique WABA ID, Phone Number ID e Access Token.'
        }), 
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Testar conexão com WhatsApp Cloud API
    try {
      const testResponse = await fetch(
        `https://graph.facebook.com/v18.0/${account.phone_number_id}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${account.token_encrypted}`
          }
        }
      );

      if (!testResponse.ok) {
        const errorData = await testResponse.json();
        console.error('WhatsApp Cloud API error:', errorData);
        
        return new Response(
          JSON.stringify({
            success: false,
            connected: false,
            message: 'Falha ao conectar com WhatsApp Cloud API. Verifique suas credenciais.',
            details: errorData
          }), 
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const phoneData = await testResponse.json();
      
      return new Response(
        JSON.stringify({
          success: true,
          connected: true,
          message: 'WhatsApp Cloud API conectado com sucesso',
          account: {
            id: account.id,
            waba_id: account.waba_id,
            phone_number_id: account.phone_number_id,
            display_name: account.display_name || phoneData.display_phone_number,
            verified_name: phoneData.verified_name,
            quality_rating: phoneData.quality_rating
          }
        }), 
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (apiError) {
      console.error('WhatsApp Cloud API connection test failed:', apiError);
      return new Response(
        JSON.stringify({
          success: false,
          connected: false,
          message: 'Erro ao testar conexão com WhatsApp Cloud API',
          details: apiError.message
        }), 
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Connect error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        connected: false,
        error: 'Failed to check connection',
        details: error.message
      }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// POST /disconnect
async function handleDisconnect(supabase: any, userId: string) {
  try {
    console.log('Disconnecting WhatsApp Cloud API for user:', userId);

    // Desativar conta
    const { error } = await supabase
      .from('wa_accounts')
      .update({ status: 'inactive' })
      .eq('tenant_id', userId);

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'WhatsApp Cloud API desconectado com sucesso'
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

// GET /status
async function handleGetStatus(supabase: any, userId: string) {
  try {
    console.log('Getting WhatsApp Cloud API status for user:', userId);

    // Buscar conta ativa
    const { data: account, error } = await supabase
      .from('wa_accounts')
      .select('*')
      .eq('tenant_id', userId)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!account) {
      return new Response(
        JSON.stringify({
          status: 'disconnected',
          connected: false,
          message: 'WhatsApp Cloud API não configurado'
        }), 
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        status: 'connected',
        connected: true,
        account: {
          id: account.id,
          waba_id: account.waba_id,
          phone_number_id: account.phone_number_id,
          display_name: account.display_name,
          created_at: account.created_at,
          updated_at: account.updated_at
        }
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
