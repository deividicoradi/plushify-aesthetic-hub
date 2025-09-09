
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Defer heavy initializations to improve initial load performance
const initializeServices = async () => {
  // Only initialize when needed - reduces initial bundle size
  const [{ initSentry }, { initGA }, { initializeCDNOptimizations }] = await Promise.all([
    import('./lib/sentry'),
    import('./lib/analytics'),
    import('./utils/cdnConfig')
  ]);
  
  initSentry();
  initGA();
  initializeCDNOptimizations();
};

// Initialize services after app loads to reduce blocking time
setTimeout(initializeServices, 100);

createRoot(document.getElementById("root")!).render(<App />);
