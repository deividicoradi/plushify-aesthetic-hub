import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { createRemoteJWKSet, jwtVerify } from "https://esm.sh/jose@5.9.6";
import { buildCorsHeaders } from "../_shared/cors.ts";

// Upgrade de plano com crédito proporcional pelos dias não usados do plano
// atual (pró-rata) — sem a multa de 50% da cláusula de CANCELAMENTO dos
// Termos de Uso: cancelar o serviço e fazer upgrade continuando cliente são
// situações diferentes, e cobrar multa de quem está continuando a usar (só
// mudando de plano) seria uma vantagem excessiva vedada pelo CDC (art. 6º, V).
//
// O valor a cobrar hoje (diferença já descontada) nunca é um preço fixo de
// catálogo — varia por cliente conforme quanto tempo falta pro plano atual
// vencer. A API da AbacatePay só aceita cobrar por um "product" já cadastrado
// com preço fixo (/v2/checkouts/create rejeita preço solto: "No products
// found" em teste real) — por isso criamos um produto novo, com o valor
// exato calculado, a cada upgrade (via /v2/products/create, confirmado
// funcional em teste real 2026-07-28), e apontamos o checkout pra ele.
export const CATALOG_PRICES: Record<string, Record<string, number>> = {
  professional: { month: 8900, year: 89000 },
  premium: { month: 17900, year: 179000 },
};

const PLAN_LABELS: Record<string, string> = {
  professional: "Profissional",
  premium: "Premium",
};

const log = (step: string, details?: unknown) => {
  const suffix = details === undefined ? "" : ` - ${JSON.stringify(details)}`;
  console.log(`[ABACATE-CREATE-UPGRADE-CHECKOUT] ${step}${suffix}`);
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
    const newPlanType = String(body.new_plan_type ?? "");
    const newBillingInterval = String(body.new_billing_interval ?? "");
    if (!["professional", "premium"].includes(newPlanType)) throw new Error("INPUT: invalid new_plan_type");
    if (!["month", "year"].includes(newBillingInterval)) throw new Error("INPUT: invalid new_billing_interval");

    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Cotação SEMPRE recalculada aqui no servidor (nunca confiar em valor
    // vindo do cliente) — mesma RPC que a tela de resumo usa, então o valor
    // mostrado antes de clicar bate exatamente com o cobrado.
    const { data: quote, error: quoteError } = await admin.rpc("calculate_upgrade_quote", {
      p_user_id: user.id,
      p_new_plan_type: newPlanType,
      p_new_billing_interval: newBillingInterval,
    });

    if (quoteError) {
      throw new Error(`QUOTE: ${quoteError.message}`);
    }

    const chargeNow = Number(quote.charge_now_cents);
    if (!Number.isFinite(chargeNow) || chargeNow < 0) {
      throw new Error("QUOTE: invalid charge_now_cents");
    }

    const origin = req.headers.get("origin") ?? "https://plushify-aesthetic-hub.lovable.app";
    const returnUrl = `${origin}/`;
    const completionUrl = `${origin}/dashboard?success=true&plan=${newPlanType}&billing=${newBillingInterval === "year" ? "annual" : "monthly"}`;
    const externalId = ["plushify", user.id, newPlanType, newBillingInterval === "year" ? "annual" : "monthly", crypto.randomUUID()].join(":");

    // Se não sobrou nada a cobrar (crédito cobre o valor todo), ainda assim
    // criamos uma cobrança de R$0,01 simbólica — a AbacatePay não permite
    // checkout de valor zero, e precisamos de um evento checkout.completed
    // real pra disparar a ativação do novo plano via webhook.
    const productPrice = Math.max(chargeNow, 1);

    log("creating dynamic product", { userId: user.id, newPlanType, newBillingInterval, chargeNow, quote });

    const productRes = await fetch("https://api.abacatepay.com/v2/products/create", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        externalId: `upgrade-${externalId}`,
        name: `Plushify ${PLAN_LABELS[newPlanType] ?? newPlanType} — Upgrade (crédito aplicado)`,
        description: `Upgrade com crédito proporcional de R$ ${(Number(quote.credit_cents) / 100).toFixed(2)} pelos dias não usados do plano anterior.`,
        price: productPrice,
        currency: "BRL",
      }),
    });
    const productJson = await productRes.json();
    if (!productRes.ok || !productJson?.success || !productJson?.data?.id) {
      throw new Error(`ABACATE: could not create upgrade product (${productJson?.error ?? productRes.statusText})`);
    }
    const productId = productJson.data.id as string;

    const res = await fetch("https://api.abacatepay.com/v2/checkouts/create", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ id: productId, quantity: 1 }],
        methods: ["PIX", "CARD"],
        card: { maxInstallments: newBillingInterval === "year" ? 12 : 1 },
        returnUrl,
        completionUrl,
        externalId,
        metadata: {
          user_id: user.id,
          user_email: user.email,
          plan_type: newPlanType,
          billing_period: newBillingInterval === "year" ? "annual" : "monthly",
          is_upgrade: "true",
          previous_plan_type: quote.current_plan_type,
          credit_applied_cents: String(quote.credit_cents),
        },
      }),
    });

    const json = await res.json();
    log("abacate response", { status: res.status, success: json?.success, error: json?.error });

    if (!res.ok || !json?.success || !json?.data?.url) {
      throw new Error(`ABACATE: ${json?.error ?? res.statusText}`);
    }

    return new Response(
      JSON.stringify({ url: json.data.url, id: json.data.id, externalId, quote }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log("ERROR", { message });
    return new Response(
      JSON.stringify({ error: "Não foi possível iniciar o upgrade.", detail: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
    );
  }
};

serve(createHandler());
