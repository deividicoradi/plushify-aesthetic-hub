// Validador robusto de variáveis de ambiente
// Corrige erro "Supabase URL is required"

interface EnvironmentConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  gaId?: string;
  sentryDsn?: string;
  mode: string;
  appVersion?: string;
}

// Cache das variáveis validadas
let cachedConfig: EnvironmentConfig | null = null;
let validationAttempts = 0;

export const validateEnvironmentRobust = (): EnvironmentConfig => {
  // Retornar cache se já validado
  if (cachedConfig && validationAttempts < 3) {
    return cachedConfig;
  }
  
  validationAttempts++;
  
  try {
    // Múltiplas tentativas de obter as variáveis
    const envUrl = getEnvVariable('VITE_SUPABASE_URL');
    const envKey = getEnvVariable('VITE_SUPABASE_PUBLISHABLE_KEY') || 
                   getEnvVariable('VITE_SUPABASE_ANON_KEY');
    
    if (!envUrl) {
      throw new Error('CRITICAL: VITE_SUPABASE_URL não encontrada nas variáveis de ambiente');
    }
    
    if (!envKey) {
      throw new Error('CRITICAL: VITE_SUPABASE_PUBLISHABLE_KEY ou VITE_SUPABASE_ANON_KEY não encontrada');
    }
    
    const config: EnvironmentConfig = {
      supabaseUrl: envUrl,
      supabaseAnonKey: envKey,
      gaId: getEnvVariable('VITE_GA_MEASUREMENT_ID'),
      sentryDsn: getEnvVariable('VITE_SENTRY_DSN'),
      mode: getEnvVariable('MODE') || 'development',
      appVersion: getEnvVariable('VITE_APP_VERSION') || '1.0.0'
    };
    
    // Validar formato da URL
    try {
      new URL(config.supabaseUrl);
    } catch {
      throw new Error(`CRITICAL: VITE_SUPABASE_URL inválida: ${config.supabaseUrl}`);
    }
    
    // Validar chave não está vazia
    if (config.supabaseAnonKey.length < 10) {
      throw new Error('CRITICAL: Supabase Anon Key muito curta ou inválida');
    }
    
    cachedConfig = config;
    
    // Log controlado apenas em desenvolvimento
    if (config.mode === 'development') {
      console.log('[ENV] ✅ Variáveis de ambiente validadas:', {
        supabaseUrlPresent: !!config.supabaseUrl,
        supabaseUrlValid: config.supabaseUrl.startsWith('https://'),
        hasAnonKey: !!config.supabaseAnonKey,
        anonKeyLength: config.supabaseAnonKey.length,
        hasGaId: !!config.gaId,
        hasSentryDsn: !!config.sentryDsn,
        mode: config.mode,
        version: config.appVersion
      });
    }
    
    return config;
    
  } catch (error) {
    console.error('[ENV] ❌ Falha na validação das variáveis de ambiente:', error);
    
    // Fallback para desenvolvimento
    if (getEnvVariable('MODE') === 'development') {
      console.warn('[ENV] ⚠️  Usando configuração de fallback para desenvolvimento');
      const fallbackConfig: EnvironmentConfig = {
        supabaseUrl: 'https://wmoylybbwikkqbxiqwbq.supabase.co',
        supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indtb3lseWJid2lra3FieGlxd2JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNzc3NTcsImV4cCI6MjA2MDk1Mzc1N30.Z0n_XICRbLX1kRT6KOWvFtV6a12r0pH3kW8HYtO6Ztw',
        mode: 'development',
        appVersion: '1.0.0'
      };
      cachedConfig = fallbackConfig;
      return fallbackConfig;
    }
    
    throw error;
  }
};

// Helper para obter variável de ambiente com fallbacks
const getEnvVariable = (key: string): string | undefined => {
  if (typeof import.meta === 'undefined') return undefined;
  
  try {
    return import.meta.env?.[key] as string | undefined;
  } catch (error) {
    console.warn(`[ENV] Erro ao acessar ${key}:`, error);
    return undefined;
  }
};

// Verificação de produção
export const checkProductionReadiness = (): EnvironmentConfig => {
  const config = validateEnvironmentRobust();
  
  if (config.mode === 'production') {
    const warnings: string[] = [];
    
    if (!config.gaId) warnings.push('Google Analytics não configurado');
    if (!config.sentryDsn) warnings.push('Sentry não configurado');
    
    if (warnings.length > 0) {
      console.warn('[ENV] ⚠️  Avisos de produção:', warnings);
    } else {
      console.log('[ENV] ✅ Configuração de produção completa');
    }
  }
  
  return config;
};

// Validação inicial
export const initEnvironmentValidation = () => {
  try {
    const config = validateEnvironmentRobust();
    console.log(`[ENV] ✅ Ambiente ${config.mode} configurado corretamente`);
    return true;
  } catch (error) {
    console.error('[ENV] ❌ Falha crítica na inicialização:', error);
    return false;
  }
};