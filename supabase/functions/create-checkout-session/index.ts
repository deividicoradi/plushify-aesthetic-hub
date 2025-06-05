
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.2.0?target=deno";
import { corsHeaders, getPlanConfig } from './config.ts';
import { authenticateUser } from './auth.ts';
import { getOrCreateCustomer } from './customer.ts';
import { createCheckoutSession } from './checkout.ts';
import { CheckoutRequest, CheckoutResponse } from './types.ts';

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

    const requestBody: CheckoutRequest = await req.json();
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
