import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createRemoteJWKSet, jwtVerify } from "https://esm.sh/jose@5.9.6";
import { buildCorsHeaders } from "../_shared/cors.ts";

// PIX avulso via checkout HOSPEDADO da AbacatePay (/v2/checkouts/create),
// não mais via Checkout Transparente (/v2/transparents/create).
//
// Descoberto em teste real (2026-07-27): o bloqueio "PIX Automático is not
// available for this store" não depende de ser cobrança única ou recorrente
// (testamos ONE_TIME explícito e ainda bloqueava) — depende do PRODUTO: os
// produtos com ciclo de assinatura (cycle: MONTHLY/ANNUALLY, os mesmos usados
// por abacate-create-subscription/abacate-create-checkout) exigem "PIX
// Automático" (não habilitado pra esta loja). Os produtos "-onetime" (sem
// ciclo, cycle: null) aceitam PIX normal — confirmado com um pagamento PIX
// real de um produto onetime, que chegou no webhook como checkout.completed
// com methods:["PIX"] e status PAID, sem nenhum bloqueio.
//
// Por isso trocamos a abordagem: em vez de gerar QR Code na nossa própria
// tela (Checkout Transparente, que não documenta o formato do webhook e não
// deixava claro se simulate-payment dispara webhook de verdade), usamos o
// checkout hospedado da AbacatePay com os produtos onetime e
// methods:["PIX","CARD"] — mesma infraestrutura de checkout/webhook já
// testada e funcionando em abacate-create-checkout/abacate-create-subscription,
// só que apontando pro catálogo de produtos sem ciclo.
export const EXPECTED_ONETIME_PLANS = {
  professional: {
    monthly: { productId: "prod_yT55aw266gN4U0aKWypwAfSD", name: "Plushify Profissional 1 mês", amount: 8900 },
    annual: { productId: "prod_hLaqZTpStG1uMjdJBErKPc6c", name: "Plushify Profissional 1 ano", amount: 89000 },
  },
  premium: {
    monthly: { productId: "prod_5dtqUL31bTqUDzf3TfgDwQbA", name: "Plushify Premium 1 mês", amount: 17900 },
    annual: { productId: "prod_HFwLzxRtcTRSY4YdgQfRmNTY", name: "Plushify Premium 1 ano", amount: 179000 },
  },
} as const;

type PlanKey = keyof typeof EXPECTED_ONETIME_PLANS;
type CycleKey = keyof typeof EXPECTED_ONETIME_PLANS["professional"];

const log = (step: string, details?: unknown) => {
  const suffix = details === undefined ? "" : ` - ${JSON.stringify(details)}`;
  console.log(`[ABACATE-CREATE-PIX-CHARGE] ${step}${suffix}`);
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
    const billingPeriod = String(body.billing_period ?? "monthly") as CycleKey;

    const expected = EXPECTED_ONETIME_PLANS[planType]?.[billingPeriod];
    if (!expected) throw new Error(`INPUT: invalid plan ${planType}/${billingPeriod}`);
    const productId = expected.productId;

    // Mesma checagem contra o catálogo real da AbacatePay antes do checkout,
    // padrão já usado em abacate-create-checkout/abacate-create-subscription.
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
    if (remote.status !== "ACTIVE") mismatches.push(`status ${remote.status} != ACTIVE`);
    if (mismatches.length) {
      throw new Error(`VERIFY: ${planType}/${billingPeriod} mismatch — ${mismatches.join("; ")}`);
    }
    log("verified", { productId, name: remote.name, price: remote.price });

    const origin = req.headers.get("origin") ?? "https://plushify-aesthetic-hub.lovable.app";
    const returnUrl = `${origin}/`;
    const completionUrl = `${origin}/dashboard?success=true&plan=${planType}&billing=${billingPeriod}`;

    const externalId = ["plushify", user.id, planType, billingPeriod, crypto.randomUUID()].join(":");

    log("creating pix checkout", { userId: user.id, planType, billingPeriod, productId, externalId });

    const res = await fetch("https://api.abacatepay.com/v2/checkouts/create", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [{ id: productId, quantity: 1 }],
        methods: ["PIX", "CARD"],
        card: { maxInstallments: billingPeriod === "annual" ? 12 : 1 },
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

    return new Response(JSON.stringify({ url: json.data.url, id: json.data.id, externalId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log("ERROR", { message });
    return new Response(
      JSON.stringify({ error: "Não foi possível iniciar o checkout PIX." , detail: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
    );
  }
};

serve(createHandler());
