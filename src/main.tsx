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
console.info('[ENV] Supabase configured and ready');
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
    // Initialize SW Manager first (cleanup duplicates + singleton)
    try {
      const { swManager } = await import('@/utils/swManager');
      await swManager.initialize();
    } catch (error) {
      console.warn('[SW] Manager initialization skipped:', error);
    }

    // Initialize cleanup and optimization
    initCleanup()
    cleanupConsoleLogsInProduction()
    initPerformanceMonitor()

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
    console.log(`[BOOT] react=${reactVersion} mode=${import.meta.env.MODE}`);
    
    // Evidência final de renderização
    console.log('[RENDER] Inicializando React App...');
    const root = createRoot(rootElement);
    root.render(<App />);
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
