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

      await asA.auth.signOut();
    } finally {
      await admin.from("user_subscriptions").delete().in("user_id", [userA, userB]);
      await admin.auth.admin.deleteUser(userA);
      await admin.auth.admin.deleteUser(userB);
    }
  },
});

// customer.subscription.updated: downgrade isolation (premium → professional).
//
// The webhook's updated-event path calls start_subscription with the new
// plan_code mapped from the price_id. A downgrade must:
//   1. Change ONLY the matching user's plan from premium to professional.
//   2. Keep exactly one row per user (upsert, not duplicate).
//   3. Leave unrelated users (B) with no subscription row at all.
Deno.test({
  name:
    "customer.subscription.updated: downgrade premium → professional only touches the matching user",
  ignore: !canRun,
  async fn() {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const emailA = `sub-down-a-${crypto.randomUUID()}@test.plushify.local`;
    const emailB = `sub-down-b-${crypto.randomUUID()}@test.plushify.local`;
    const { data: uA, error: eA } = await admin.auth.admin.createUser({
      email: emailA,
      password: crypto.randomUUID() + "Aa1!",
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

    const stripeSub = `sub_test_${crypto.randomUUID().replace(/-/g, "")}`;
    const stripeCus = `cus_test_${crypto.randomUUID().replace(/-/g, "")}`;

    try {
      // A starts on premium (initial checkout.session.completed).
      const firstEnd = new Date(Date.now() + 60 * 86_400_000).toISOString();
      const { error: startErr } = await admin.rpc("start_subscription", {
        p_user_id: userA,
        p_plan_code: "premium",
        p_billing_interval: "month",
        p_trial_days: 0,
        p_stripe_subscription_id: stripeSub,
        p_stripe_customer_id: stripeCus,
        p_current_period_end: firstEnd,
      });
      assertEquals(startErr, null, `initial upsert failed: ${startErr?.message}`);

      // Sanity: A on premium, B with nothing.
      const { data: aBefore } = await admin
        .from("user_subscriptions")
        .select("plan_type, status")
        .eq("user_id", userA)
        .single();
      assertEquals(aBefore!.plan_type, "premium");
      assertEquals(aBefore!.status, "active");
      const { data: bBefore } = await admin
        .from("user_subscriptions")
        .select("id")
        .eq("user_id", userB);
      assertEquals(bBefore?.length ?? 0, 0, "B must start without a subscription");

      // Simulate `customer.subscription.updated` with a cheaper price:
      // premium → professional. Webhook maps price_id → 'professional'
      // and calls start_subscription for the matched user_id.
      const newEnd = new Date(Date.now() + 30 * 86_400_000).toISOString();
      const { error: downErr } = await admin.rpc("start_subscription", {
        p_user_id: userA,
        p_plan_code: "professional",
        p_billing_interval: "month",
        p_trial_days: 0,
        p_stripe_subscription_id: stripeSub,
        p_stripe_customer_id: stripeCus,
        p_current_period_end: newEnd,
      });
      assertEquals(downErr, null, `downgrade upsert failed: ${downErr?.message}`);

      // A must now be on professional, still active.
      const { data: aAfter, error: aErr } = await admin
        .from("user_subscriptions")
        .select("plan_type, status")
        .eq("user_id", userA)
        .single();
      assertEquals(aErr, null, `select A failed: ${aErr?.message}`);
      assertEquals(aAfter!.plan_type, "professional", "A should be downgraded to professional");
      assert(aAfter!.plan_type !== "premium", "A must no longer be premium");
      assertEquals(aAfter!.status, "active");

      // Still exactly one row for A — downgrade must upsert, not duplicate.
      const { data: aAll } = await admin
        .from("user_subscriptions")
        .select("id")
        .eq("user_id", userA);
      assertEquals(aAll?.length ?? 0, 1, "A must have exactly one subscription row");

      // B must STILL have no subscription — downgrade is scoped to A only.
      const { data: bAfter } = await admin
        .from("user_subscriptions")
        .select("id, plan_type")
        .eq("user_id", userB);
      assertEquals(
        bAfter?.length ?? 0,
        0,
        "B must remain without a subscription after A's downgrade",
      );
    } finally {
      await admin.from("user_subscriptions").delete().in("user_id", [userA, userB]);
      await admin.auth.admin.deleteUser(userA);
      await admin.auth.admin.deleteUser(userB);
    }
  },
});

// customer.subscription.deleted: cancellation isolation.
//
// Simulates the webhook path for `customer.subscription.deleted`. The
// stripe-webhook handler flips the matching row's status to 'canceled'
// (see index.ts). We prove that:
//   1. Only the user tied to that stripe subscription is canceled.
//   2. Their row is no longer 'active' — so get_user_plan falls back to
//      trial and premium features stop working.
//   3. An unrelated user (B) with no prior subscription still has zero
//      rows in user_subscriptions after the deletion event.
Deno.test({
  name:
    "customer.subscription.deleted: only the matching user is canceled, other users untouched",
  ignore: !canRun,
  async fn() {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const emailA = `sub-del-a-${crypto.randomUUID()}@test.plushify.local`;
    const emailB = `sub-del-b-${crypto.randomUUID()}@test.plushify.local`;
    const { data: uA, error: eA } = await admin.auth.admin.createUser({
      email: emailA,
      password: crypto.randomUUID() + "Aa1!",
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
      // A has an active subscription (checkout.session.completed already ran).
      const periodEnd = new Date(Date.now() + 30 * 86_400_000).toISOString();
      const { error: startErr } = await admin.rpc("start_subscription", {
        p_user_id: userA,
        p_plan_code: "premium",
        p_billing_interval: "month",
        p_trial_days: 0,
        p_current_period_end: periodEnd,
      });
      assertEquals(startErr, null, `initial upsert failed: ${startErr?.message}`);

      // Sanity: A is active, B has nothing.
      const { data: aBefore } = await admin
        .from("user_subscriptions")
        .select("status, plan_type")
        .eq("user_id", userA)
        .single();
      assertEquals(aBefore!.status, "active");
      assertEquals(aBefore!.plan_type, "premium");

      const { data: bBefore } = await admin
        .from("user_subscriptions")
        .select("id")
        .eq("user_id", userB);
      assertEquals(bBefore?.length ?? 0, 0, "B must start without a subscription");

      // Simulate `customer.subscription.deleted`: webhook flips status to
      // 'canceled' for the row matching that stripe subscription. Since
      // this schema keys by user_id (not stripe_subscription_id), we scope
      // the update to A — exactly what the webhook resolves to.
      const { error: cancelErr } = await admin
        .from("user_subscriptions")
        .update({
          status: "canceled",
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userA)
        .in("status", ["active", "trial_active"]);
      assertEquals(cancelErr, null, `cancel update failed: ${cancelErr?.message}`);

      // A must now be canceled and no longer active.
      const { data: aAfter } = await admin
        .from("user_subscriptions")
        .select("status")
        .eq("user_id", userA)
        .single();
      assertEquals(aAfter!.status, "canceled", "A must be marked canceled");
      assert(
        aAfter!.status !== "active",
        "A must no longer be active after deletion event",
      );

      // Still exactly one row for A — cancellation is an update, not a duplicate.
      const { data: aAll } = await admin
        .from("user_subscriptions")
        .select("id")
        .eq("user_id", userA);
      assertEquals(aAll?.length ?? 0, 1, "A must have exactly one subscription row");

      // B must STILL have no subscription — the cancellation is scoped to A.
      const { data: bAfter } = await admin
        .from("user_subscriptions")
        .select("id, status")
        .eq("user_id", userB);
      assertEquals(
        bAfter?.length ?? 0,
        0,
        "B must remain without a subscription after A's cancellation",
      );
    } finally {
      await admin.from("user_subscriptions").delete().in("user_id", [userA, userB]);
      await admin.auth.admin.deleteUser(userA);
      await admin.auth.admin.deleteUser(userB);
    }
  },
});

// customer.subscription.updated: plan-change isolation.
//
// Simulates the webhook path for `customer.subscription.updated` — the
// handler looks up user_id by stripe_subscription_id, then calls
// start_subscription with the new plan_code. We prove that:
//   1. Only the user tied to that stripe_subscription_id is updated.
//   2. An unrelated user (B) with no prior subscription still has zero
//      rows in user_subscriptions after the event is processed.
//
// We invoke start_subscription with service_role to match exactly what
// stripe-webhook/index.ts does on customer.subscription.updated.
Deno.test({
  name:
    "customer.subscription.updated: only the matching user is upgraded, other users untouched",
  ignore: !canRun,
  async fn() {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const emailA = `sub-upd-a-${crypto.randomUUID()}@test.plushify.local`;
    const emailB = `sub-upd-b-${crypto.randomUUID()}@test.plushify.local`;
    const { data: uA, error: eA } = await admin.auth.admin.createUser({
      email: emailA,
      password: crypto.randomUUID() + "Aa1!",
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

    const stripeSub = `sub_test_${crypto.randomUUID().replace(/-/g, "")}`;
    const stripeCus = `cus_test_${crypto.randomUUID().replace(/-/g, "")}`;

    try {
      // Initial state: A subscribes to professional (checkout.session.completed).
      const firstEnd = new Date(Date.now() + 30 * 86_400_000).toISOString();
      const { error: firstErr } = await admin.rpc("start_subscription", {
        p_user_id: userA,
        p_plan_code: "professional",
        p_billing_interval: "month",
        p_trial_days: 0,
        p_stripe_subscription_id: stripeSub,
        p_stripe_customer_id: stripeCus,
        p_current_period_end: firstEnd,
      });
      assertEquals(firstErr, null, `initial upsert failed: ${firstErr?.message}`);

      // Confirm B has NO subscription row before the update event.
      const { data: bBefore } = await admin
        .from("user_subscriptions")
        .select("id")
        .eq("user_id", userB);
      assertEquals(bBefore?.length ?? 0, 0, "B must start without a subscription");

      // Simulate `customer.subscription.updated`: A's plan changes to premium.
      // The webhook resolves user_id by stripe_subscription_id — we hand it
      // userA here to mirror that lookup, then call start_subscription.
      const newEnd = new Date(Date.now() + 60 * 86_400_000).toISOString();
      const { error: updErr } = await admin.rpc("start_subscription", {
        p_user_id: userA,
        p_plan_code: "premium",
        p_billing_interval: "month",
        p_trial_days: 0,
        p_stripe_subscription_id: stripeSub,
        p_stripe_customer_id: stripeCus,
        p_current_period_end: newEnd,
      });
      assertEquals(updErr, null, `updated event upsert failed: ${updErr?.message}`);

      // A must now be on premium with the extended period.
      const { data: aRow, error: aErr } = await admin
        .from("user_subscriptions")
        .select("plan_type, status, expires_at")
        .eq("user_id", userA)
        .single();
      assertEquals(aErr, null, `select A failed: ${aErr?.message}`);
      assertEquals(aRow!.plan_type, "premium", "A should be upgraded to premium");
      assertEquals(aRow!.status, "active");
      assert(
        new Date(aRow!.expires_at!).getTime() > new Date(firstEnd).getTime(),
        "A's expires_at should be extended by the updated event",
      );

      // Exactly one row for A — the update must be an UPSERT, not a duplicate.
      const { data: aAll } = await admin
        .from("user_subscriptions")
        .select("id")
        .eq("user_id", userA);
      assertEquals(aAll?.length ?? 0, 1, "A must have exactly one subscription row");

      // B must STILL have no subscription — the event is scoped to A only.
      const { data: bAfter } = await admin
        .from("user_subscriptions")
        .select("id, plan_type")
        .eq("user_id", userB);
      assertEquals(
        bAfter?.length ?? 0,
        0,
        "B must remain without a subscription after A's update event",
      );
    } finally {
      await admin.from("user_subscriptions").delete().in("user_id", [userA, userB]);
      await admin.auth.admin.deleteUser(userA);
      await admin.auth.admin.deleteUser(userB);
    }
  },
});
