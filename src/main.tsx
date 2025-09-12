import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// CRITICAL: Expose React globally BEFORE importing App to prevent initialization errors
;(window as any).React = React;
;(window as any).ReactDOM = { createRoot };
;(window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ || {};

// Import App AFTER React is globally available
// App will be dynamically imported to avoid eval-order issues

// Force-refresh stale PWA caches once to avoid old vendor bundles causing runtime errors
const ensureFreshAssets = async () => {
  try {
    const FLAG = 'plushify-cache-busted-2025-09-12-v9-pwa-autoreload';
    if (!localStorage.getItem(FLAG)) {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.update().catch(() => {})));
      }
      localStorage.setItem(FLAG, 'true');
      location.reload();
    }
  } catch (e) {
    console.warn('ensureFreshAssets failed:', e);
  }
};

ensureFreshAssets();

// Auto-reload on new Service Worker activation even before React mounts
if ('serviceWorker' in navigator) {
  let __pwaReloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (__pwaReloaded) return;
    __pwaReloaded = true;
    location.reload();
  });
}

// Initialize services safely after app loads
const initializeServices = async () => {
  try {
    // Only initialize when needed - reduces initial bundle size
    const [sentryModule, gaModule, cdnModule] = await Promise.all([
      import('./lib/sentry').catch(err => {
        console.warn('Failed to load Sentry:', err);
        return { initSentry: () => {} };
      }),
      import('./lib/analytics').catch(err => {
        console.warn('Failed to load GA:', err);
        return { initGA: () => {} };
      }),
      import('./utils/cdnConfig').catch(err => {
        console.warn('Failed to load CDN config:', err);
        return { initializeCDNOptimizations: () => {} };
      })
    ]);
    
    sentryModule.initSentry();
    gaModule.initGA();
    cdnModule.initializeCDNOptimizations();
  } catch (error) {
    console.warn('Failed to initialize services:', error);
  }
};

// Initialize services after app loads to reduce blocking time
setTimeout(initializeServices, 100);

// Ensure root element exists before rendering
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

// Ensure React is available before rendering
if (!(window as any).React) {
  (window as any).React = React;
}

try {
  // Dynamic import of App to ensure React is initialized and break any circular dependencies
  import('./App.tsx')
    .then(({ default: App }) => {
      createRoot(rootElement).render(React.createElement(App));
    })
    .catch((err) => {
      console.error('Failed to load App module:', err);
      rootElement.innerHTML = '<div style="padding: 20px; text-align: center; color: red;">Erro ao carregar a aplicação. Recarregue a página.</div>';
    });
} catch (error) {
  console.error('Failed to render app:', error);
  rootElement.innerHTML = '<div style="padding: 20px; text-align: center; color: red;">Erro ao carregar a aplicação. Recarregue a página.</div>';
}
