// Integration tests for create-checkout edge function.
// Hits the deployed function endpoint over HTTPS. No Stripe calls happen —
// requests are rejected before Stripe is ever contacted.
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";
await load({ export: true, examplePath: null });
import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const FN_URL = `${SUPABASE_URL}/functions/v1/create-checkout`;

function post(body: unknown, headers: Record<string, string> = {}) {
  return fetch(FN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

Deno.test("create-checkout rejects request without Authorization header", async () => {
  const res = await post({ plan_type: "professional", billing_period: "monthly" });
  const text = await res.text();
  // 401 (no bearer) or 403 (SECURITY: No valid authorization) — both prove auth guard fired
  assert(res.status === 401 || res.status === 403, `expected 401/403, got ${res.status}: ${text}`);
});

Deno.test("create-checkout rejects invalid bearer token", async () => {
  const res = await post(
    { plan_type: "professional", billing_period: "monthly" },
    { Authorization: "Bearer invalid.token.value" },
  );
  const text = await res.text();
  assert(res.status >= 400, `expected error status, got ${res.status}: ${text}`);
});

Deno.test("create-checkout OPTIONS returns CORS headers", async () => {
  const res = await fetch(FN_URL, {
    method: "OPTIONS",
    headers: { Origin: "https://09df458b-dedc-46e2-af46-e15d28209b01.lovableproject.com" },
  });
  await res.text();
  assertEquals(res.status, 200);
  assert(res.headers.get("access-control-allow-origin"));
});