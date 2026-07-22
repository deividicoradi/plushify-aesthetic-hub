import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createRemoteJWKSet, jwtVerify } from "https://esm.sh/jose@5.9.6";

// Checkout de pagamento ÚNICO (Pix ou cartão parcelado em até 12x) para o
// plano ANUAL. Assinatura recorrente da AbacatePay só aceita CARD sem
// parcelamento (ver /v2/subscriptions/create) — por isso o plano mensal
// continua usando abacate-create-subscription, e só o anual passa por aqui,
// via /v2/checkouts/create.
//
// Mesmo padrão de segurança de abacate-create-subscription: JWT validado via
// JWKS, plano/preço conferidos contra o catálogo real da AbacatePay antes de
// abrir o checkout (evita manipulação de preço pelo cliente).

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Mesmos produtos anuais de abacate-create-subscription/abacate-verify-plans.
export const EXPECTED_ANNUAL_PLANS = {
  professional: {
    productId: "prod_bM42yN1t65DCWRxj5d0NNQdx",
    name: "Plushify Profissional (Anual)",
    amount: 89000,
    cycle: "ANNUALLY",
  },
  premium: {
    productId: "prod_FWGcbH5Puu5eua6M0652RRNy",
    name: "Plushify Premium (Anual)",
    amount: 179000,
    cycle: "ANNUALLY",
  },
} as const;

type PlanKey = keyof typeof EXPECTED_ANNUAL_PLANS;

const log = (step: string, details?: unknown) => {
  const suffix = details === undefined ? "" : ` - ${JSON.stringify(details)}`;
  console.log(`[ABACATE-CREATE-CHECKOUT] ${step}${suffix}`);
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("ABACATE_API_KEY");
    if (!apiKey) throw new Error("MISCONFIG: ABACATE_API_KEY missing");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) throw new Error("AUTH: missing bearer token");

    const token = authHeader.replace("Bearer ", "");
    let claims: { sub?: string; email?: string };
    try {
      claims = await verify(token);
    } catch (e) {
      throw new Error(`AUTH: invalid token (${e instanceof Error ? e.message : "verify failed"})`);
    }
    if (!claims.sub || !claims.email) throw new Error("AUTH: token missing sub/email");
    const user = { id: claims.sub, email: claims.email };

    const body = await req.json().catch(() => ({}));
    const planType = String(body.plan_type ?? "") as PlanKey;

    const expected = EXPECTED_ANNUAL_PLANS[planType];
    if (!expected) throw new Error(`INPUT: invalid annual plan ${planType}`);
    const productId = expected.productId;

    // Mesma checagem contra o catálogo real da AbacatePay antes do checkout.
    const verifyRes = await fetch(
      `https://api.abacatepay.com/v2/products/list`,
      { headers: { Authorization: `Bearer ${apiKey}` } },
    );
    const verifyJson = await verifyRes.json();
    if (!verifyRes.ok || !verifyJson?.success) {
      throw new Error(`VERIFY: could not list products (${verifyJson?.error ?? verifyRes.statusText})`);
    }
    const remote = (verifyJson.data as Array<Record<string, unknown>>).find(
      (p) => p.id === productId,
    );
    if (!remote) {
      throw new Error(`VERIFY: product ${productId} not found on AbacatePay for ${planType}/annual`);
    }
    const mismatches: string[] = [];
    if (remote.price !== expected.amount) mismatches.push(`price ${remote.price} != ${expected.amount}`);
    if (remote.name !== expected.name) mismatches.push(`name "${remote.name}" != "${expected.name}"`);
    if (remote.cycle !== expected.cycle) mismatches.push(`cycle ${remote.cycle} != ${expected.cycle}`);
    if (remote.status !== "ACTIVE") mismatches.push(`status ${remote.status} != ACTIVE`);
    if (mismatches.length) {
      throw new Error(`VERIFY: ${planType}/annual mismatch — ${mismatches.join("; ")}`);
    }
    log("verified", { productId, name: remote.name, price: remote.price, cycle: remote.cycle });

    const origin = req.headers.get("origin") ?? "https://plushify-aesthetic-hub.lovable.app";
    const returnUrl = `${origin}/`;
    const completionUrl = `${origin}/planos?success=true&plan=${planType}&billing=annual`;

    const externalId = ["plushify", user.id, planType, "annual", crypto.randomUUID()].join(":");

    log("creating checkout", { userId: user.id, planType, productId, externalId });

    const res = await fetch("https://api.abacatepay.com/v2/checkouts/create", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [{ id: productId, quantity: 1 }],
        methods: ["PIX", "CARD"],
        card: { maxInstallments: 12 },
        returnUrl,
        completionUrl,
        externalId,
        metadata: {
          user_id: user.id,
          user_email: user.email,
          plan_type: planType,
          billing_period: "annual",
        },
      }),
    });

    const json = await res.json();
    log("abacate response", { status: res.status, success: json?.success, error: json?.error });

    if (!res.ok || !json?.success || !json?.data?.url) {
      throw new Error(`ABACATE: ${json?.error ?? res.statusText}`);
    }

    return new Response(JSON.stringify({ url: json.data.url, id: json.data.id, externalId }), {
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
};

serve(createHandler());
