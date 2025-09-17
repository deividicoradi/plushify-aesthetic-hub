// Validação de variáveis de ambiente usando import.meta.env (sem hardcodes)
interface EnvironmentConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  gaId?: string;
  sentryDsn?: string;
  mode: string;
}

export const validateEnvironment = (): EnvironmentConfig => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const envKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined;

  const config: EnvironmentConfig = {
    supabaseUrl: envUrl || '',
    supabaseAnonKey: envKey || '',
    gaId: import.meta.env.VITE_GA_MEASUREMENT_ID,
    sentryDsn: import.meta.env.VITE_SENTRY_DSN,
    mode: import.meta.env.MODE || 'development'
  };

  // Validar obrigatórios
  if (!config.supabaseUrl) {
    throw new Error('Supabase URL is required');
  }
  if (!config.supabaseAnonKey) {
    throw new Error('Supabase Anon Key is required');
  }

  // Validar formato da URL
  try {
    new URL(config.supabaseUrl);
  } catch {
    throw new Error('VITE_SUPABASE_URL must be a valid URL');
  }

  // Log controlado em dev (não expõe valores)
  if (config.mode === 'development') {
    console.log('Environment validated:', {
      supabaseUrlPresent: !!config.supabaseUrl,
      hasAnonKey: !!config.supabaseAnonKey,
      hasGaId: !!config.gaId,
      hasSentryDsn: !!config.sentryDsn,
      mode: config.mode
    });
  }

  return config;
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