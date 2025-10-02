// Configuração hardcoded do Supabase (não usar variáveis VITE_*)
const SUPABASE_CONFIG = {
  url: 'https://wmoylybbwikkqbxiqwbq.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indtb3lseWJid2lra3FieGlxd2JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNzc3NTcsImV4cCI6MjA2MDk1Mzc1N30.Z0n_XICRbLX1kRT6KOWvFtV6a12r0pH3kW8HYtO6Ztw'
};

export interface RuntimeEnv {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  MODE: string;
}

// Usar configuração hardcoded
const merged: RuntimeEnv = {
  SUPABASE_URL: SUPABASE_CONFIG.url,
  SUPABASE_ANON_KEY: SUPABASE_CONFIG.anonKey,
  MODE: import.meta.env?.MODE || 'production'
};

console.info('[ENV] Supabase configured:', {
  URL: !!merged.SUPABASE_URL,
  ANON: !!merged.SUPABASE_ANON_KEY,
  MODE: merged.MODE,
});

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
