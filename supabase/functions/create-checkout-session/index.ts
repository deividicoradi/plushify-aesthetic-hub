
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.2.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

// Types
interface CheckoutRequest {
  planId: string;
  isYearly: boolean;
}

interface PlanConfig {
  name: string;
  priceId: string;
}

interface CheckoutResponse {
  success: boolean;
  url?: string;
  sessionId?: string;
  error?: string;
}

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Plan configuration with Stripe Price IDs
const getPlanConfig = (planId: string, isYearly: boolean): PlanConfig => {
  switch(planId) {
    case 'starter':
      return {
        name: "Plano Starter",
        priceId: isYearly ? "price_1RNNv2RkF2Xmse9MjGNrg4wk" : "price_1RNNtORkF2Xmse9MudMyCXMt"
      };
    case 'pro':
      return {
        name: "Plano Pro", 
        priceId: isYearly ? "price_pro_yearly" : "price_pro_monthly" // Você precisa fornecer estes IDs
      };
    case 'premium':
      return {
        name: "Plano Premium",
        priceId: isYearly ? "price_premium_yearly" : "price_premium_monthly" // Você precisa fornecer estes IDs
      };
    default:
      throw new Error(`Plano '${planId}' não é válido`);
  }
};

// Authentication
const authenticateUser = async (authHeader: string | null) => {
  if (!authHeader) {
    throw new Error("Autorização necessária");
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Variáveis do Supabase não configuradas");
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    throw new Error("Usuário não autenticado");
  }

  console.log("✅ Usuário autenticado:", user.email);
  return { user, supabase };
};

// Customer management
const getOrCreateCustomer = async (
  stripe: Stripe,
  supabase: any,
  user: any
): Promise<string> => {
  // Verificar se o usuário já tem um cliente Stripe
  const { data: subscriber } = await supabase
    .from("subscribers")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single();
  
  let customerId = subscriber?.stripe_customer_id;

  if (!customerId) {
    console.log("🆕 Criando novo cliente Stripe");
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        user_id: user.id,
      },
    });
    customerId = customer.id;
    
    await supabase.from("subscribers").upsert({
      user_id: user.id,
      email: user.email,
      stripe_customer_id: customerId,
    });
  }

  return customerId;
};

// Checkout session creation
const createCheckoutSession = async (
  stripe: Stripe,
  customerId: string,
  planConfig: PlanConfig,
  planId: string,
  isYearly: boolean,
  userId: string,
  origin: string
): Promise<Stripe.Checkout.Session> => {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [
      {
        price: planConfig.priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/planos`,
    metadata: {
      user_id: userId,
      plan_tier: planId,
      is_yearly: isYearly ? "true" : "false",
    },
    subscription_data: {
      metadata: {
        user_id: userId,
        plan_tier: planId,
        is_yearly: isYearly ? "true" : "false",
      }
    }
  });

  console.log("✅ Sessão criada:", session.id);
  return session;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🚀 Iniciando create-checkout-session");

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY não configurada");
    }

    const authHeader = req.headers.get("Authorization");
    const { user, supabase } = await authenticateUser(authHeader);

    // Better error handling for JSON parsing
    let requestBody: CheckoutRequest;
    try {
      const bodyText = await req.text();
      console.log("📦 Request body text:", bodyText);
      
      if (!bodyText.trim()) {
        throw new Error("Corpo da requisição vazio");
      }
      
      requestBody = JSON.parse(bodyText);
    } catch (jsonError) {
      console.error("❌ Erro ao parsear JSON:", jsonError);
      throw new Error("Formato de dados inválido na requisição");
    }

    const { planId, isYearly } = requestBody;

    if (!planId) {
      throw new Error("Plano não especificado");
    }

    console.log("📋 Processando plano:", { planId, isYearly, userEmail: user.email });

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    const planConfig = getPlanConfig(planId, isYearly);
    const customerId = await getOrCreateCustomer(stripe, supabase, user);
    
    const origin = req.headers.get("origin") || "https://09df458b-dedc-46e2-af46-e15d28209b01.lovableproject.com";
    const session = await createCheckoutSession(
      stripe,
      customerId,
      planConfig,
      planId,
      isYearly,
      user.id,
      origin
    );

    const response: CheckoutResponse = { 
      success: true,
      url: session.url,
      sessionId: session.id 
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );

  } catch (error) {
    console.error("💥 Erro:", error);
    
    const errorResponse: CheckoutResponse = { 
      success: false,
      error: error.message 
    };

    return new Response(
      JSON.stringify(errorResponse),
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
