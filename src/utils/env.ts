// Robust runtime environment util that does NOT rely on VITE_* variables
// Uses the known Supabase project configuration directly (publishable anon key)

export interface RuntimeEnv {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  MODE: string;
}

// Resolve from VITE_* at build time, with a safe fallback to the current
// Lovable Cloud project so the app keeps booting even if env injection fails.
const FALLBACK_URL = 'https://iqpldxwwvnlloefqfhoo.supabase.co';
const FALLBACK_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxcGxkeHd3dm5sbG9lZnFmaG9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MzE0NjcsImV4cCI6MjA5NjUwNzQ2N30.CC7iWCl_8tp0K_2lZxRvDTLjhYvn85Tn2WYLzOFS3qs';

const viteEnv = (typeof import.meta !== 'undefined' ? (import.meta as any)?.env : undefined) ?? {};
const SUPABASE_CONFIG = {
  url: viteEnv.VITE_SUPABASE_URL || FALLBACK_URL,
  anonKey: viteEnv.VITE_SUPABASE_PUBLISHABLE_KEY || viteEnv.VITE_SUPABASE_ANON_KEY || FALLBACK_ANON,
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
