
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.2.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🚀 Iniciando create-checkout-session");

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY não configurada");
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Variáveis do Supabase não configuradas");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Autorização necessária");
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Usuário não autenticado");
    }

    console.log("✅ Usuário autenticado:", user.email);

    const requestBody = await req.json();
    const { planId, isYearly } = requestBody;

    if (!planId) {
      throw new Error("Plano não especificado");
    }

    console.log("📋 Processando plano:", { planId, isYearly, userEmail: user.email });

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Configurar preços dos planos
    let planName;
    let unitAmount;
    
    switch(planId) {
      case 'starter':
        planName = "Plano Starter";
        unitAmount = isYearly ? 5590 : 6990;
        break;
      case 'pro':
        planName = "Plano Pro";
        unitAmount = isYearly ? 9590 : 11990;
        break;
      case 'premium':
        planName = "Plano Premium";
        unitAmount = isYearly ? 15990 : 19990;
        break;
      default:
        throw new Error(`Plano '${planId}' não é válido`);
    }

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

    // Criar sessão de checkout
    const origin = req.headers.get("origin") || "https://09df458b-dedc-46e2-af46-e15d28209b01.lovableproject.com";
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: planName,
              description: `${planName} - ${isYearly ? 'Anual' : 'Mensal'}`,
            },
            unit_amount: unitAmount,
            recurring: {
              interval: isYearly ? "year" : "month",
            },
          },
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

    console.log("✅ Sessão criada:", session.id);

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
    console.error("💥 Erro:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
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
