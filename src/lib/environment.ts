// Validação de variáveis de ambiente usando valores hardcoded
interface EnvironmentConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  gaId?: string;
  sentryDsn?: string;
  mode: string;
}

// Configuração do Supabase - valores fixos do projeto
const SUPABASE_URL = "https://wmoylybbwikkqbxiqwbq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indtb3lseWJid2lra3FieGlxd2JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNzc3NTcsImV4cCI6MjA2MDk1Mzc1N30.Z0n_XICRbLX1kRT6KOWvFtV6a12r0pH3kW8HYtO6Ztw";

// Verificar se todas as variáveis obrigatórias estão presentes
export const validateEnvironment = (): EnvironmentConfig => {
  const config: EnvironmentConfig = {
    supabaseUrl: SUPABASE_URL,
    supabaseAnonKey: SUPABASE_ANON_KEY,
    gaId: import.meta.env.VITE_GA_MEASUREMENT_ID,
    sentryDsn: import.meta.env.VITE_SENTRY_DSN,
    mode: import.meta.env.MODE || 'development'
  };

  // Validar URLs obrigatórias
  if (!config.supabaseUrl) {
    throw new Error('Supabase URL is required');
  }

  if (!config.supabaseAnonKey) {
    throw new Error('Supabase Anon Key is required');
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