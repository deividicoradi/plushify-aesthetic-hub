
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

export const authenticateUser = async (authHeader: string | null) => {
  if (!authHeader) {
    throw new Error("Autorização necessária");
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Variáveis do Supabase não configuradas");
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    throw new Error("Usuário não autenticado");
  }

  console.log("✅ Usuário autenticado:", user.email);
  return { user, supabase };
};
