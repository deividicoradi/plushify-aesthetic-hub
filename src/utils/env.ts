// Robust runtime environment util with safe fallbacks
// Reads from import.meta.env when available (ESM modules),
// falls back to globalThis.__ENV__ injected at bootstrap.

export type RuntimeEnv = {
  SUPABASE_URL: string | undefined;
  SUPABASE_ANON_KEY: string | undefined;
  SUPABASE_PUBLISHABLE_KEY: string | undefined;
  MODE: string | undefined;
};

function readFromVite(): Partial<RuntimeEnv> {
  try {
    const viteEnv = (import.meta as any)?.env || {};
    return {
      SUPABASE_URL: viteEnv.VITE_SUPABASE_URL,
      SUPABASE_ANON_KEY: viteEnv.VITE_SUPABASE_ANON_KEY,
      SUPABASE_PUBLISHABLE_KEY: viteEnv.VITE_SUPABASE_PUBLISHABLE_KEY,
      MODE: viteEnv.MODE,
    };
  } catch {
    // Not in an ESM module context or import.meta.env unavailable
    return {};
  }
}

function readFromGlobal(): Partial<RuntimeEnv> {
  try {
    const g: any = typeof globalThis !== 'undefined' ? (globalThis as any) : undefined;
    const e = g?.__ENV__ || {};
    return {
      SUPABASE_URL: e.url,
      SUPABASE_ANON_KEY: e.anon,
      SUPABASE_PUBLISHABLE_KEY: e.pub,
      MODE: e.mode,
    };
  } catch {
    return {};
  }
}

const fromVite = readFromVite();
const fromGlobal = readFromGlobal();

const merged: RuntimeEnv = {
  SUPABASE_URL: fromVite.SUPABASE_URL ?? fromGlobal.SUPABASE_URL,
  SUPABASE_ANON_KEY: fromVite.SUPABASE_ANON_KEY ?? fromGlobal.SUPABASE_ANON_KEY,
  SUPABASE_PUBLISHABLE_KEY: fromVite.SUPABASE_PUBLISHABLE_KEY ?? fromGlobal.SUPABASE_PUBLISHABLE_KEY,
  MODE: fromVite.MODE ?? fromGlobal.MODE ?? 'development',
};

const okUrl = !!merged.SUPABASE_URL;
const okAnon = !!merged.SUPABASE_ANON_KEY;
const okPub = !!merged.SUPABASE_PUBLISHABLE_KEY;

// Don't throw errors during module loading, let main.tsx handle validation
if (!okUrl || !(okAnon || okPub)) {
  // Log only booleans, never the values
  console.error('[ENV] Missing Vite envs at runtime', {
    URL: okUrl,
    ANON: okAnon,
    PUB: okPub,
    MODE: merged.MODE,
  });
  console.warn('[ENV] Configure VITE_SUPABASE_URL and either VITE_SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_KEY in Lovable Settings > Environment Variables.');
}

export const env = merged;

export function validateEnv(): void {
  if (!okUrl || !(okAnon || okPub)) {
    throw new Error('Missing Vite envs at runtime');
  }
}

export function getSupabaseKey(): string {
  const key = env.SUPABASE_PUBLISHABLE_KEY ?? env.SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error('Missing Supabase key - configure VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY');
  }
  return key;
}

export function getSupabaseKeyType(): 'publishable' | 'anon' {
  return env.SUPABASE_PUBLISHABLE_KEY ? 'publishable' : 'anon';
}
