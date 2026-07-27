import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createRemoteJWKSet, jwtVerify } from "https://esm.sh/jose@5.9.6";
import { buildCorsHeaders } from "../_shared/cors.ts";

// Checkout de pagamento ÚNICO (sem recorrência automática) para os 4 planos
// (Professional/Premium x Mensal/Anual). Usa /v2/checkouts/create com os
// produtos "Pagamento avulso" do catálogo (sem cycle) — produtos "Assinatura"
// nesse mesmo endpoint disparavam "PIX Automático is not available for this
// store". Como não há recorrência automática aqui, o usuário precisa comprar
// de novo manualmente quando o período expirar.
//
// Mesmo padrão de segurança de abacate-create-subscription: JWT validado via
// JWKS, plano/preço conferidos contra o catálogo real da AbacatePay antes de
// abrir o checkout (evita manipulação de preço pelo cliente).
export const EXPECTED_PLANS = {
  professional: {
    monthly: {
      productId: "prod_yT55aw266gN4U0aKWypwAfSD",
      name: "Plushify Profissional 1 mês",
      amount: 8900,
      cycle: null,
    },
    annual: {
      productId: "prod_hLaqZTpStG1uMjdJBErKPc6c",
      name: "Plushify Profissional 1 ano",
      amount: 89000,
      cycle: null,
    },
  },
  premium: {
    monthly: {
      productId: "prod_5dtqUL31bTqUDzf3TfgDwQbA",
      name: "Plushify Premium 1 mês",
      amount: 17900,
      cycle: null,
    },
    annual: {
      productId: "prod_HFwLzxRtcTRSY4YdgQfRmNTY",
      name: "Plushify Premium 1 ano",
      amount: 179000,
      cycle: null,
    },
  },
} as const;

type PlanKey = keyof typeof EXPECTED_PLANS;
type CycleKey = keyof typeof EXPECTED_PLANS["professional"];

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

    const expected = EXPECTED_PLANS[planType]?.[billingPeriod];
    if (!expected) throw new Error(`INPUT: invalid plan ${planType}/${billingPeriod}`);
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
      throw new Error(`VERIFY: product ${productId} not found on AbacatePay for ${planType}/${billingPeriod}`);
    }
    const mismatches: string[] = [];
    if (remote.price !== expected.amount) mismatches.push(`price ${remote.price} != ${expected.amount}`);
    if (remote.name !== expected.name) mismatches.push(`name "${remote.name}" != "${expected.name}"`);
    if ((remote.cycle ?? null) !== expected.cycle) mismatches.push(`cycle ${remote.cycle} != ${expected.cycle}`);
    if (remote.status !== "ACTIVE") mismatches.push(`status ${remote.status} != ACTIVE`);
    if (mismatches.length) {
      throw new Error(`VERIFY: ${planType}/${billingPeriod} mismatch — ${mismatches.join("; ")}`);
    }
    log("verified", { productId, name: remote.name, price: remote.price, cycle: remote.cycle });

    const origin = req.headers.get("origin") ?? "https://plushify-aesthetic-hub.lovable.app";
    const returnUrl = `${origin}/`;
    const completionUrl = `${origin}/planos?success=true&plan=${planType}&billing=${billingPeriod}`;

    const externalId = ["plushify", user.id, planType, billingPeriod, crypto.randomUUID()].join(":");

    log("creating checkout", { userId: user.id, planType, billingPeriod, productId, externalId });

    const res = await fetch("https://api.abacatepay.com/v2/checkouts/create", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [{ id: productId, quantity: 1 }],
        // PIX removido: descoberto em teste real (2026-07-27) que "PIX
        // Automático" não está habilitado pra esta loja na AbacatePay
        // ("PIX Automático is not available for this store") quando o
        // produto referenciado é do tipo Assinatura. Usando produtos
        // avulsos (sem cycle) o erro não ocorre, mas o CARD parcelado
        // continua sendo o método usado.
        methods: ["CARD"],
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
      JSON.stringify({ error: "Não foi possível iniciar o checkout.", detail: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
    );
  }
};

serve(createHandler());
