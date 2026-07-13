import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Mesma referência oficial usada em abacate-create-subscription.
const EXPECTED_PLANS = {
  professional: {
    monthly: { productId: "prod_bDC0SgHXsdz2y5aKYkf6zLQf", name: "Plushify Profissional (Mensal)", amount: 8900,   cycle: "MONTHLY"   },
    annual:  { productId: "prod_bM42yN1t65DCWRxj5d0NNQdx", name: "Plushify Profissional (Anual)",  amount: 89000,  cycle: "ANNUALLY"  },
  },
  premium: {
    monthly: { productId: "prod_TXrDWNj1Kc1wgcPRhn01Cnaf", name: "Plushify Premium (Mensal)",      amount: 17900,  cycle: "MONTHLY"   },
    annual:  { productId: "prod_FWGcbH5Puu5eua6M0652RRNy", name: "Plushify Premium (Anual)",       amount: 179000, cycle: "ANNUALLY"  },
  },
} as const;

const formatBRL = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("ABACATE_API_KEY");
    if (!apiKey) throw new Error("ABACATE_API_KEY missing");

    const res = await fetch("https://api.abacatepay.com/v2/products/list", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const json = await res.json();
    if (!res.ok || !json?.success) {
      throw new Error(`AbacatePay list error: ${json?.error ?? res.statusText}`);
    }
    const products = json.data as Array<Record<string, unknown>>;

    const scenarios: Array<{
      plan: string; cycle: string; ok: boolean;
      expected: { productId: string; name: string; amount: number; amountBRL: string; cycle: string };
      actual: { productId?: string; name?: string; amount?: number; amountBRL?: string; cycle?: string; status?: string } | null;
      issues: string[];
    }> = [];

    for (const [plan, cycles] of Object.entries(EXPECTED_PLANS)) {
      for (const [cycle, exp] of Object.entries(cycles)) {
        const remote = products.find((p) => p.id === exp.productId);
        const issues: string[] = [];
        if (!remote) {
          issues.push(`Produto ${exp.productId} não encontrado na AbacatePay`);
          scenarios.push({
            plan, cycle, ok: false,
            expected: { ...exp, amountBRL: formatBRL(exp.amount) },
            actual: null, issues,
          });
          continue;
        }
        if (remote.id !== exp.productId) issues.push(`productId ${remote.id} != ${exp.productId}`);
        if (remote.name !== exp.name) issues.push(`nome "${remote.name}" != "${exp.name}"`);
        if (remote.price !== exp.amount) issues.push(`valor ${remote.price} != ${exp.amount}`);
        if (remote.cycle !== exp.cycle) issues.push(`ciclo ${remote.cycle} != ${exp.cycle}`);
        if (remote.status !== "ACTIVE") issues.push(`status ${remote.status} != ACTIVE`);
        scenarios.push({
          plan, cycle, ok: issues.length === 0,
          expected: { ...exp, amountBRL: formatBRL(exp.amount) },
          actual: {
            productId: remote.id as string,
            name: remote.name as string,
            amount: remote.price as number,
            amountBRL: formatBRL(remote.price as number),
            cycle: remote.cycle as string,
            status: remote.status as string,
          },
          issues,
        });
      }
    }

    const allOk = scenarios.every((s) => s.ok);
    return new Response(
      JSON.stringify({ ok: allOk, checkedAt: new Date().toISOString(), scenarios }, null, 2),
      { status: allOk ? 200 : 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ ok: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});