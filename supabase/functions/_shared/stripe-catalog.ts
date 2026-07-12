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
// When a Price ID is missing the checkout falls back to Stripe's
// `price_data` (dynamic price) using the amounts below, so nothing breaks
// in dev before real IDs are wired up. In production all four MUST be set
// so the webhook can map the incoming price_id back to the plan code.

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

/** Resolved application URL used for Stripe success/cancel/return redirects. */
export function getAppUrl(fallbackOrigin?: string | null): string {
  const appUrl = Deno.env.get("APP_URL")?.trim();
  if (appUrl && /^https?:\/\//.test(appUrl)) return appUrl.replace(/\/$/, "");
  if (fallbackOrigin && /^https?:\/\//.test(fallbackOrigin)) return fallbackOrigin.replace(/\/$/, "");
  return "http://localhost:3000";
}