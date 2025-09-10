
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

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
