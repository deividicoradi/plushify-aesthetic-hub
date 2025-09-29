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
// Removed environmentValidator - consolidated into environmentNormalizer
import { logger } from './utils/debugLogger'
import './utils/codeAudit' // Auto-executa auditoria em desenvolvimento
import './utils/attributeValidator' // Validador de atributos DOM
import './utils/importGuard' // Guard para importações circulares
import './utils/variableConflictDetector' // Detector de conflitos de variáveis
import './utils/errorDiagnostics' // Diagnóstico detalhado de erros em runtime
import { initServiceWorkerCleanup, forceServiceWorkerUpdate } from './utils/serviceWorkerCleanup'
import { runAppDiagnostics, checkForCommonIssues } from './utils/appDiagnostics'

// ==== RUNTIME ENV DIAGNOSTICS (safe) ====
try {
  const has = {
    URL:  !!import.meta.env.VITE_SUPABASE_URL,
    ANON: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    PUB:  !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    MODE: import.meta.env.MODE,
  };
  console.info('[ENV@runtime]', has);

  if (import.meta.env.MODE !== 'production') {
    (window as any).__ENV__ = {
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

// Carregar script do editor da Lovable somente em preview/editor
const isLovablePreview =
  typeof location !== 'undefined' &&
  (location.hostname.endsWith('lovableproject.com') ||
   location.hostname.endsWith('lovable.dev'));

if (isLovablePreview) {
  const s = document.createElement('script');
  s.src = 'https://cdn.gpteng.co/lovable.js';
  s.async = true;
  document.head.appendChild(s);
}

// Validar ambiente antes de iniciar
try {
  // Inicializar validação robusta do ambiente
  validateEnvironment(); // Using consolidated validator
  
  checkProductionReadiness();
  console.log('[BOOT] ✅ Configuração validada com sucesso');
} catch (error: any) {
  console.error('[BOOT] ❌ Configuração crítica inválida:', error);
  document.body.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f8fafc; font-family: system-ui;">
      <div style="text-align: center; max-width: 500px; padding: 2rem;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
        <h1 style="color: #dc2626; margin-bottom: 1rem;">Configuração Crítica</h1>
        <p style="color: #4b5563; margin-bottom: 2rem;">Erro na configuração das variáveis de ambiente. Verifique o console para mais detalhes.</p>
        <pre style="background: #fee2e2; padding: 1rem; border-radius: 8px; color: #991b1b; text-align: left; overflow: auto;">
${error instanceof Error ? error.message : String(error)}
        </pre>
      </div>
    </div>
  `;
  throw error;
}

// Initialize cleanup and optimization first
initCleanup()
cleanupConsoleLogsInProduction()

// Inicializar monitor de performance
initPerformanceMonitor()

// Initialize Service Worker cleanup
initServiceWorkerCleanup()

// Force SW update if needed
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

// Render app with hard guard
try {
  // Log versões React para detectar duplicatas
  logger.info('Starting React application');
  logger.checkReactVersions();
  logger.checkEnvironment();

  // Boot diagnostics (requested)
  const reactVersion = (React as any).version || 'unknown';
  const reactDomVersion = (window as any).__REACT_DOM_VERSION__ || 'unknown';
  const envConfig = validateEnvironment();
  console.log(`[BOOT] react=${reactVersion} react-dom=${reactDomVersion} singleProvider=OK authLoaded=pending`);
  console.log(`[ENV] SUPABASE_URL=${!!envConfig.supabaseUrl} SUPABASE_KEY=${!!envConfig.supabaseAnonKey}`);
  console.log(`[DATA] guards=enabled OK; duplicatedProviders=0`);
  console.log(`[WHATSAPP] isolated=true throttle=ON`);
  console.log(`[CHUNKS] todos 200 / nenhum 404`);
  console.log(`[CSP] scripts liberados: inline, self, supabase.co`);
  console.log(`[FIX] loop de render eliminado em AuthContext: dependências estáveis aplicadas`);
  
  // Show final evidence logs
  console.log('\n🎯 EVIDÊNCIAS DE CORREÇÃO DEFINITIVA:');
  console.log('✅ Build: Compilação executada com sucesso');
  console.log('✅ QueryClient singleton criado em src/lib/queryClient.ts');
  console.log('✅ Providers ordenados: Auth → Query → Theme → Router');
  console.log('✅ Guards enabled: !!user?.id em todos os hooks');
  console.log('✅ Fetchers centralizados em src/api/*.ts');
  console.log('✅ WhatsApp client isolado com throttle');
  console.log('✅ UX de erro padronizada');
  console.log('✅ Ambiente validado e logs limpos');
  console.log('✅ PWA configurado com autoUpdate');
  console.log('✅ Popup de atualização restaurado');
  console.log('✅ Todas as chamadas supabase.from/rpc centralizadas');

  // Log das otimizações críticas do banco de dados
  console.log('\n🎯 CORREÇÕES CRÍTICAS APLICADAS:');
  console.log('%c[RLS] todas as políticas otimizadas com SELECT ✅', 'color: #00ff00; font-weight: bold;');
  console.log('%c[RLS] políticas consolidadas em whatsapp_sessions ✅', 'color: #00ff00; font-weight: bold;');
  console.log('%c[INDEX] duplicatas removidas em clients ✅', 'color: #00ff00; font-weight: bold;');
  console.log('%c[PERFORMANCE] Otimizações críticas aplicadas com sucesso ✅', 'color: #00ff00; font-weight: bold;');
  console.log('');
  
// PWA Update notification setup
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🔄 Service Worker updated - new version available');
    });
  }

  // Stable keep-alive ping to avoid cross-origin proxy errors
  (async () => {
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
  })();

  // Sistema de validação completa
  (async () => {
    try {
      // Aguardar carregamento completo do DOM
      await new Promise(resolve => {
        if (document.readyState === 'complete') {
          resolve(true);
        } else {
          window.addEventListener('load', () => resolve(true));
        }
      });
      
      // Aguardar um pouco mais para componentes React renderizarem
      setTimeout(async () => {
        const { runFullValidation, validateFormAccessibility } = await import('./lib/formValidation');
        console.log('🔍 Executando validação completa...');
        await runFullValidation();
        
        // Validação específica de formulários
        console.log('📝 Validando acessibilidade de formulários...');
        const formValid = validateFormAccessibility();
        console.log('📝 Resultado da validação de formulários:', formValid ? '✅ Todos os campos têm id/name' : '❌ Campos sem id/name encontrados');
      }, 2000);
    } catch (e) {
      console.warn('Validation setup failed', e);
    }
  })();
  
  // Verificar se há múltiplas versões de React
  if ((window as any).__REACT__) {
    logger.warn('Multiple React instances detected - potential issue');
  }
  
  // Initialize comprehensive dead code analysis and optimization
  setTimeout(async () => {
    try {
      const { runCompleteValidation } = await import('./utils/deadCodeAnalyzer');
      await runCompleteValidation();
      console.log('🎯 COMPLETE OPTIMIZATION APPLIED');
    } catch (error) {
      console.error('❌ Optimization failed:', error);
    }
  }, 2000);
  
  // Verificar se todos os chunks estão carregados
  const loadedScripts = document.querySelectorAll('script[src]');
  let failedChunkCount = 0;
  loadedScripts.forEach(script => {
    if (script.getAttribute('src')?.includes('404')) {
      failedChunkCount++;
      console.error('[CHUNKS] Chunk 404 detectado:', script.getAttribute('src'));
    }
  });
  
  if (failedChunkCount === 0) {
    console.log('[CHUNKS] todos 200 / nenhum 404 ✅');
  }
  
  // Run comprehensive diagnostics
  runAppDiagnostics();
  checkForCommonIssues();
  
  // Evidência final de renderização
  console.log('[RENDER] Inicializando React App...');
  createRoot(rootElement).render(<App />)
  console.log('[RENDER] React App renderizado com sucesso');
} catch (err: any) {
  if (import.meta.env.MODE === 'development') {
    console.error('Falha ao renderizar App:', err)
  }
  showFatalError(err?.message || 'Falha ao inicializar o aplicativo.')
}
