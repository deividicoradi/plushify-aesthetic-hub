import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Restrictive CORS for webhook - should only be called by Stripe
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://stripe.com",
  "Access-Control-Allow-Headers": "stripe-signature, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received", { method: req.method });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey || !webhookSecret) {
      logStep("SECURITY ERROR: Missing Stripe configuration");
      throw new Error("Missing Stripe configuration");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Initialize Supabase client with service role key for database writes
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get the raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      logStep("SECURITY ERROR: No Stripe signature");
      throw new Error("No Stripe signature found");
    }

    let event: Stripe.Event;
    
    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep("Webhook signature verified", { eventType: event.type });
    } catch (err) {
      logStep("SECURITY ERROR: Webhook signature verification failed", { error: (err as Error).message });
      return new Response(`Webhook signature verification failed: ${(err as Error).message}`, {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Processing checkout.session.completed", { sessionId: session.id });
        
        if (session.mode === 'subscription' && session.customer && session.metadata?.user_id) {
          const customerId = typeof session.customer === 'string' 
            ? session.customer 
            : session.customer.id;
          
          // Get subscription details
          const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            status: 'active',
            limit: 1
          });

          if (subscriptions.data.length > 0) {
            const subscription = subscriptions.data[0];
            const priceId = subscription.items.data[0].price.id;
            const price = await stripe.prices.retrieve(priceId);
            const amount = price.unit_amount || 0;
            
            // Extrair plan_type e billing do metadata
            const planType = session.metadata.plan_type as 'professional' | 'premium';
            const billingInterval = session.metadata.billing_period === 'annual' ? 'year' : 'month';

            const subscriptionEnd = new Date(subscription.current_period_end * 1000);

            // Usar a função start_subscription para persistir
            const { error: rpcError } = await supabaseClient.rpc('start_subscription', {
              p_user_id: session.metadata.user_id,
              p_plan_code: planType,
              p_billing_interval: billingInterval,
              p_trial_days: 0,
              p_stripe_subscription_id: subscription.id,
              p_stripe_customer_id: customerId,
              p_current_period_end: subscriptionEnd.toISOString()
            });

            if (rpcError) {
              logStep("ERROR: Failed to create subscription via RPC", { error: rpcError });
            } else {
              logStep("SUCCESS: Subscription created", { 
                planType,
                billingInterval,
                subscriptionId: subscription.id,
                expiresAt: subscriptionEnd.toISOString()
              });
            }
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Processing customer.subscription.updated", { subscriptionId: subscription.id });
        
        if (!subscription.metadata?.user_id) {
          logStep("ERROR: No user_id in subscription metadata");
          break;
        }

        // Extrair plan type e billing do metadata
        const planType = subscription.metadata.plan_type as 'professional' | 'premium';
        const billingInterval = subscription.metadata.billing_period === 'annual' ? 'year' : 'month';
        const subscriptionEnd = new Date(subscription.current_period_end * 1000);
        
        // Mapear status do Stripe para nosso status
        let dbStatus = 'active';
        if (subscription.status === 'past_due') dbStatus = 'past_due';
        if (subscription.status === 'canceled') dbStatus = 'canceled';
        if (subscription.status === 'unpaid') dbStatus = 'past_due';

        // Atualizar via update direto (já existe)
        const { error: updateError } = await supabaseClient
          .from('user_subscriptions')
          .update({
            plan_type: planType,
            billing_interval: billingInterval,
            status: dbStatus,
            current_period_end: subscriptionEnd.toISOString(),
            stripe_subscription_id: subscription.id,
            cancel_at_period_end: subscription.cancel_at_period_end || false,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id);

        if (updateError) {
          logStep("ERROR: Failed to update subscription", { error: updateError });
        } else {
          logStep("SUCCESS: Subscription updated", { planType, billingInterval, status: dbStatus });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Processing customer.subscription.deleted", { subscriptionId: subscription.id });
        
        if (!subscription.metadata?.user_id) {
          logStep("ERROR: No user_id in subscription metadata");
          break;
        }

        // Downgrade to trial usando RPC
        const { error: downgradeError } = await supabaseClient.rpc('start_subscription', {
          p_user_id: subscription.metadata.user_id,
          p_plan_code: 'trial',
          p_billing_interval: 'month',
          p_trial_days: 3
        });

        if (downgradeError) {
          logStep("ERROR: Failed to downgrade subscription", { error: downgradeError });
        } else {
          logStep("SUCCESS: User downgraded to trial with 3 days");
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Processing invoice.payment_failed", { invoiceId: invoice.id });
        
        // Here you would typically:
        // 1. Send notification email to user
        // 2. Update subscription status to 'past_due'
        // 3. Log the failed payment for retry logic
        
        logStep("Payment failed - notification needed", { 
          customerEmail: invoice.customer_email,
          amount: invoice.amount_due 
        });
        break;
      }

      default:
        logStep("Unhandled event type", { eventType: event.type });
    }

    logStep("Webhook processed successfully");
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("WEBHOOK ERROR", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: "Webhook processing failed",
      message: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});