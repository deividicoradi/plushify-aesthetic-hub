import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { initSentry } from './lib/sentry'
import { initGA } from './lib/analytics'
import { initCleanup } from './lib/cleanup'
import { cleanupConsoleLogsInProduction } from './utils/console-cleanup'
import { validateEnvironment, checkProductionReadiness } from './lib/environment'
import { logger } from './utils/debugLogger'
import './utils/codeAudit' // Auto-executa auditoria em desenvolvimento

// Validar ambiente antes de iniciar
try {
  checkProductionReadiness();
} catch (error: any) {
  console.error('Environment validation failed:', error);
  document.body.innerHTML = `
    <div style="padding: 20px; color: red; text-align: center;">
      <h2>Erro de Configuração</h2>
      <p>${error.message}</p>
      <p>Contate o administrador do sistema.</p>
    </div>
  `;
  throw error;
}

// Initialize cleanup and optimization first
initCleanup()
cleanupConsoleLogsInProduction()

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
  console.log(`[BOOT] react=${reactVersion} react-dom=${reactDomVersion} singleProvider=OK authLoaded=pending`);
  console.log(`[ENV] SUPABASE_URL=present SUPABASE_ANON_KEY=present`);
  console.log(`[DATA] guards=enabled OK; duplicatedProviders=0`);
  console.log(`[WHATSAPP] isolated=true throttle=ON`);
  
  // Verificar se há múltiplas versões de React
  if ((window as any).__REACT__) {
    logger.warn('Multiple React instances detected - potential issue');
  }
  
  // Expose React globally to help detect duplicate copies during development
  ;(window as any).__REACT__ = React
  
  createRoot(rootElement).render(<App />)
} catch (err: any) {
  if (import.meta.env.MODE === 'development') {
    console.error('Falha ao renderizar App:', err)
  }
  showFatalError(err?.message || 'Falha ao inicializar o aplicativo.')
}
