
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
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Supabase client with service role to bypass RLS policies
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
      { auth: { persistSession: false } }
    );

    // Get request body
    const body = await req.text();
    const signature = req.headers.get("Stripe-Signature");

    if (!signature) {
      return new Response(
        JSON.stringify({ error: "No Stripe signature found" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Verify Stripe webhook signature
    let event;
    const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      return new Response(
        JSON.stringify({ error: `Webhook Error: ${err.message}` }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Handle specific event types
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const planTier = subscription.metadata.plan_tier;
        const subscriptionEnd = new Date(subscription.current_period_end * 1000);
        
        // Get user ID from customer
        const { data: customer } = await stripe.customers.retrieve(customerId);
        const userId = customer.metadata.user_id;

        if (userId) {
          // Update subscriber information
          await supabaseAdmin
            .from("subscribers")
            .update({
              subscribed: subscription.status === "active",
              subscription_tier: planTier,
              subscription_end: subscriptionEnd.toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);
        }
        break;

      case "customer.subscription.deleted":
        const canceledSubscription = event.data.object;
        const canceledCustomerId = canceledSubscription.customer;
        
        // Get user ID from customer
        const { data: canceledCustomer } = await stripe.customers.retrieve(canceledCustomerId);
        const canceledUserId = canceledCustomer.metadata.user_id;

        if (canceledUserId) {
          // Update subscriber information
          await supabaseAdmin
            .from("subscribers")
            .update({
              subscribed: false,
              subscription_tier: null,
              subscription_end: null,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", canceledUserId);
        }
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

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
