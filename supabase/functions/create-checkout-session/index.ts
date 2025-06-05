
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.2.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🚀 Iniciando create-checkout-session");

    // Verificar variáveis de ambiente
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!stripeSecretKey) {
      console.error("❌ STRIPE_SECRET_KEY não configurada");
      throw new Error("STRIPE_SECRET_KEY não configurada");
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("❌ Variáveis do Supabase não configuradas");
      throw new Error("Variáveis do Supabase não configuradas");
    }

    console.log("✅ Variáveis de ambiente verificadas");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("❌ Header de autorização não encontrado");
      throw new Error("Autorização necessária");
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Verificar autenticação
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("❌ Erro de autenticação:", authError);
      throw new Error("Usuário não autenticado");
    }

    console.log("✅ Usuário autenticado:", user.email);

    // Processar dados da requisição com melhor tratamento
    let requestBody;
    try {
      const contentType = req.headers.get("content-type");
      console.log("📋 Content-Type:", contentType);
      
      if (contentType?.includes("application/json")) {
        requestBody = await req.json();
      } else {
        const bodyText = await req.text();
        console.log("📋 Corpo como texto:", bodyText);
        
        if (bodyText && bodyText.trim() !== '') {
          requestBody = JSON.parse(bodyText);
        } else {
          throw new Error("Corpo da requisição vazio");
        }
      }
      
      console.log("📋 Dados recebidos:", requestBody);
    } catch (parseError) {
      console.error("❌ Erro ao processar dados:", parseError);
      throw new Error("Formato de dados inválido");
    }

    const { planId, isYearly } = requestBody;

    if (!planId) {
      console.error("❌ planId não fornecido:", requestBody);
      throw new Error("Plano não especificado");
    }

    console.log("📋 Processando plano:", { planId, isYearly: isYearly || false, userEmail: user.email });

    // Configurar preços da Stripe
    let priceId;
    let planName;
    
    switch(planId) {
      case 'starter':
        planName = "Starter";
        priceId = isYearly ? "price_1RNNv2RkF2Xmse9MjGNrg4wk" : "price_1RNNtORkF2Xmse9MudMyCXMt";
        break;
      case 'pro':
        planName = "Pro";
        priceId = isYearly ? "price_1RNNx3RkF2Xmse9Mz9Hu9f22" : "price_1RNNw9RkF2Xmse9MVAoYhg3u";
        break;
      case 'premium':
        planName = "Premium";
        priceId = isYearly ? "price_1RNNzFRkF2Xmse9Mr6D34kM9" : "price_1RNNxgRkF2Xmse9MGKFxwHZc";
        break;
      default:
        console.error("❌ Plano inválido recebido:", planId);
        throw new Error(`Plano '${planId}' não é válido`);
    }

    console.log("💳 Configuração do plano:", { planName, priceId, isYearly: isYearly || false });

    // Inicializar Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    console.log("✅ Stripe inicializado");

    // Verificar se o usuário já tem um cliente Stripe
    const { data: subscriber } = await supabase
      .from("subscribers")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();
    
    let customerId = subscriber?.stripe_customer_id;

    // Se não tiver, criar um
    if (!customerId) {
      console.log("🆕 Criando novo cliente Stripe para:", user.email);
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      });
      customerId = customer.id;
      
      // Salvar ID do cliente Stripe
      await supabase.from("subscribers").upsert({
        user_id: user.id,
        email: user.email,
        stripe_customer_id: customerId,
      });

      console.log("✅ Cliente Stripe criado:", customerId);
    } else {
      console.log("✅ Cliente Stripe existente:", customerId);
    }

    // Criar sessão de checkout
    console.log("🛒 Criando sessão de checkout Stripe");
    
    const origin = req.headers.get("origin") || "https://09df458b-dedc-46e2-af46-e15d28209b01.lovableproject.com";
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/planos`,
      metadata: {
        user_id: user.id,
        plan_tier: planId,
        is_yearly: isYearly ? "true" : "false",
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan_tier: planId,
          is_yearly: isYearly ? "true" : "false",
        }
      }
    });

    console.log("✅ Sessão criada com sucesso:", session.id);
    console.log("🔗 URL de checkout:", session.url);

    return new Response(
      JSON.stringify({ 
        success: true,
        url: session.url,
        sessionId: session.id 
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );

  } catch (error) {
    console.error("💥 Erro na create-checkout-session:", error);
    console.error("Stack trace:", error.stack);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        details: "Erro interno no processamento do pagamento" 
      }),
      { 
        status: 400, 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});
