import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createRemoteJWKSet, jwtVerify } from "https://esm.sh/jose@5.9.6";
import { buildCorsHeaders } from "../_shared/cors.ts";

// PIX avulso (QR Code) via "Checkout Transparente" da AbacatePay
// (/v2/transparents/create) — endpoint diferente de /v2/checkouts/create e
// /v2/subscriptions/create. Descoberto em 2026-07-27: o checkout normal com
// methods:["PIX"] retorna "PIX Automático is not available for this store"
// pra esta loja mesmo em cobrança única (testado explicitamente), mas o
// endpoint transparente funciona sem essa restrição — é um recurso PIX
// separado (QR code exibido no próprio app, sem redirecionar o cliente pra
// app.abacatepay.com). Cobrança sempre única: não existe "assinatura PIX"
// recorrente na AbacatePay, então tanto plano mensal quanto anual pagos via
// PIX aqui são pagamento único — a renovação do mensal precisa ser manual
// (o usuário paga de novo quando expirar), igual ao cartão parcelado do anual.
//
// Mesmo catálogo de preços de abacate-create-subscription/abacate-create-checkout.
export const EXPECTED_PLANS = {
  professional: {
    monthly: { name: "Plushify Profissional (Mensal)", amount: 8900 },
    annual: { name: "Plushify Profissional (Anual)", amount: 89000 },
  },
  premium: {
    monthly: { name: "Plushify Premium (Mensal)", amount: 17900 },
    annual: { name: "Plushify Premium (Anual)", amount: 179000 },
  },
} as const;

type PlanKey = keyof typeof EXPECTED_PLANS;
type CycleKey = keyof typeof EXPECTED_PLANS["professional"];

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

    // Preço decidido só pelo catálogo fixo no servidor — nunca pelo valor
    // enviado pelo cliente (mesmo padrão de segurança das outras funções).
    const expected = EXPECTED_PLANS[planType]?.[billingPeriod];
    if (!expected) throw new Error(`INPUT: invalid plan ${planType}/${billingPeriod}`);

    const externalId = ["plushify", user.id, planType, billingPeriod, crypto.randomUUID()].join(":");

    log("creating pix charge", { userId: user.id, planType, billingPeriod, amount: expected.amount, externalId });

    const res = await fetch("https://api.abacatepay.com/v2/transparents/create", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        method: "PIX",
        data: {
          amount: expected.amount,
          description: expected.name,
          expiresIn: 3600,
          externalId,
          metadata: {
            user_id: user.id,
            user_email: user.email,
            plan_type: planType,
            billing_period: billingPeriod,
          },
        },
      }),
    });

    const json = await res.json();
    log("abacate response", { status: res.status, success: json?.success, error: json?.error });

    if (!res.ok || !json?.success || !json?.data?.brCode) {
      throw new Error(`ABACATE: ${json?.error ?? res.statusText}`);
    }

    const responseAmount = typeof json.data.amount === "number" ? json.data.amount : null;
    if (responseAmount !== expected.amount) {
      throw new Error(`ABACATE: amount mismatch — ${responseAmount ?? "missing"} != ${expected.amount}`);
    }

    return new Response(
      JSON.stringify({
        id: json.data.id,
        brCode: json.data.brCode,
        brCodeBase64: json.data.brCodeBase64,
        expiresAt: json.data.expiresAt,
        externalId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log("ERROR", { message });
    return new Response(
      JSON.stringify({ error: "Não foi possível gerar a cobrança PIX.", detail: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
    );
  }
};

serve(createHandler());
