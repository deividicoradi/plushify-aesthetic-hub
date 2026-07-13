import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createRemoteJWKSet, jwtVerify } from "https://esm.sh/jose@5.9.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Map plan_type + billing_period -> AbacatePay subscription product ID
const PRODUCT_MAP: Record<string, Record<string, string>> = {
  professional: {
    monthly: "prod_bDC0SgHXsdz2y5aKYkf6zLQf",
    annual: "prod_bM42yN1t65DCWRxj5d0NNQdx",
  },
  premium: {
    monthly: "prod_TXrDWNj1Kc1wgcPRhn01Cnaf",
    annual: "prod_FWGcbH5Puu5eua6M0652RRNy",
  },
};

const log = (step: string, details?: unknown) => {
  const suffix = details === undefined ? "" : ` - ${JSON.stringify(details)}`;
  console.log(`[ABACATE-CREATE-SUBSCRIPTION] ${step}${suffix}`);
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const JWKS = createRemoteJWKSet(
  new URL(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`),
);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("ABACATE_API_KEY");
    if (!apiKey) throw new Error("MISCONFIG: ABACATE_API_KEY missing");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) throw new Error("AUTH: missing bearer token");

    const token = authHeader.replace("Bearer ", "");
    // Verificação stateless: apenas assinatura + expiração via JWKS.
    // Evita falha quando a sessão foi encerrada mas o JWT ainda é válido.
    let claims: { sub?: string; email?: string };
    try {
      const { payload } = await jwtVerify(token, JWKS, {
        issuer: `${SUPABASE_URL}/auth/v1`,
      });
      claims = payload as { sub?: string; email?: string };
    } catch (e) {
      throw new Error(`AUTH: invalid token (${e instanceof Error ? e.message : "verify failed"})`);
    }
    if (!claims.sub || !claims.email) throw new Error("AUTH: token missing sub/email");
    const user = { id: claims.sub, email: claims.email };

    const body = await req.json().catch(() => ({}));
    const planType = String(body.plan_type ?? "");
    const billingPeriod = String(body.billing_period ?? "monthly");

    const productId = PRODUCT_MAP[planType]?.[billingPeriod];
    if (!productId) throw new Error(`INPUT: invalid plan ${planType}/${billingPeriod}`);

    const origin = req.headers.get("origin") ?? "https://plushify-aesthetic-hub.lovable.app";
    const returnUrl = `${origin}/planos?canceled=true`;
    const completionUrl = `${origin}/planos?success=true&plan=${planType}&billing=${billingPeriod}`;

    log("creating subscription", { userId: user.id, planType, billingPeriod, productId });

    const res = await fetch("https://api.abacatepay.com/v2/subscriptions/create", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [{ id: productId, quantity: 1 }],
        methods: ["CARD"],
        returnUrl,
        completionUrl,
        externalId: user.id,
        metadata: {
          user_id: user.id,
          user_email: user.email,
          plan_type: planType,
          billing_period: billingPeriod,
        },
      }),
    });

    const json = await res.json();
    log("abacate response", { status: res.status, success: json?.success, error: json?.error });

    if (!res.ok || !json?.success || !json?.data?.url) {
      throw new Error(`ABACATE: ${json?.error ?? res.statusText}`);
    }

    return new Response(JSON.stringify({ url: json.data.url, id: json.data.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log("ERROR", { message });
    return new Response(
      JSON.stringify({ error: "Não foi possível iniciar o checkout.", detail: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
    );
  }
});