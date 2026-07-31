// Robust runtime environment util that does NOT rely on VITE_* variables
// Uses the known Supabase project configuration directly (publishable anon key)

export interface RuntimeEnv {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  MODE: string;
}

// Resolve the URL at build time. The publishable key is pinned to the current
// Lovable Cloud project so a stale legacy JWT injected by the build cannot win.
const FALLBACK_URL = 'https://iqpldxwwvnlloefqfhoo.supabase.co';
// Publishable (safe for the browser) key — legacy JWT anon keys are disabled.
const FALLBACK_ANON = 'sb_publishable_T1J2bo7KItjVZ-5_iea4uQ_ZdvG_43P';

const viteEnv = (typeof import.meta !== 'undefined' ? (import.meta as any)?.env : undefined) ?? {};
const SUPABASE_CONFIG = {
  url: viteEnv.VITE_SUPABASE_URL || FALLBACK_URL,
  anonKey: FALLBACK_ANON,
};

const merged: RuntimeEnv = {
  SUPABASE_URL: SUPABASE_CONFIG.url,
  SUPABASE_ANON_KEY: SUPABASE_CONFIG.anonKey,
  MODE: (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.MODE) || 'production',
};

// Safe diagnostics (never print secrets) — dev apenas
if (import.meta.env.DEV) {
  console.info('[ENV] Supabase configured:', {
    URL: !!merged.SUPABASE_URL,
    ANON: !!merged.SUPABASE_ANON_KEY,
    MODE: merged.MODE,
  });
}

export const env = merged;

export function validateEnv(): void {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    throw new Error('Supabase configuration missing');
  }
}

export function getSupabaseKey(): string {
  return env.SUPABASE_ANON_KEY;
}

export function getSupabaseKeyType(): 'anon' {
  return 'anon';
}
