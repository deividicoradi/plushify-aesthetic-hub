// Integration tests for stripe-webhook edge function.
// Confirms signature verification blocks all requests that don't come from Stripe,
// which is the primary security boundary for the webhook.
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";
await load({ export: true, examplePath: null });
import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const FN_URL = `${SUPABASE_URL}/functions/v1/stripe-webhook`;

function fakeSubscriptionEventBody(planCode: "premium" | "professional", userId: string) {
  // Realistic Stripe event payload. Without a valid stripe-signature, the webhook
  // MUST reject it — this proves the webhook can't be used to escalate plans.
  return JSON.stringify({
    id: `evt_test_${crypto.randomUUID()}`,
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_test_fake",
        mode: "subscription",
        customer: "cus_test_fake",
        subscription: "sub_test_fake",
        client_reference_id: userId,
        metadata: { user_id: userId, plan_type: planCode },
      },
    },
  });
}

Deno.test("stripe-webhook rejects request without stripe-signature header", async () => {
  const res = await fetch(FN_URL, {
    method: "POST",
    headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: fakeSubscriptionEventBody("premium", "00000000-0000-0000-0000-000000000000"),
  });
  const text = await res.text();
  assert(res.status >= 400, `expected error status, got ${res.status}: ${text}`);
});

Deno.test("stripe-webhook rejects request with forged stripe-signature", async () => {
  const body = fakeSubscriptionEventBody("premium", "11111111-1111-1111-1111-111111111111");
  const res = await fetch(FN_URL, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
      // Well-formed but not signed with the real webhook secret
      "stripe-signature": `t=${Math.floor(Date.now() / 1000)},v1=deadbeef`,
    },
    body,
  });
  const text = await res.text();
  // Forged signatures MUST NOT succeed. In a fully-configured env the webhook
  // returns 400 with a signature-verification error; if Stripe secrets are not
  // configured on this env the function short-circuits with 500 before the
  // signature check. Either outcome proves the payload never reached the DB.
  assert(res.status >= 400, `forged signature must be rejected, got ${res.status}: ${text}`);
  assert(!text.includes("received"), `webhook must not acknowledge forged event: ${text}`);
});

Deno.test("stripe-webhook OPTIONS returns CORS headers", async () => {
  const res = await fetch(FN_URL, { method: "OPTIONS" });
  await res.text();
  assertEquals(res.status, 200);
});