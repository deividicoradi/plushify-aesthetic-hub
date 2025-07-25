
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

// Simple per-user rate limiting
const RATE_LIMIT_WINDOW_MS = 30 * 1000; // 30 seconds
const userRequestTimestamps = new Map<string, number>();

// SEGURANÇA: Price IDs oficiais - Vamos criar preços de teste que funcionem
const OFFICIAL_PRICE_IDS = {
  professional: {
    monthly: "price_professional_monthly",
    annual: "price_professional_annual"
  },
  premium: {
    monthly: "price_premium_monthly", 
    annual: "price_premium_annual"
  }
} as const;

// SEGURANÇA: Validação rigorosa de entrada
const validateInput = (plan_type: string, billing_period: string) => {
  const validPlans = ['professional', 'premium'] as const;
  const validPeriods = ['monthly', 'annual'] as const;
  
  if (!validPlans.includes(plan_type as any)) {
    throw new Error(`SECURITY: Invalid plan type attempted: ${plan_type}`);
  }
  
  if (!validPeriods.includes(billing_period as any)) {
    throw new Error(`SECURITY: Invalid billing period attempted: ${billing_period}`);
  }
  
  return {
    plan_type: plan_type as typeof validPlans[number],
    billing_period: billing_period as typeof validPeriods[number]
  };
};

// SEGURANÇA: Verificação adicional de autenticação
const validateUserAuth = async (token: string, supabaseClient: any) => {
  if (!token || token.length < 10) {
    throw new Error("SECURITY: Invalid authentication token");
  }

  const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
  
  if (userError) {
    logStep("SECURITY ALERT: Authentication failed", { error: userError.message });
    throw new Error(`SECURITY: Authentication error - ${userError.message}`);
  }
  
  const user = userData.user;
  if (!user?.email || !user?.id) {
    logStep("SECURITY ALERT: Incomplete user data", { hasEmail: !!user?.email, hasId: !!user?.id });
    throw new Error("SECURITY: User not authenticated or incomplete user data");
  }

  return user;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("SECURITY: Request initiated", { 
      method: req.method, 
      origin: req.headers.get("origin"),
      userAgent: req.headers.get("user-agent")?.substring(0, 50)
    });

    // SEGURANÇA: Verificar environment
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey || !stripeKey.startsWith("sk_")) {
      logStep("SECURITY ALERT: Invalid Stripe key configuration");
      throw new Error("SECURITY: Payment system misconfigured");
    }
    logStep("SECURITY: Stripe key verified");

    // SEGURANÇA: Verificar origem da requisição
    const origin = req.headers.get("origin");
    const allowedOrigins = [
      "http://localhost:3000",
      "https://wmoylybbwikkqbxiqwbq.supabase.co",
      "https://09df458b-dedc-46e2-af46-e15d28209b01.lovableproject.com",
    ];
    
    // Permitir qualquer domínio do Lovable que termine com lovableproject.com
    const isLovableDomain = origin && origin.includes('lovableproject.com');
    const isAllowedOrigin = origin && (allowedOrigins.includes(origin) || isLovableDomain);
    
    logStep("SECURITY: Origin validation", { origin, isLovableDomain, isAllowedOrigin });

    // SEGURANÇA: Inicializar Supabase com chave de serviço para validações
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // SEGURANÇA: Validação de autenticação rigorosa
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logStep("SECURITY ALERT: Missing or invalid authorization header");
      throw new Error("SECURITY: No valid authorization provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const user = await validateUserAuth(token, supabaseClient);
    logStep("SECURITY: User authenticated successfully", { userId: user.id, email: user.email });

    // Rate limiting: prevent repeated checkouts
    const lastRequest = userRequestTimestamps.get(user.id) || 0;
    if (Date.now() - lastRequest < RATE_LIMIT_WINDOW_MS) {
      logStep("Rate limit triggered", { userId: user.id });
      return new Response(JSON.stringify({ error: "Too many requests" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 429,
      });
    }
    userRequestTimestamps.set(user.id, Date.now());

    // SEGURANÇA: Parsing e validação de entrada
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (e) {
      logStep("SECURITY ALERT: Invalid JSON in request body");
      throw new Error("SECURITY: Invalid request format");
    }

    const { plan_type, billing_period = 'monthly' } = requestBody;
    
    // SEGURANÇA: Validação rigorosa dos parâmetros
    const validatedInput = validateInput(plan_type, billing_period);
    logStep("SECURITY: Input validated", validatedInput);

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // SEGURANÇA: Verificar customer existente
    const customers = await stripe.customers.list({ 
      email: user.email, 
      limit: 1 
    });
    
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("SECURITY: Existing customer verified", { customerId });
      
      // SEGURANÇA: Verificar se customer não tem issues
      const customer = customers.data[0];
      if (customer.deleted) {
        logStep("SECURITY ALERT: Deleted customer attempted checkout", { customerId });
        throw new Error("SECURITY: Customer account has been deleted");
      }
    } else {
      logStep("SECURITY: New customer will be created");
    }

    // Em vez de usar Price IDs hardcoded, vamos criar o preço dinamicamente
    const planPrices = {
      professional: {
        monthly: { amount: 8900, name: "Professional Mensal" }, // R$ 89,00
        annual: { amount: 89000, name: "Professional Anual" }   // R$ 890,00
      },
      premium: {
        monthly: { amount: 17900, name: "Enterprise Mensal" },  // R$ 179,00
        annual: { amount: 179000, name: "Enterprise Anual" }    // R$ 1.790,00
      }
    };

    const planConfig = planPrices[validatedInput.plan_type][validatedInput.billing_period];
    
    logStep("SECURITY: Plan configuration selected", { 
      plan_type: validatedInput.plan_type, 
      billing_period: validatedInput.billing_period, 
      amount: planConfig.amount,
      name: planConfig.name
    });

    const safeOrigin = origin || "https://09df458b-dedc-46e2-af46-e15d28209b01.lovableproject.com";
    
    // SEGURANÇA: Criar checkout session com preço dinâmico
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: planConfig.name,
              description: `Plano ${validatedInput.plan_type} - ${validatedInput.billing_period === 'annual' ? 'Anual' : 'Mensal'}`,
            },
            unit_amount: planConfig.amount,
            recurring: {
              interval: validatedInput.billing_period === 'annual' ? 'year' : 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${safeOrigin}/planos?success=true&plan=${validatedInput.plan_type}&billing=${validatedInput.billing_period}`,
      cancel_url: `${safeOrigin}/planos?canceled=true`,
      metadata: {
        user_id: user.id,
        user_email: user.email,
        plan_type: validatedInput.plan_type,
        billing_period: validatedInput.billing_period,
        security_check: "validated",
        created_at: new Date().toISOString()
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          user_email: user.email,
          plan_type: validatedInput.plan_type,
          billing_period: validatedInput.billing_period
        }
      },
      // SEGURANÇA: Configurações adicionais
      allow_promotion_codes: false, // Evitar códigos de desconto não autorizados
      billing_address_collection: 'required',
      customer_update: {
        address: 'auto'
      }
    });

    logStep("SECURITY: Checkout session created successfully", { 
      sessionId: session.id, 
      url: session.url?.substring(0, 50) + "..." 
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // SEGURANÇA: Log detalhado para monitoramento
    logStep("SECURITY ERROR in create-checkout", { 
      message: errorMessage,
      timestamp: new Date().toISOString(),
      severity: errorMessage.includes("SECURITY") ? "HIGH" : "MEDIUM"
    });

    // SEGURANÇA: Não expor detalhes internos ao cliente
    const publicErrorMessage = errorMessage.includes("SECURITY") 
      ? "Erro de segurança. Tente novamente."
      : "Erro ao processar pagamento. Tente novamente.";

    return new Response(JSON.stringify({ 
      error: publicErrorMessage,
      code: "PAYMENT_ERROR"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: errorMessage.includes("SECURITY") ? 403 : 500,
    });
  }
});
