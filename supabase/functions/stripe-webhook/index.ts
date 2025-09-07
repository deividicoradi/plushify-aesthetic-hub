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
      logStep("SECURITY ERROR: Webhook signature verification failed", { error: err.message });
      return new Response(`Webhook signature verification failed: ${err.message}`, {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Processing checkout.session.completed", { sessionId: session.id });
        
        if (session.mode === 'subscription' && session.customer) {
          const customerId = typeof session.customer === 'string' 
            ? session.customer 
            : session.customer.id;
          
          // Get customer details
          const customer = await stripe.customers.retrieve(customerId);
          const customerEmail = (customer as Stripe.Customer).email;
          
          if (!customerEmail) {
            logStep("ERROR: No customer email found");
            break;
          }

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
            
            // Determine plan type based on amount
            let planType: 'professional' | 'premium' = 'professional';
            if (amount >= 17900) { // R$ 179,00 or more
              planType = 'premium';
            }

            const subscriptionEnd = new Date(subscription.current_period_end * 1000);

            // Update user subscription in database
            const { error: upsertError } = await supabaseClient
              .from('user_subscriptions')
              .upsert({
                user_id: session.metadata?.user_id, // We'll need to add this in checkout
                plan_type: planType,
                status: 'active',
                started_at: new Date().toISOString(),
                expires_at: subscriptionEnd.toISOString(),
                updated_at: new Date().toISOString()
              }, { 
                onConflict: 'user_id',
                ignoreDuplicates: false 
              });

            if (upsertError) {
              logStep("ERROR: Failed to update subscription", { error: upsertError });
            } else {
              logStep("SUCCESS: Subscription updated", { 
                planType, 
                customerEmail,
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
        
        const customerId = typeof subscription.customer === 'string' 
          ? subscription.customer 
          : subscription.customer.id;
        
        const customer = await stripe.customers.retrieve(customerId);
        const customerEmail = (customer as Stripe.Customer).email;
        
        if (!customerEmail) {
          logStep("ERROR: No customer email found");
          break;
        }

        // Determine plan type and status
        const priceId = subscription.items.data[0].price.id;
        const price = await stripe.prices.retrieve(priceId);
        const amount = price.unit_amount || 0;
        
        let planType: 'professional' | 'premium' = 'professional';
        if (amount >= 17900) {
          planType = 'premium';
        }

        const subscriptionEnd = new Date(subscription.current_period_end * 1000);
        const status = subscription.status === 'active' ? 'active' : 'inactive';

        // Update subscription
        const { error: updateError } = await supabaseClient
          .from('user_subscriptions')
          .update({
            plan_type: planType,
            status: status,
            expires_at: subscriptionEnd.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', subscription.metadata?.user_id); // We'll need to ensure this metadata exists

        if (updateError) {
          logStep("ERROR: Failed to update subscription", { error: updateError });
        } else {
          logStep("SUCCESS: Subscription updated", { planType, status, customerEmail });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Processing customer.subscription.deleted", { subscriptionId: subscription.id });
        
        // Downgrade to trial
        const { error: downgradeError } = await supabaseClient
          .from('user_subscriptions')
          .update({
            plan_type: 'trial',
            status: 'active',
            expires_at: null,
            trial_ends_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
            updated_at: new Date().toISOString()
          })
          .eq('user_id', subscription.metadata?.user_id);

        if (downgradeError) {
          logStep("ERROR: Failed to downgrade subscription", { error: downgradeError });
        } else {
          logStep("SUCCESS: User downgraded to trial");
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