// Persistência do código de indicação capturado por ?ref=CODE na URL, até o
// cadastro acontecer (pode ser em outra visita, dias depois). Usa
// localStorage (não sessionStorage) de propósito — sobrevive a fechar a aba.

const STORAGE_KEY = 'plushify:pendingReferral';
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias

const isBrowser = () => typeof window !== 'undefined' && !!window.localStorage;

export function capturePendingReferralFromUrl(): void {
  if (!isBrowser()) return;
  const params = new URLSearchParams(window.location.search);
  const code = params.get('ref');
  if (!code) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ code, createdAt: Date.now() }));
  } catch {
    // storage indisponível — silencioso
  }
}

export function getPendingReferralCode(): string | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { code?: string; createdAt?: number };
    if (!parsed?.code || typeof parsed.createdAt !== 'number' || Date.now() - parsed.createdAt > MAX_AGE_MS) {
      clearPendingReferral();
      return null;
    }
    return parsed.code;
  } catch {
    clearPendingReferral();
    return null;
  }
}

export function clearPendingReferral(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // silencioso
  }
}
