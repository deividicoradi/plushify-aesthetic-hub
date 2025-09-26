// Environment Variables Normalizer - Replace all environment validators
interface ValidatedEnvironment {
  supabaseUrl: string;
  supabaseAnonKey: string;
  mode: string;
  gaId?: string;
  sentryDsn?: string;
}

// Centralized environment validation with strict checks
export const validateAndNormalizeEnvironment = (): ValidatedEnvironment => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  
  if (!supabaseUrl) {
    throw new Error('CRITICAL: VITE_SUPABASE_URL is required');
  }
  
  if (!supabaseKey) {
    throw new Error('CRITICAL: VITE_SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_KEY is required');
  }
  
  // Validate URL format
  try {
    new URL(supabaseUrl);
  } catch {
    throw new Error(`CRITICAL: Invalid VITE_SUPABASE_URL format: ${supabaseUrl}`);
  }
  
  const config: ValidatedEnvironment = {
    supabaseUrl,
    supabaseAnonKey: supabaseKey,
    mode: import.meta.env.MODE || 'development',
    gaId: import.meta.env.VITE_GA_MEASUREMENT_ID,
    sentryDsn: import.meta.env.VITE_SENTRY_DSN,
  };
  
  // Production readiness check
  if (config.mode === 'production') {
    const warnings: string[] = [];
    if (!config.gaId) warnings.push('Google Analytics não configurado');
    if (!config.sentryDsn) warnings.push('Sentry não configurado');
    
    if (warnings.length > 0) {
      console.warn('[ENV] Production warnings:', warnings);
    }
  }
  
  console.log('[ENV] VITE_SUPABASE_URL/ANON_KEY OK');
  return config;
};

// Replace all existing environment validators
export { validateAndNormalizeEnvironment as validateEnvironment };
export { validateAndNormalizeEnvironment as checkProductionReadiness };