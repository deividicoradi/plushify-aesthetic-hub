
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initSentry } from './lib/sentry'
import { initGA } from './lib/analytics'

// Inicializar Sentry
initSentry();

// Inicializar Google Analytics
initGA();

createRoot(document.getElementById("root")!).render(<App />);
