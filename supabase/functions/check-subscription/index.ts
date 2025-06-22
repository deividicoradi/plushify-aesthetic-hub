
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Simple in-memory cache for Stripe results
type CacheEntry = {
  subscribed: boolean;
  plan_type: 'trial' | 'professional' | 'premium';
  subscription_end: string | null;
  timestamp: number;
};

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const subscriptionCache = new Map<string, CacheEntry>();

// Clean up old cache entries periodically to avoid unbounded growth
const cleanupCache = () => {
  const now = Date.now();
  for (const [email, entry] of subscriptionCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL_MS) {
      subscriptionCache.delete(email);
    }
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    // Use the service role key to perform writes (upsert) in Supabase
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Clear expired cache entries
    cleanupCache();

    // Return cached data if available and fresh
    const cached = subscriptionCache.get(user.email);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      logStep("Returning cached subscription data", { email: user.email });
      return new Response(JSON.stringify({
        subscribed: cached.subscribed,
        plan_type: cached.plan_type,
        subscription_end: cached.subscription_end,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, updating unsubscribed state");
      await supabaseClient.from("user_subscriptions").upsert({
        user_id: user.id,
        plan_type: 'trial',
        status: 'active',
        trial_ends_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      
      return new Response(JSON.stringify({ 
        subscribed: false, 
        plan_type: 'trial' 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    
    const hasActiveSub = subscriptions.data.length > 0;
    let planType = 'trial';
    let subscriptionEnd = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      logStep("Active subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd });
      
      // Determine plan type from price amount
      const priceId = subscription.items.data[0].price.id;
      const price = await stripe.prices.retrieve(priceId);
      const amount = price.unit_amount || 0;
      
      if (amount >= 17900) {
        planType = "premium";
      } else if (amount >= 8900) {
        planType = "professional";
      } else {
        planType = "trial";
      }
      logStep("Determined plan type", { priceId, amount, planType });
    } else {
      logStep("No active subscription found");
    }

    // Update user subscription in database
    await supabaseClient.from("user_subscriptions").upsert({
      user_id: user.id,
      plan_type: planType as 'trial' | 'professional' | 'premium',
      status: hasActiveSub ? 'active' : 'inactive',
      expires_at: subscriptionEnd,
      trial_ends_at: planType === 'trial' ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    logStep("Updated database with subscription info", { subscribed: hasActiveSub, planType });

    // Store result in cache
    subscriptionCache.set(user.email, {
      subscribed: hasActiveSub,
      plan_type: planType as 'trial' | 'professional' | 'premium',
      subscription_end: subscriptionEnd,
      timestamp: Date.now(),
    });
    
    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      plan_type: planType,
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
