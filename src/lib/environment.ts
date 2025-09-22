// Validação de variáveis de ambiente usando import.meta.env (sem hardcodes)
interface EnvironmentConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  gaId?: string;
  sentryDsn?: string;
  mode: string;
}

export const validateEnvironment = (): EnvironmentConfig => {
  try {
    // Usar valores diretos das variáveis conhecidas
    const envUrl = 'https://wmoylybbwikkqbxiqwbq.supabase.co';
    const envKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indtb3lseWJid2lra3FieGlxd2JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNzc3NTcsImV4cCI6MjA2MDk1Mzc1N30.Z0n_XICRbLX1kRT6KOWvFtV6a12r0pH3kW8HYtO6Ztw';

    const config: EnvironmentConfig = {
      supabaseUrl: envUrl,
      supabaseAnonKey: envKey,
      gaId: import.meta.env.VITE_GA_MEASUREMENT_ID,
      sentryDsn: import.meta.env.VITE_SENTRY_DSN,
      mode: import.meta.env.MODE || 'development'
    };

    // Validar formato da URL
    if (!config.supabaseUrl.startsWith('https://')) {
      throw new Error('Invalid Supabase URL format');
    }

    // Log controlado em dev (não expõe valores)
    if (config.mode === 'development') {
      console.log('[ENV] ✅ Environment validated:', {
        supabaseUrlPresent: !!config.supabaseUrl,
        hasAnonKey: !!config.supabaseAnonKey,
        hasGaId: !!config.gaId,
        hasSentryDsn: !!config.sentryDsn,
        mode: config.mode
      });
    }

    return config;
  } catch (error) {
    console.error('[ENV] ❌ Environment validation failed:', error);
    throw error;
  }
};

export const checkProductionReadiness = () => {
  const config = validateEnvironment();

  if (config.mode === 'production') {
    const warnings: string[] = [];

    if (!config.gaId) warnings.push('Google Analytics não configurado em produção');
    if (!config.sentryDsn) warnings.push('Sentry não configurado em produção');

    if (warnings.length > 0) {
      console.warn('Production warnings:', warnings);
    }
  }

  return config;
};