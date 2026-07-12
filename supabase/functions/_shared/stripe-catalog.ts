// Single source of truth for the Stripe plan catalog used by
// create-checkout, stripe-webhook and customer-portal edge functions.
//
// Price IDs are ALWAYS read from environment variables — never hardcoded.
// This keeps the same code shipping to dev, staging and production; each
// environment simply configures its own Stripe Price IDs as secrets.
//
// Required (production) secrets:
//   STRIPE_PRICE_PROFESSIONAL_MONTHLY
//   STRIPE_PRICE_PROFESSIONAL_ANNUAL
//   STRIPE_PRICE_PREMIUM_MONTHLY
//   STRIPE_PRICE_PREMIUM_ANNUAL
//
// Production behavior: all four Price IDs above MUST be set. If any is
// missing, `create-checkout` refuses to create a Stripe Checkout Session
// and the customer is never charged with an unmapped price.
//
// Development/preview behavior (test-mode Stripe key, `sk_test_...`):
// missing Price IDs fall back to inline `price_data` so contributors can
// try the flow without wiring live prices. In this mode the webhook
// resolves the plan via server-set `subscription.metadata` (plan_type +
// billing_period), which is written by `create-checkout` itself — never
// by the client. Price ID always wins when present.

export type PlanCode = "professional" | "premium";
export type BillingPeriod = "monthly" | "annual";
export type BillingInterval = "month" | "year";

export interface PlanPriceConfig {
  amount: number;      // in cents (BRL)
  currency: "brl";
  interval: BillingInterval;
  name: string;
  description: string;
}

export const PLAN_CATALOG: Record<PlanCode, Record<BillingPeriod, PlanPriceConfig>> = {
  professional: {
    monthly: {
      amount: 8900,
      currency: "brl",
      interval: "month",
      name: "Profissional Mensal",
      description: "Plano Profissional - Mensal",
    },
    annual: {
      amount: 89000,
      currency: "brl",
      interval: "year",
      name: "Profissional Anual",
      description: "Plano Profissional - Anual",
    },
  },
  premium: {
    monthly: {
      amount: 17900,
      currency: "brl",
      interval: "month",
      name: "Premium Mensal",
      description: "Plano Premium - Mensal",
    },
    annual: {
      amount: 179000,
      currency: "brl",
      interval: "year",
      name: "Premium Anual",
      description: "Plano Premium - Anual",
    },
  },
};

export const VALID_PLANS: PlanCode[] = ["professional", "premium"];
export const VALID_BILLING_PERIODS: BillingPeriod[] = ["monthly", "annual"];

const ENV_KEY_BY_PLAN: Record<PlanCode, Record<BillingPeriod, string>> = {
  professional: {
    monthly: "STRIPE_PRICE_PROFESSIONAL_MONTHLY",
    annual: "STRIPE_PRICE_PROFESSIONAL_ANNUAL",
  },
  premium: {
    monthly: "STRIPE_PRICE_PREMIUM_MONTHLY",
    annual: "STRIPE_PRICE_PREMIUM_ANNUAL",
  },
};

/** Returns the configured Stripe Price ID for a plan/period, or null if unset. */
export function getPriceId(plan: PlanCode, period: BillingPeriod): string | null {
  const envKey = ENV_KEY_BY_PLAN[plan][period];
  const value = Deno.env.get(envKey)?.trim();
  if (!value) return null;
  // A Stripe Price ID always starts with `price_`. Reject obvious placeholders.
  if (!value.startsWith("price_")) return null;
  return value;
}

/** Reverse-lookup: given a Stripe price_id (received in a webhook), find plan+interval. */
export function mapPriceIdToPlan(
  priceId: string,
): { plan_code: PlanCode; billing_interval: BillingInterval } | null {
  for (const plan of VALID_PLANS) {
    for (const period of VALID_BILLING_PERIODS) {
      if (getPriceId(plan, period) === priceId) {
        return {
          plan_code: plan,
          billing_interval: PLAN_CATALOG[plan][period].interval,
        };
      }
    }
  }
  return null;
}

export function isValidPlan(value: unknown): value is PlanCode {
  return typeof value === "string" && (VALID_PLANS as string[]).includes(value);
}

export function isValidBillingPeriod(value: unknown): value is BillingPeriod {
  return typeof value === "string" && (VALID_BILLING_PERIODS as string[]).includes(value);
}

/**
 * Production mode is inferred from the Stripe secret key prefix.
 * `sk_live_...` → live/production; anything else (including `sk_test_...`)
 * is treated as development/preview. This avoids relying on an extra flag
 * that could drift from the actual Stripe environment in use.
 */
export function isProductionStripe(): boolean {
  const key = Deno.env.get("STRIPE_SECRET_KEY")?.trim() ?? "";
  return key.startsWith("sk_live_");
}

/** Returns the list of plan/period combinations that are missing a Price ID. */
export function getMissingPriceIds(): Array<{ plan: PlanCode; period: BillingPeriod; envKey: string }> {
  const missing: Array<{ plan: PlanCode; period: BillingPeriod; envKey: string }> = [];
  for (const plan of VALID_PLANS) {
    for (const period of VALID_BILLING_PERIODS) {
      if (!getPriceId(plan, period)) {
        missing.push({ plan, period, envKey: `STRIPE_PRICE_${plan.toUpperCase()}_${period.toUpperCase()}` });
      }
    }
  }
  return missing;
}

/**
 * In production, asserts all four Price IDs are configured. Throws with a
 * clear error listing the missing env keys so the checkout aborts BEFORE
 * any Stripe Session is created.
 */
export function assertCatalogReadyForCheckout(plan: PlanCode, period: BillingPeriod): void {
  if (!isProductionStripe()) return;
  const missing = getMissingPriceIds();
  if (missing.length === 0) return;
  const keys = missing.map((m) => m.envKey).join(", ");
  throw new Error(
    `STRIPE_CATALOG_INCOMPLETE: production requires all Stripe Price IDs to be configured. Missing: ${keys}`,
  );
}

/**
 * Server-set metadata written on the Stripe Subscription by create-checkout.
 * Used as a fallback plan resolver in dev/preview when `price_data` was
 * used and no Price ID exists to reverse-map. Values are validated against
 * the catalog before being trusted.
 */
export function resolvePlanFromMetadata(
  metadata: Record<string, string> | null | undefined,
): { plan_code: PlanCode; billing_interval: BillingInterval } | null {
  if (!metadata) return null;
  const plan = metadata.plan_type;
  const period = metadata.billing_period;
  if (!isValidPlan(plan) || !isValidBillingPeriod(period)) return null;
  return { plan_code: plan, billing_interval: PLAN_CATALOG[plan][period].interval };
}

/** Resolved application URL used for Stripe success/cancel/return redirects. */
export function getAppUrl(fallbackOrigin?: string | null): string {
  const appUrl = Deno.env.get("APP_URL")?.trim();
  if (appUrl && /^https?:\/\//.test(appUrl)) return appUrl.replace(/\/$/, "");
  if (fallbackOrigin && /^https?:\/\//.test(fallbackOrigin)) return fallbackOrigin.replace(/\/$/, "");
  return "http://localhost:3000";
}