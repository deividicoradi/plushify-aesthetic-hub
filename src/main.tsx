import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { initSentry } from './lib/sentry'
import { initGA } from './lib/analytics'
import { initCleanup } from './lib/cleanup'

// Initialize cleanup first
initCleanup()

// Initialize services with error handling
try {
  initSentry()
} catch (error) {
  console.warn('Sentry initialization failed:', error)
}

try {
  initGA()
} catch (error) {
  console.warn('Analytics initialization failed:', error)
}

// Ensure root element exists
const rootElement = document.getElementById("root")
if (!rootElement) {
  throw new Error("Root element not found")
}

// Render app
createRoot(rootElement).render(<App />)
