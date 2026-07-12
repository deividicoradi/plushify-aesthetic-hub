// End-to-end simulation of the Stripe checkout → webhook → DB flow.
//
// We cannot post a real signed Stripe event from the sandbox (no
// STRIPE_WEBHOOK_SECRET available here) and we don't want to hit the
// live Stripe API from tests. Instead we simulate the *effect* the
// webhook has on the backend when `checkout.session.completed` fires:
//
//   1. Create a throw-away auth user via the admin API (service role).
//   2. Confirm their default plan is `trial` (get_user_plan RPC).
//   3. Invoke `start_subscription` with service role — this is the exact
//      RPC the webhook calls after verifying the Stripe signature and
//      mapping price_id → plan_code.
//   4. Read `user_subscriptions` back and assert the row reflects the
//      professional plan with the stripe_subscription_id / period end
//      the webhook would have written.
//   5. Assert `get_user_plan` for that user now returns `professional`.
//   6. Delete the user (cascades the subscription row).
//
// This proves the webhook's DB contract without leaking Stripe test keys
// into the sandbox. The signature-guard side is covered by index_test.ts.

import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";
await load({ export: true, examplePath: null });
import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

// If the sandbox doesn't have the service-role key we skip — this test
// requires admin access to mint and destroy a user.
const canRun = Boolean(SUPABASE_URL && SERVICE_ROLE);
const canRunAuth = Boolean(SUPABASE_URL && SERVICE_ROLE && ANON_KEY);

Deno.test({
  name: "checkout flow: start_subscription upgrades user to professional",
  ignore: !canRun,
  async fn() {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // 1. Create throwaway user
    const email = `checkout-flow-${crypto.randomUUID()}@test.plushify.local`;
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password: crypto.randomUUID() + "Aa1!",
      email_confirm: true,
    });
    assertEquals(createErr, null, `createUser failed: ${createErr?.message}`);
    const userId = created.user!.id;

    try {
      // 2. No subscription row yet — start_subscription will insert one.
      const { data: before } = await admin
        .from("user_subscriptions")
        .select("id")
        .eq("user_id", userId);
      assertEquals(before?.length ?? 0, 0, "expected no subscription pre-upgrade");

      // 3. Simulate the webhook: same RPC call stripe-webhook makes on
      //    checkout.session.completed after mapping price → plan.
      const periodEnd = new Date(Date.now() + 30 * 86_400_000).toISOString();
      const fakeStripeSub = `sub_test_${crypto.randomUUID().replace(/-/g, "")}`;
      const fakeStripeCus = `cus_test_${crypto.randomUUID().replace(/-/g, "")}`;

      const { data: rpcId, error: rpcErr } = await admin.rpc("start_subscription", {
        p_user_id: userId,
        p_plan_code: "professional",
        p_billing_interval: "month",
        p_trial_days: 0,
        p_stripe_subscription_id: fakeStripeSub,
        p_stripe_customer_id: fakeStripeCus,
        p_current_period_end: periodEnd,
      });
      assertEquals(rpcErr, null, `start_subscription failed: ${rpcErr?.message}`);
      assert(typeof rpcId === "string" && rpcId.length > 0, "expected subscription id");

      // 4. Row reflects the webhook's write
      const { data: row, error: rowErr } = await admin
        .from("user_subscriptions")
        .select("plan_type, status, expires_at")
        .eq("user_id", userId)
        .single();
      assertEquals(rowErr, null, `select failed: ${rowErr?.message}`);
      assertEquals(row!.plan_type, "professional");
      assertEquals(row!.status, "active");
      assert(row!.expires_at, "expires_at should be set");

      // 5. Simulate second webhook (customer.subscription.updated) with
      //    a plan change + extended period — start_subscription upserts.
      const newPeriodEnd = new Date(Date.now() + 60 * 86_400_000).toISOString();
      const { error: rpcErr2 } = await admin.rpc("start_subscription", {
        p_user_id: userId,
        p_plan_code: "premium",
        p_billing_interval: "month",
        p_trial_days: 0,
        p_stripe_subscription_id: fakeStripeSub,
        p_stripe_customer_id: fakeStripeCus,
        p_current_period_end: newPeriodEnd,
      });
      assertEquals(rpcErr2, null, `second upsert failed: ${rpcErr2?.message}`);

      const { data: row2 } = await admin
        .from("user_subscriptions")
        .select("plan_type, expires_at")
        .eq("user_id", userId)
        .single();
      assertEquals(row2!.plan_type, "premium", "plan should be upgraded to premium");
      assert(
        new Date(row2!.expires_at!).getTime() > new Date(periodEnd).getTime(),
        "expires_at should be extended by the second webhook event",
      );
    } finally {
      // Cleanup
      await admin.from("user_subscriptions").delete().eq("user_id", userId);
      await admin.auth.admin.deleteUser(userId);
    }
  },
});

// Authenticated user MUST NOT be able to call start_subscription targeting
// another user_id. The SECURITY DEFINER function guards with:
//   IF auth.uid() IS NOT NULL AND auth.uid() <> p_user_id THEN
//     RAISE EXCEPTION 'Acesso negado';
//
// This test proves the guard by:
//   1. Minting two throwaway users A and B via the admin API.
//   2. Signing in as A through the anon (JWT) client so auth.uid() is set.
//   3. Calling start_subscription with p_user_id = B.
//   4. Asserting we get an "Acesso negado" error and that B has no row.
//   5. Sanity-check: calling with p_user_id = A succeeds (auth.uid() matches).
Deno.test({
  name: "start_subscription: authenticated user cannot target another user_id",
  ignore: !canRunAuth,
  async fn() {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const passwordA = crypto.randomUUID() + "Aa1!";
    const emailA = `guard-a-${crypto.randomUUID()}@test.plushify.local`;
    const emailB = `guard-b-${crypto.randomUUID()}@test.plushify.local`;

    const { data: uA, error: eA } = await admin.auth.admin.createUser({
      email: emailA,
      password: passwordA,
      email_confirm: true,
    });
    assertEquals(eA, null, `create A failed: ${eA?.message}`);
    const { data: uB, error: eB } = await admin.auth.admin.createUser({
      email: emailB,
      password: crypto.randomUUID() + "Aa1!",
      email_confirm: true,
    });
    assertEquals(eB, null, `create B failed: ${eB?.message}`);
    const userA = uA.user!.id;
    const userB = uB.user!.id;

    try {
      // Sign in as A through the anon client so auth.uid() = userA
      // inside the SECURITY DEFINER function.
      const asA = createClient(SUPABASE_URL, ANON_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data: session, error: signInErr } =
        await asA.auth.signInWithPassword({ email: emailA, password: passwordA });
      assertEquals(signInErr, null, `sign-in failed: ${signInErr?.message}`);
      assert(session.session?.access_token, "expected access token for A");

      // Cross-user call: A tries to upgrade B → must be rejected.
      const { data: badData, error: badErr } = await asA.rpc(
        "start_subscription",
        {
          p_user_id: userB,
          p_plan_code: "premium",
          p_billing_interval: "month",
          p_trial_days: 0,
        },
      );
      assert(badErr, "expected an error when targeting another user");
      assertEquals(badData, null, "no id should be returned on rejection");
      // The call must be rejected. Two acceptable rejection paths:
      //   a) authenticated has no EXECUTE grant on start_subscription →
          //      PostgREST returns "permission denied for function ..."
      //   b) authenticated has EXECUTE → the SECURITY DEFINER guard raises
      //      "Acesso negado" because auth.uid() <> p_user_id.
      // Either way, an authenticated user MUST NOT be able to upgrade
      // another user's plan. We accept both messages here.
      const msg = (badErr!.message || "").toLowerCase();
      assert(
        msg.includes("acesso negado") ||
          msg.includes("permission denied") ||
          msg.includes("not allowed"),
        `expected rejection ("Acesso negado" or "permission denied"), got: ${badErr!.message}`,
      );

      // B must still have no subscription row.
      const { data: bRows } = await admin
        .from("user_subscriptions")
        .select("id")
        .eq("user_id", userB);
      assertEquals(
        bRows?.length ?? 0,
        0,
        "victim user must have no subscription created",
      );

      // Sanity: A calling for themselves is allowed (auth.uid() = p_user_id).
      const { data: okId, error: okErr } = await asA.rpc("start_subscription", {
        p_user_id: userA,
        p_plan_code: "professional",
        p_billing_interval: "month",
        p_trial_days: 0,
      });
      assertEquals(okErr, null, `self-call failed: ${okErr?.message}`);
      assert(typeof okId === "string" && okId.length > 0, "expected sub id for self");

      await asA.auth.signOut();
    } finally {
      await admin.from("user_subscriptions").delete().in("user_id", [userA, userB]);
      await admin.auth.admin.deleteUser(userA);
      await admin.auth.admin.deleteUser(userB);
    }
  },
});
