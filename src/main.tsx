
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initSentry } from './lib/sentry'
import { initGA } from './lib/analytics'
import { initializeCDNOptimizations } from './utils/cdnConfig'

// Inicializar Sentry
initSentry();

// Inicializar Google Analytics
initGA();

// Inicializar otimizações de CDN e Cache
initializeCDNOptimizations();

createRoot(document.getElementById("root")!).render(<App />);
