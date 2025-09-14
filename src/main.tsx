import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { initSentry } from './lib/sentry'
import { initGA } from './lib/analytics'

// Initialize services
initSentry()
initGA()

// Ensure root element exists
const rootElement = document.getElementById("root")
if (!rootElement) {
  throw new Error("Root element not found")
}

// Render app
createRoot(rootElement).render(<App />)
