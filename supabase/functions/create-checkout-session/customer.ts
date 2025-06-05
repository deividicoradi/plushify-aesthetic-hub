
import Stripe from "https://esm.sh/stripe@13.2.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

export const getOrCreateCustomer = async (
  stripe: Stripe,
  supabase: any,
  user: any
): Promise<string> => {
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

  return customerId;
};
