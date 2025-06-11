
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.2.0?target=deno";
import { authenticateUser } from "../_shared/stripeUtils.ts";

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
    const authHeader = req.headers.get("Authorization");
    const { user, supabase } = await authenticateUser(authHeader);

    // Inicializar Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Verificar se o usuário tem uma assinatura
    const { data: subscriber } = await supabase
      .from("subscribers")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!subscriber || !subscriber.stripe_customer_id) {
      return new Response(
        JSON.stringify({ subscribed: false }),
        { 
          status: 200, 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          } 
        }
      );
    }

    // Obter assinaturas do cliente no Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: subscriber.stripe_customer_id,
      status: 'active',
      expand: ['data.default_payment_method'],
    });

    if (subscriptions.data.length === 0) {
      // Atualizar status na base
      await supabase
        .from("subscribers")
        .update({
          subscribed: false,
          subscription_tier: null,
          subscription_end: null,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      return new Response(
        JSON.stringify({ subscribed: false }),
        { 
          status: 200, 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          } 
        }
      );
    }

    // Assinatura ativa encontrada
    const subscription = subscriptions.data[0];
    const planTier = subscription.metadata.plan_tier;
    const subscriptionEnd = new Date(subscription.current_period_end * 1000);

    // Atualizar informações na base
    await supabase
      .from("subscribers")
      .update({
        subscribed: true,
        subscription_tier: planTier,
        subscription_end: subscriptionEnd.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    return new Response(
      JSON.stringify({
        subscribed: true,
        subscription_tier: planTier,
        subscription_end: subscriptionEnd.toISOString(),
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
    return new Response(
      JSON.stringify({ error: error.message }),
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
