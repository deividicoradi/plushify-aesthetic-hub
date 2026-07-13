// Persistência temporária do plano escolhido antes da autenticação.
// Usa sessionStorage para sobreviver a refresh, mas ser descartado ao fechar aba.

export type PendingPlanType = 'trial' | 'professional' | 'premium';
export type PendingBillingPeriod = 'monthly' | 'annual';

export interface PendingCheckout {
  planType: PendingPlanType;
  billingPeriod: PendingBillingPeriod;
  createdAt: number;
}

const STORAGE_KEY = 'plushify:pendingCheckout';
// Expira em 30 min para evitar retomadas antigas
const MAX_AGE_MS = 30 * 60 * 1000;

const isBrowser = () => typeof window !== 'undefined' && !!window.sessionStorage;

export function setPendingCheckout(
  planType: PendingPlanType,
  billingPeriod: PendingBillingPeriod,
): void {
  if (!isBrowser()) return;
  const payload: PendingCheckout = {
    planType,
    billingPeriod,
    createdAt: Date.now(),
  };
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // storage indisponível — silencioso
  }
}

export function getPendingCheckout(): PendingCheckout | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingCheckout;
    if (
      !parsed ||
      typeof parsed.createdAt !== 'number' ||
      Date.now() - parsed.createdAt > MAX_AGE_MS
    ) {
      clearPendingCheckout();
      return null;
    }
    const validPlans: PendingPlanType[] = ['trial', 'professional', 'premium'];
    const validPeriods: PendingBillingPeriod[] = ['monthly', 'annual'];
    if (
      !validPlans.includes(parsed.planType) ||
      !validPeriods.includes(parsed.billingPeriod)
    ) {
      clearPendingCheckout();
      return null;
    }
    return parsed;
  } catch {
    clearPendingCheckout();
    return null;
  }
}

export function clearPendingCheckout(): void {
  if (!isBrowser()) return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // silencioso
  }
}