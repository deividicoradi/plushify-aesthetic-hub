// Validação de variáveis de ambiente
interface EnvironmentConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  gaId?: string;
  sentryDsn?: string;
  mode: string;
}

// Verificar se todas as variáveis obrigatórias estão presentes
export const validateEnvironment = (): EnvironmentConfig => {
  const config: EnvironmentConfig = {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
    gaId: import.meta.env.VITE_GA_MEASUREMENT_ID,
    sentryDsn: import.meta.env.VITE_SENTRY_DSN,
    mode: import.meta.env.MODE || 'development'
  };

  // Validar URLs obrigatórias
  if (!config.supabaseUrl) {
    throw new Error('VITE_SUPABASE_URL is required');
  }

  if (!config.supabaseAnonKey) {
    throw new Error('VITE_SUPABASE_PUBLISHABLE_KEY is required');
  }

  // Validar formato das URLs
  try {
    new URL(config.supabaseUrl);
  } catch {
    throw new Error('VITE_SUPABASE_URL must be a valid URL');
  }

  // Log de configuração em desenvolvimento
  if (config.mode === 'development') {
    console.log('Environment validated:', {
      supabaseUrl: config.supabaseUrl,
      hasAnonKey: !!config.supabaseAnonKey,
      hasGaId: !!config.gaId,
      hasSentryDsn: !!config.sentryDsn,
      mode: config.mode
    });
  }

  return config;
};

// Verificar se estamos em produção e variáveis críticas estão configuradas
export const checkProductionReadiness = () => {
  const config = validateEnvironment();
  
  if (config.mode === 'production') {
    const warnings: string[] = [];
    
    if (!config.gaId) {
      warnings.push('Google Analytics não configurado em produção');
    }
    
    if (!config.sentryDsn) {
      warnings.push('Sentry não configurado em produção');
    }
    
    if (warnings.length > 0) {
      console.warn('Production warnings:', warnings);
    }
  }
  
  return config;
};