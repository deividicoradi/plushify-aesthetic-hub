
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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Autorização necessária");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Verificar autenticação
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Usuário não autenticado");
    }

    // Obter dados da requisição
    const { planId, isYearly } = await req.json();

    // Converter planId para preços
    let priceId;
    let planName;
    let planDescription;
    
    switch(planId) {
      case 'starter':
        planName = "Starter";
        planDescription = "Plano Starter - Ideal para profissionais individuais";
        priceId = isYearly ? "price_starter_yearly" : "price_starter_monthly";
        break;
      case 'pro':
        planName = "Pro";
        planDescription = "Plano Pro - Para profissionais em crescimento";
        priceId = isYearly ? "price_pro_yearly" : "price_pro_monthly";
        break;
      case 'premium':
        planName = "Premium";
        planDescription = "Plano Premium - Para quem tem equipe ou rede";
        priceId = isYearly ? "price_premium_yearly" : "price_premium_monthly";
        break;
      default:
        throw new Error("Plano inválido");
    }

    // Inicializar Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Verificar se o usuário já tem um cliente Stripe
    const { data: subscriber } = await supabase
      .from("subscribers")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();
    
    let customerId = subscriber?.stripe_customer_id;

    // Se não tiver, criar um
    if (!customerId) {
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
    }

    // Criar sessão de checkout
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
      success_url: `${new URL(req.url).origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${new URL(req.url).origin}/planos`,
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

    return new Response(
      JSON.stringify({ url: session.url }),
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
