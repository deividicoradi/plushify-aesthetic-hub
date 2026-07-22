import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { createHandler, EXPECTED_PLANS } from "./index.ts";

Deno.env.set("ABACATE_API_KEY", "test-key");
Deno.env.set("SUPABASE_URL", "https://test.supabase.co");

const fakeVerify = async () => ({ sub: "user-123", email: "user@test.com" });

type Call = { url: string; init?: RequestInit };

function stubFetch(onCreate: (body: any) => { id: string; url: string; amount: number; itemId: string }) {
  const calls: Call[] = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (input: any, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.url;
    calls.push({ url, init });
    if (url.endsWith("/v2/products/list")) {
      const data = Object.values(EXPECTED_PLANS).flatMap((cycles) =>
        Object.values(cycles).map((p) => ({
          id: p.productId,
          name: p.name,
          price: p.amount,
          cycle: p.cycle,
          status: "ACTIVE",
        }))
      );
      return new Response(JSON.stringify({ success: true, data }), { status: 200 });
    }
    if (url.endsWith("/v2/subscriptions/create")) {
      const body = JSON.parse(String(init?.body ?? "{}"));
      const created = onCreate(body);
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            id: created.id,
            url: created.url,
            amount: created.amount,
            items: [{ id: created.itemId, quantity: 1 }],
          },
        }),
        { status: 200 },
      );
    }
    return new Response("not found", { status: 404 });
  }) as typeof fetch;
  return {
    calls,
    restore: () => {
      globalThis.fetch = originalFetch;
    },
  };
}

function makeReq(plan: string, cycle: string) {
  return new Request("http://localhost/abacate-create-subscription", {
    method: "POST",
    headers: { Authorization: "Bearer fake-token", "Content-Type": "application/json" },
    body: JSON.stringify({ plan_type: plan, billing_period: cycle }),
  });
}

const scenarios: Array<{ plan: keyof typeof EXPECTED_PLANS; cycle: "monthly" | "annual" }> = [
  { plan: "professional", cycle: "monthly" },
  { plan: "professional", cycle: "annual" },
  { plan: "premium", cycle: "monthly" },
  { plan: "premium", cycle: "annual" },
];

for (const { plan, cycle } of scenarios) {
  Deno.test(`E2E checkout matches selected plan: ${plan}/${cycle}`, async () => {
    const expected = EXPECTED_PLANS[plan][cycle];
    const stub = stubFetch((body) => {
      // The handler must send exactly the productId for the requested plan.
      assertEquals(body.items[0].id, expected.productId);
      return {
        id: `bill_${plan}_${cycle}`,
        url: `https://app.abacatepay.com/pay/bill_${plan}_${cycle}`,
        amount: expected.amount,
        itemId: expected.productId,
      };
    });
    try {
      const handler = createHandler(fakeVerify);
      const res = await handler(makeReq(plan, cycle));
      const json = await res.json();
      assertEquals(res.status, 200, `expected 200, got ${res.status}: ${JSON.stringify(json)}`);
      assertEquals(json.id, `bill_${plan}_${cycle}`);
      assertStringIncludes(json.url, `bill_${plan}_${cycle}`);
      assertStringIncludes(json.externalId, `${plan}:${cycle}`);
    } finally {
      stub.restore();
    }
  });
}

Deno.test("rejects when AbacatePay returns a mismatched product", async () => {
  const wrong = EXPECTED_PLANS.professional.monthly; // return the R$89 bill regardless of request
  const stub = stubFetch(() => ({
    id: "bill_wrong",
    url: "https://app.abacatepay.com/pay/bill_wrong",
    amount: wrong.amount,
    itemId: wrong.productId,
  }));
  try {
    const handler = createHandler(fakeVerify);
    // Ask for Premium Annual but Abacate returns Professional Monthly -> must fail.
    const res = await handler(makeReq("premium", "annual"));
    const json = await res.json();
    assertEquals(res.status, 400);
    assertStringIncludes(json.detail, "checkout mismatch");
  } finally {
    stub.restore();
  }
});

Deno.test("each scenario produces a unique externalId (no bill reuse)", async () => {
  const seen = new Set<string>();
  for (const { plan, cycle } of scenarios) {
    const expected = EXPECTED_PLANS[plan][cycle];
    const stub = stubFetch(() => ({
      id: `bill_${plan}_${cycle}`,
      url: `https://app.abacatepay.com/pay/bill_${plan}_${cycle}`,
      amount: expected.amount,
      itemId: expected.productId,
    }));
    try {
      const handler = createHandler(fakeVerify);
      const res = await handler(makeReq(plan, cycle));
      const json = await res.json();
      seen.add(json.externalId);
    } finally {
      stub.restore();
    }
  }
  assertEquals(seen.size, scenarios.length);
});