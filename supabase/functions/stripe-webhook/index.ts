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

    // Catálogo de price_id → {plan_code, billing_interval}
    const PRICE_CATALOG: Record<string, { plan_code: string; billing_interval: string }> = {
      // Professional
      'price_professional_monthly': { plan_code: 'professional', billing_interval: 'month' },
      'price_professional_annual': { plan_code: 'professional', billing_interval: 'year' },
      // Enterprise (premium no DB)
      'price_premium_monthly': { plan_code: 'premium', billing_interval: 'month' },
      'price_premium_annual': { plan_code: 'premium', billing_interval: 'year' },
    };

    const mapPriceToSubscription = (priceId: string) => {
      const mapping = PRICE_CATALOG[priceId];
      if (!mapping) {
        logStep('AVISO: price_id não encontrado no catálogo', { priceId });
        return null;
      }
      return mapping;
    };

    // Dedupe: verificar se já processamos este evento
    const dedupeKey = `stripe_event_${event.id}`;
    const { data: existingEvent } = await supabaseClient
      .from('audit_logs')
      .select('id')
      .eq('reason', dedupeKey)
      .maybeSingle();

    if (existingEvent) {
      logStep('Evento já processado (dedupe)', { eventId: event.id });
      return new Response(JSON.stringify({ received: true, dedupe: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Processing checkout.session.completed", { sessionId: session.id });
        
        if (session.mode === 'subscription' && session.customer && session.subscription) {
          const subscriptionId = typeof session.subscription === 'string' 
            ? session.subscription 
            : session.subscription.id;
          
          // Buscar subscription no Stripe
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0]?.price.id;
          
          const mapping = mapPriceToSubscription(priceId);
          if (!mapping) {
            logStep('ERRO: Não foi possível mapear price_id', { priceId });
            throw new Error(`price_id não mapeado: ${priceId}`);
          }

          const userId = session.client_reference_id || session.metadata?.user_id;
          if (!userId) {
            throw new Error('user_id não encontrado no session');
          }

          const customerId = typeof session.customer === 'string' 
            ? session.customer 
            : session.customer.id;

          // Chamar start_subscription
          logStep('Chamando start_subscription', {
            userId,
            planCode: mapping.plan_code,
            billingInterval: mapping.billing_interval,
            stripeSubscriptionId: subscriptionId,
            stripeCustomerId: customerId,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
          });

          const { error: rpcError } = await supabaseClient.rpc('start_subscription', {
            p_user_id: userId,
            p_plan_code: mapping.plan_code,
            p_billing_interval: mapping.billing_interval,
            p_trial_days: 0,
            p_stripe_subscription_id: subscriptionId,
            p_stripe_customer_id: customerId,
            p_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          });

          if (rpcError) {
            logStep('ERRO ao chamar start_subscription', rpcError);
            throw rpcError;
          }

          logStep('Assinatura criada/atualizada via start_subscription');
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Processing customer.subscription.updated", { subscriptionId: subscription.id });
        
        const priceId = subscription.items.data[0]?.price.id;
        const mapping = mapPriceToSubscription(priceId);
        
        if (!mapping) {
          logStep('ERRO: Não foi possível mapear price_id', { priceId });
          throw new Error(`price_id não mapeado: ${priceId}`);
        }

        // Buscar user_id pela stripe_subscription_id
        const { data: existingSub } = await supabaseClient
          .from('user_subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .maybeSingle();

        if (!existingSub) {
          logStep('AVISO: Assinatura não encontrada no DB', { subscriptionId: subscription.id });
          break;
        }

        const customerId = typeof subscription.customer === 'string' 
          ? subscription.customer 
          : subscription.customer.id;

        // Atualizar via start_subscription (ON CONFLICT fará UPDATE)
        const { error: rpcError } = await supabaseClient.rpc('start_subscription', {
          p_user_id: existingSub.user_id,
          p_plan_code: mapping.plan_code,
          p_billing_interval: mapping.billing_interval,
          p_trial_days: 0,
          p_stripe_subscription_id: subscription.id,
          p_stripe_customer_id: customerId,
          p_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        });

        if (rpcError) {
          logStep('ERRO ao atualizar assinatura', rpcError);
          throw rpcError;
        }

        logStep('Assinatura atualizada via start_subscription');
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Processing customer.subscription.deleted", { subscriptionId: subscription.id });
        
        // Atualizar apenas o status, sem recriar registro
        const { error: updateError } = await supabaseClient
          .from('user_subscriptions')
          .update({
            status: 'canceled',
            cancel_at_period_end: true,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)
          .in('status', ['active', 'trial_active']);

        if (updateError) {
          logStep('ERRO ao cancelar assinatura', updateError);
          throw updateError;
        }

        logStep('Assinatura cancelada');
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Processing invoice.payment_failed", { invoiceId: invoice.id });
        
        // TODO: Notificar usuário sobre falha no pagamento
        logStep("Payment failed - notification needed", { 
          customerEmail: invoice.customer_email,
          amount: invoice.amount_due 
        });
        break;
      }

      default:
        logStep("Unhandled event type", { eventType: event.type });
    }

    // Registrar evento processado (dedupe)
    await supabaseClient.from('audit_logs').insert({
      user_id: '00000000-0000-0000-0000-000000000000',
      table_name: 'stripe_webhook',
      record_id: '00000000-0000-0000-0000-000000000000',
      action: 'CREATE',
      reason: dedupeKey,
      new_data: { event_type: event.type, event_id: event.id },
    });

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
