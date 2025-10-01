import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { initSentry } from './lib/sentry'
import { initGA } from './lib/analytics'
import { initCleanup } from './lib/cleanup'
import { cleanupConsoleLogsInProduction } from './utils/console-cleanup'
import { validateEnvironment, checkProductionReadiness } from './utils/environmentNormalizer'
import { initPerformanceMonitor } from './utils/performanceOptimizer'
import { logger } from './utils/debugLogger'
import './utils/codeAudit' // Auto-executa auditoria em desenvolvimento
import './utils/attributeValidator' // Validador de atributos DOM
import './utils/importGuard' // Guard para importações circulares
import './utils/variableConflictDetector' // Detector de conflitos de variáveis
import './utils/errorDiagnostics' // Diagnóstico detalhado de erros em runtime
import { initServiceWorkerCleanup, forceServiceWorkerUpdate } from './utils/serviceWorkerCleanup'
import { runAppDiagnostics, checkForCommonIssues } from './utils/appDiagnostics'

// Suprimir erros de WebSocket do ambiente de desenvolvimento Lovable
if (import.meta.env.MODE === 'development') {
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = (...args: any[]) => {
    const errorString = String(args[0] || '');
    
    // Filtrar erros específicos do ambiente Lovable (não afetam a aplicação)
    const shouldSuppress = 
      (errorString.includes('WebSocket connection to') && errorString.includes('lovableproject.com')) ||
      (errorString.includes('WebSocket') && errorString.includes('failed')) && 
      args.some(arg => String(arg).includes('lovableproject.com'));
    
    if (shouldSuppress) {
      return; // Suprimir erros do ambiente de dev Lovable
    }
    
    originalError.apply(console, args);
  };
  
  console.warn = (...args: any[]) => {
    const warnString = String(args[0] || '');
    
    // Filtrar warnings do sandbox iframe
    if (warnString.includes('sandbox') || warnString.includes('iframe')) {
      return;
    }
    
    originalWarn.apply(console, args);
  };
}

// ==== RUNTIME ENV DIAGNOSTICS (safe) ====
try {
  const has = {
    URL:  !!import.meta.env.VITE_SUPABASE_URL,
    ANON: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    PUB:  !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    MODE: import.meta.env.MODE,
  };
  console.info('[ENV@runtime]', has);
  console.table({ URL: has.URL, ANON: has.ANON, PUB: has.PUB, MODE: has.MODE });

  if (import.meta.env.MODE !== 'production') {
    (globalThis as any).__ENV__ = {
      url:  import.meta.env.VITE_SUPABASE_URL,
      anon: import.meta.env.VITE_SUPABASE_ANON_KEY,
      pub:  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      mode: import.meta.env.MODE,
    };
    console.info('[ENV@runtime] __ENV__ disponível (dev only)');
  }

  console.info(
    `[ENV@summary] URL=${has.URL ? 'ok' : 'missing'} ANON=${has.ANON ? 'ok' : 'missing'} PUB=${has.PUB ? 'ok' : 'missing'} MODE=${has.MODE}`
  );
} catch (e) {
  console.warn('[ENV@runtime] import.meta.env indisponível ou fora de módulo', e);
}
// =========================================

// Ensure root element exists
const rootElement = document.getElementById("root")
if (!rootElement) {
  throw new Error("Root element not found")
}

// Global fatal error fallback to avoid white screen
function showFatalError(message: string) {
  if (!rootElement) return
  rootElement.innerHTML = `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif; padding: 24px; max-width: 720px; margin: 40px auto;">
      <h1 style="font-size: 20px; line-height: 1.4; margin: 0 0 12px;">Ocorreu um erro ao iniciar o aplicativo</h1>
      <p style="color: #666; margin: 0 0 16px;">${message}</p>
      <button style="padding: 10px 14px; border: 1px solid #ccc; border-radius: 8px; cursor: pointer;" onclick="location.reload()">Recarregar</button>
    </div>
  `
}

// Capture uncaught errors to render a friendly message instead of a blank screen
window.addEventListener('error', (e) => {
  showFatalError(e.message || 'Erro inesperado.')
})
window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
  const reason = (e.reason && (e.reason.message || e.reason.toString())) || 'Erro inesperado.'
  showFatalError(reason)
})

// Initialize app with proper error handling
async function initializeApp() {
  try {
    // Initialize cleanup and optimization first
    initCleanup()
    cleanupConsoleLogsInProduction()
    initPerformanceMonitor()
    initServiceWorkerCleanup()
    forceServiceWorkerUpdate()

    // Initialize services with error handling
    try {
      initSentry()
    } catch (error) {
      if (import.meta.env.MODE === 'development') {
        console.warn('Sentry initialization failed:', error)
      }
    }

    try {
      initGA()
    } catch (error) {
      if (import.meta.env.MODE === 'development') {
        console.warn('Analytics initialization failed:', error)
      }
    }

    // Validate environment - but don't block app loading
    try {
      validateEnvironment()
      checkProductionReadiness()
      console.log('[BOOT] ✅ Configuração validada com sucesso')
    } catch (error) {
      console.warn('[BOOT] ⚠️ Problemas na configuração:', error)
      // Don't throw - let app try to load anyway
    }

    // Log versões React para detectar duplicatas
    logger.info('Starting React application');
    logger.checkReactVersions();
    logger.checkEnvironment();

    // Boot diagnostics
    const reactVersion = (React as any).version || 'unknown';
    console.log(`[BOOT] react=${reactVersion} singleProvider=OK authLoaded=pending`);
    
    // Run diagnostics
    runAppDiagnostics();
    checkForCommonIssues();
    
    // Evidência final de renderização
    console.log('[RENDER] Inicializando React App...');
    createRoot(rootElement).render(<App />)
    console.log('[RENDER] React App renderizado com sucesso');

    // Setup keep-alive ping after app loads
    setTimeout(async () => {
      try {
        const { pingKeepAlive } = await import('./lib/keepAlive');
        const doPing = async () => {
          const res = await pingKeepAlive();
          if (res?.headersEcho) {
            console.log('[KEEPALIVE:HEADERS]', res.headersEcho);
          }
        };
        // Initial ping and then every 4 minutes
        doPing();
        const interval = setInterval(doPing, 4 * 60 * 1000);
        // Keep-alive when tab becomes visible
        document.addEventListener('visibilitychange', () => {
          if (!document.hidden) doPing();
        });
        // Clean up on hot reloads
        if (import.meta && (import.meta as any).hot) {
          (import.meta as any).hot.on('vite:beforeFullReload', () => clearInterval(interval));
        }
      } catch (e) {
        console.warn('KeepAlive setup failed', e);
      }
    }, 1000);

  } catch (err: any) {
    console.error('Falha ao renderizar App:', err)
    showFatalError(err?.message || 'Falha ao inicializar o aplicativo.')
  }
}

// Start the app
initializeApp();
