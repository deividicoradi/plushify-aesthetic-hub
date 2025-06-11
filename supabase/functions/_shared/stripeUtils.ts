export interface AuthenticatedUser {
  user: any;
  supabase: any;
}

export const authenticateUser = async (authHeader: string | null): Promise<AuthenticatedUser> => {
  if (!authHeader) {
    throw new Error("Autorização necessária");
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Variáveis do Supabase não configuradas");
  }

  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.38.0");

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    throw new Error("Usuário não autenticado");
  }

  console.log("✅ Usuário autenticado:", user.email);
  return { user, supabase };
};

export const getOrCreateCustomer = async (
  stripe: any,
  supabase: any,
  user: any
): Promise<string> => {
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
