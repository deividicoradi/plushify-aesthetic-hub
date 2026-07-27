import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createRemoteJWKSet, jwtVerify } from "https://esm.sh/jose@5.9.6";
import { buildCorsHeaders } from "../_shared/cors.ts";

// Permite ao frontend fazer polling do status de uma cobrança PIX
// transparente (criada por abacate-create-pix-charge) sem depender só do
// webhook — o usuário quer ver a tela virar "pago" assim que escanear o
// QR Code, e o webhook pode levar alguns segundos (ou, no dev sandbox, só é
// disparado via simulate-payment). A ativação real do plano continua
// exclusivamente pelo webhook (fonte de verdade); esta função é só leitura,
// não ativa nada.
const log = (step: string, details?: unknown) => {
  const suffix = details === undefined ? "" : ` - ${JSON.stringify(details)}`;
  console.log(`[ABACATE-CHECK-PIX-STATUS] ${step}${suffix}`);
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
    if (!claims.sub) throw new Error("AUTH: token missing sub");

    const body = await req.json().catch(() => ({}));
    const id = String(body.id ?? "");
    const externalId = String(body.externalId ?? "");
    if (!id || !externalId) throw new Error("INPUT: missing id/externalId");

    // externalId foi criado como "plushify:<userId>:<planType>:<billingPeriod>:<uuid>"
    // por abacate-create-pix-charge — confere que a cobrança pertence a quem está
    // perguntando antes de revelar o status pra evitar um usuário sondar cobranças
    // de outro só adivinhando/enumerando ids.
    const parts = externalId.split(":");
    if (parts.length < 2 || parts[0] !== "plushify" || parts[1] !== claims.sub) {
      throw new Error("AUTH: externalId does not belong to this user");
    }

    const res = await fetch(`https://api.abacatepay.com/v2/transparents/check?id=${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const json = await res.json();

    if (!res.ok || !json?.success) {
      throw new Error(`ABACATE: ${json?.error ?? res.statusText}`);
    }

    return new Response(JSON.stringify({ status: json.data?.status ?? "PENDING" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log("ERROR", { message });
    return new Response(
      JSON.stringify({ error: "Não foi possível verificar o status do pagamento.", detail: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
    );
  }
};

serve(createHandler());
