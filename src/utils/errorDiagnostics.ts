// Error diagnostics for capturing 'Cannot access "Ke" before initialization' with exact source

function logContextSnippet(source: string, matchIndex: number, context = 200) {
  const start = Math.max(0, matchIndex - context);
  const end = Math.min(source.length, matchIndex + context);
  const snippet = source.slice(start, end);
  // Split into lines and log with a marker
  console.groupCollapsed('[DIAG] Source snippet around Ke');
  console.log(snippet);
  console.groupEnd();
}

async function fetchAndLocateKe(url: string, col?: number) {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    const text = await res.text();

    // Try to find near the column first (best effort)
    let index = -1;
    if (typeof col === 'number' && col > 0 && col < text.length) {
      // Search within a window around col
      const windowSize = 1000;
      const start = Math.max(0, col - windowSize);
      const end = Math.min(text.length, col + windowSize);
      const windowText = text.slice(start, end);
      const localIdx = windowText.indexOf('Ke');
      if (localIdx !== -1) index = start + localIdx;
    }

    // Fallback: first occurrence
    if (index === -1) index = text.indexOf('Ke');

    if (index !== -1) {
      logContextSnippet(text, index);
    } else {
      console.warn('[DIAG] Could not find "Ke" token in fetched source');
    }
  } catch (e) {
    console.warn('[DIAG] Failed to fetch module for diagnostics:', e);
  }
}

function classifyOrigin(filename?: string) {
  if (!filename) return 'unknown';
  if (filename.includes('node_modules/.vite/deps')) return 'vendor (vite deps)';
  if (filename.includes('chunk-') || filename.includes('vendor') || filename.includes('index.mjs')) return 'bundled chunk';
  if (filename.includes('/src/')) return 'app source';
  return 'unknown';
}

export function initErrorDiagnostics() {
  if (typeof window === 'undefined') return;
  if ((window as any).__ERROR_DIAG_INIT__) return;
  (window as any).__ERROR_DIAG_INIT__ = true;

  window.addEventListener('error', (e: ErrorEvent) => {
    const msg = e.message || '';
    if (msg.includes("Cannot access 'Ke' before initialization")) {
      console.group('%c[DIAG] Ke ReferenceError captured', 'color:#f00;font-weight:bold');
      console.log('Message:', msg);
      console.log('File:', e.filename);
      console.log('Line:Col', e.lineno, e.colno);
      // Some browsers provide e.error with stack
      if (e.error && (e.error as any).stack) {
        console.log('Stack:', (e.error as any).stack);
      }
      console.log('Origin:', classifyOrigin(e.filename));
      console.groupEnd();

      if (e.filename) fetchAndLocateKe(e.filename, e.colno || undefined);
    }
  });

  window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
    try {
      const reason = e.reason;
      const msg = typeof reason === 'string' ? reason : (reason?.message || '');
      if (msg.includes("Cannot access 'Ke' before initialization")) {
        console.group('%c[DIAG] Ke ReferenceError (promise)', 'color:#f00;font-weight:bold');
        console.log('Reason:', reason);
        if (reason?.stack) console.log('Stack:', reason.stack);
        console.groupEnd();
      }
    } catch {}
  });

  console.log('[DIAG] ✅ Error diagnostics initialized');
}

// Auto-init
initErrorDiagnostics();
