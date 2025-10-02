// Environment Variables Normalizer - Replace all environment validators
interface ValidatedEnvironment {
  supabaseUrl: string;
  supabaseAnonKey: string;
  mode: string;
  gaId?: string;
  sentryDsn?: string;
}

// Usar configuração do env.ts
import { env } from './env';

export const validateAndNormalizeEnvironment = (): ValidatedEnvironment => {
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('CRITICAL: Supabase configuration missing');
  }
  
  const config: ValidatedEnvironment = {
    supabaseUrl,
    supabaseAnonKey: supabaseKey,
    mode: env.MODE || 'development',
  };
  
  console.log('[ENV] Supabase OK');
  return config;
};

// Replace all existing environment validators
export { validateAndNormalizeEnvironment as validateEnvironment };
export { validateAndNormalizeEnvironment as checkProductionReadiness };