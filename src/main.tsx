import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Expose React globally as a safe fallback for any vendor chunks expecting window.React
;(window as any).React = React;
;(window as any).ReactDOM = { createRoot };

// Force-refresh stale PWA caches once to avoid old vendor bundles causing runtime errors
const ensureFreshAssets = async () => {
  try {
    const FLAG = 'plushify-cache-busted-2025-09-10-v3-hooks-fix';
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

createRoot(rootElement).render(<App />);
