
import Stripe from "https://esm.sh/stripe@13.2.0?target=deno";
import { PlanConfig } from './types.ts';

export const createCheckoutSession = async (
  stripe: Stripe,
  customerId: string,
  planConfig: PlanConfig,
  planId: string,
  isYearly: boolean,
  userId: string,
  origin: string
): Promise<Stripe.Checkout.Session> => {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "brl",
          product_data: {
            name: planConfig.name,
            description: `${planConfig.name} - ${isYearly ? 'Anual' : 'Mensal'}`,
          },
          unit_amount: planConfig.unitAmount,
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
      user_id: userId,
      plan_tier: planId,
      is_yearly: isYearly ? "true" : "false",
    },
    subscription_data: {
      metadata: {
        user_id: userId,
        plan_tier: planId,
        is_yearly: isYearly ? "true" : "false",
      }
    }
  });

  console.log("✅ Sessão criada:", session.id);
  return session;
};
