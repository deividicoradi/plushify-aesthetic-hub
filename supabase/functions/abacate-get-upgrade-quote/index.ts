import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { createRemoteJWKSet, jwtVerify } from "https://esm.sh/jose@5.9.6";
import { buildCorsHeaders } from "../_shared/cors.ts";

// Só LEITURA — calcula a prévia do upgrade (crédito proporcional + valor a
// cobrar hoje) pra tela de resumo mostrar ANTES do cliente confirmar, sem
// criar nenhum produto/checkout na AbacatePay ainda. Mesmo cálculo que
// abacate-create-upgrade-checkout usa de verdade (calculate_upgrade_quote),
// pra garantir que o que aparece na tela é exatamente o que será cobrado.

const log = (step: string, details?: unknown) => {
  const suffix = details === undefined ? "" : ` - ${JSON.stringify(details)}`;
  console.log(`[ABACATE-GET-UPGRADE-QUOTE] ${step}${suffix}`);
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const JWKS = createRemoteJWKSet(
  new URL(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`),
);

type VerifyToken = (token: string) => Promise<{ sub?: string; email?: string }>;

const defaultVerify: VerifyToken = async (token) => {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: `${SUPABASE_URL}/auth/v1`,
  });
  return payload as { sub?: string; email?: string };
};

export const createHandler = (verify: VerifyToken = defaultVerify) => async (req: Request): Promise<Response> => {
  const corsHeaders = buildCorsHeaders(req.headers.get("origin"));

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) throw new Error("AUTH: missing bearer token");

    const token = authHeader.replace("Bearer ", "");
    let claims: { sub?: string; email?: string };
    try {
      claims = await verify(token);
    } catch (e) {
      throw new Error(`AUTH: invalid token (${e instanceof Error ? e.message : "verify failed"})`);
    }
    if (!claims.sub) throw new Error("AUTH: token missing sub");

    const body = await req.json().catch(() => ({}));
    const newPlanType = String(body.new_plan_type ?? "");
    const newBillingInterval = String(body.new_billing_interval ?? "");
    if (!["professional", "premium"].includes(newPlanType)) throw new Error("INPUT: invalid new_plan_type");
    if (!["month", "year"].includes(newBillingInterval)) throw new Error("INPUT: invalid new_billing_interval");

    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await admin.rpc("calculate_upgrade_quote", {
      p_user_id: claims.sub,
      p_new_plan_type: newPlanType,
      p_new_billing_interval: newBillingInterval,
    });

    if (error) {
      log("quote error", error);
      throw new Error(error.message);
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log("ERROR", { message });
    return new Response(
      JSON.stringify({ error: "Não foi possível calcular o upgrade.", detail: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
    );
  }
};

serve(createHandler());
