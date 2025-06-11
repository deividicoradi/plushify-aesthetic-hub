import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.2.0?target=deno";
import { authenticateUser, getOrCreateCustomer } from "../_shared/stripeUtils.ts";

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
  switch (planId) {
    case 'starter': {
      const monthly = Deno.env.get('PRICE_ID_STARTER_MONTHLY');
      const yearly = Deno.env.get('PRICE_ID_STARTER_YEARLY');
      return {
        name: 'Plano Starter',
        priceId: isYearly ? (yearly ?? '') : (monthly ?? ''),
      };
    }
    case 'pro': {
      const monthly = Deno.env.get('PRICE_ID_PRO_MONTHLY');
      const yearly = Deno.env.get('PRICE_ID_PRO_YEARLY');
      return {
        name: 'Plano Pro',
        priceId: isYearly ? (yearly ?? '') : (monthly ?? ''),
      };
    }
    case 'premium': {
      const monthly = Deno.env.get('PRICE_ID_PREMIUM_MONTHLY');
      const yearly = Deno.env.get('PRICE_ID_PREMIUM_YEARLY');
      return {
        name: 'Plano Premium',
        priceId: isYearly ? (yearly ?? '') : (monthly ?? ''),
      };
    }
    default:
      throw new Error(`Plano '${planId}' não é válido`);
  }
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
    
    const origin = req.headers.get("origin") || Deno.env.get('APP_URL') || "";
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
