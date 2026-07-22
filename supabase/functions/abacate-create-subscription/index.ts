import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createRemoteJWKSet, jwtVerify } from "https://esm.sh/jose@5.9.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Mapeamento oficial plano/ciclo -> produto AbacatePay
// Referência: catálogo real na conta AbacatePay (verificado via /v2/products/list).
// Nome/valor/ciclo esperados são usados para VALIDAR o produto antes do checkout,
// garantindo que a AbacatePay retornará exatamente o plano escolhido.
export const EXPECTED_PLANS = {
  professional: {
    monthly: {
      productId: "prod_bDC0SgHXsdz2y5aKYkf6zLQf",
      name: "Plushify Profissional (Mensal)",
      amount: 8900,
      cycle: "MONTHLY",
    },
    annual: {
      productId: "prod_bM42yN1t65DCWRxj5d0NNQdx",
      name: "Plushify Profissional (Anual)",
      amount: 89000,
      cycle: "ANNUALLY",
    },
  },
  premium: {
    monthly: {
      productId: "prod_TXrDWNj1Kc1wgcPRhn01Cnaf",
      name: "Plushify Premium (Mensal)",
      amount: 17900,
      cycle: "MONTHLY",
    },
    annual: {
      productId: "prod_FWGcbH5Puu5eua6M0652RRNy",
      name: "Plushify Premium (Anual)",
      amount: 179000,
      cycle: "ANNUALLY",
    },
  },
} as const;

type PlanKey = keyof typeof EXPECTED_PLANS;
type CycleKey = keyof typeof EXPECTED_PLANS["professional"];

const log = (step: string, details?: unknown) => {
  const suffix = details === undefined ? "" : ` - ${JSON.stringify(details)}`;
  console.log(`[ABACATE-CREATE-SUBSCRIPTION] ${step}${suffix}`);
};

const getCreatedItemId = (data: unknown): string | null => {
  if (!data || typeof data !== "object") return null;
  const items = (data as { items?: unknown }).items;
  if (!Array.isArray(items) || !items[0] || typeof items[0] !== "object") return null;
  const id = (items[0] as { id?: unknown }).id;
  return typeof id === "string" ? id : null;
};

const getCreatedAmount = (data: unknown): number | null => {
  if (!data || typeof data !== "object") return null;
  const amount = (data as { amount?: unknown }).amount;
  return typeof amount === "number" ? amount : null;
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
    const planType = String(body.plan_type ?? "") as PlanKey;
    const billingPeriod = String(body.billing_period ?? "monthly") as CycleKey;

    const expected = EXPECTED_PLANS[planType]?.[billingPeriod];
    if (!expected) throw new Error(`INPUT: invalid plan ${planType}/${billingPeriod}`);
    const productId = expected.productId;

    // Verificação obrigatória: consulta o produto na AbacatePay e valida
    // productId, nome, valor e ciclo ANTES de abrir o checkout.
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
      throw new Error(`VERIFY: product ${productId} not found on AbacatePay for ${planType}/${billingPeriod}`);
    }
    const mismatches: string[] = [];
    if (remote.price !== expected.amount) mismatches.push(`price ${remote.price} != ${expected.amount}`);
    if (remote.name !== expected.name) mismatches.push(`name "${remote.name}" != "${expected.name}"`);
    if (remote.cycle !== expected.cycle) mismatches.push(`cycle ${remote.cycle} != ${expected.cycle}`);
    if (remote.status !== "ACTIVE") mismatches.push(`status ${remote.status} != ACTIVE`);
    if (mismatches.length) {
      throw new Error(`VERIFY: ${planType}/${billingPeriod} mismatch — ${mismatches.join("; ")}`);
    }
    log("verified", { productId, name: remote.name, price: remote.price, cycle: remote.cycle });

    const origin = req.headers.get("origin") ?? "https://plushify-aesthetic-hub.lovable.app";
    const returnUrl = `${origin}/`;
    const completionUrl = `${origin}/planos?success=true&plan=${planType}&billing=${billingPeriod}`;

    // AbacatePay treats externalId as an idempotency/reference key. Reusing only
    // the user id can return a previous pending checkout, which makes every plan
    // open the first bill created for that user. Keep the user id in metadata and
    // make the checkout reference unique per attempt.
    const externalId = ["plushify", user.id, planType, billingPeriod, crypto.randomUUID()].join(":");

    log("creating subscription", { userId: user.id, planType, billingPeriod, productId, externalId });

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
        externalId,
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

    const createdItemId = getCreatedItemId(json.data);
    const createdAmount = getCreatedAmount(json.data);
    const responseMismatches: string[] = [];
    if (createdItemId !== productId) responseMismatches.push(`item ${createdItemId ?? "missing"} != ${productId}`);
    if (createdAmount !== expected.amount) responseMismatches.push(`amount ${createdAmount ?? "missing"} != ${expected.amount}`);
    if (responseMismatches.length) {
      log("checkout response mismatch", {
        userId: user.id,
        planType,
        billingPeriod,
        productId,
        billId: json.data.id,
        billUrl: json.data.url,
        mismatches: responseMismatches,
      });
      throw new Error(`ABACATE: checkout mismatch — ${responseMismatches.join("; ")}`);
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
});