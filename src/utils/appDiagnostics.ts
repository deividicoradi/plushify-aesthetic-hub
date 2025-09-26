// Comprehensive app diagnostics for troubleshooting white screen issues

export const runAppDiagnostics = () => {
  console.group('🔍 APP DIAGNOSTICS - Análise Completa');
  
  // 1. Router diagnostics
  const currentPath = window.location.pathname;
  const currentSearch = window.location.search;
  const currentHash = window.location.hash;
  
  console.log('[ROUTER] Current route:', {
    pathname: currentPath,
    search: currentSearch,
    hash: currentHash,
    origin: window.location.origin,
    href: window.location.href
  });
  
  // 2. Check for React duplicates
  const reactDevTools = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (reactDevTools) {
    console.log('[REACT] DevTools detected, React versions:', {
      reactVersion: (window as any).React?.version,
      duplicateReact: Object.keys(reactDevTools.renderers || {}).length > 1
    });
  }
  
  // 3. Check loaded scripts
  const scripts = Array.from(document.querySelectorAll('script[src]'));
  const failedScripts = scripts.filter(script => {
    const src = script.getAttribute('src');
    return src?.includes('404') || src?.includes('error');
  });
  
  console.log('[CHUNKS] Script status:', {
    totalScripts: scripts.length,
    failedScripts: failedScripts.length,
    failed: failedScripts.map(s => s.getAttribute('src'))
  });
  
  // 4. Check console errors
  const errors = [];
  const originalConsoleError = console.error;
  console.error = (...args) => {
    errors.push(args);
    originalConsoleError.apply(console, args);
  };
  
  // 5. Check network status
  console.log('[NETWORK] Status:', {
    online: navigator.onLine,
    connection: (navigator as any).connection?.effectiveType || 'unknown'
  });
  
  // 6. Check localStorage/sessionStorage
  let storageStatus = 'OK';
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    sessionStorage.setItem('test', 'test');
    sessionStorage.removeItem('test');
  } catch (e) {
    storageStatus = 'BLOCKED';
  }
  
  console.log('[STORAGE] Status:', storageStatus);
  
  // 7. Check Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(regs => {
      console.log('[SW] Service Workers:', {
        count: regs.length,
        scopes: regs.map(r => r.scope),
        states: regs.map(r => r.active?.state)
      });
    });
  }
  
  // 8. Check Critical CSS/JS
  const criticalResources = [
    ...Array.from(document.querySelectorAll('link[rel="stylesheet"]')),
    ...Array.from(document.querySelectorAll('script[src]'))
  ];
  
  const resourceStatus = criticalResources.map(resource => ({
    type: resource.tagName,
    src: resource.getAttribute('href') || resource.getAttribute('src'),
    loaded: resource.getAttribute('data-loaded') !== 'false'
  }));
  
  console.log('[RESOURCES] Critical resources:', resourceStatus);
  
  // 9. Check for infinite redirects
  const redirectCount = sessionStorage.getItem('redirect_count') || '0';
  const currentCount = parseInt(redirectCount) + 1;
  sessionStorage.setItem('redirect_count', currentCount.toString());
  
  if (currentCount > 3) {
    console.warn('[REDIRECT] Possible redirect loop detected:', currentCount);
  }
  
  // Reset redirect counter after successful load
  setTimeout(() => {
    sessionStorage.removeItem('redirect_count');
  }, 5000);
  
  console.groupEnd();
  
  // Final diagnostic summary
  const summary = {
    route: currentPath,
    scriptsLoaded: scripts.length - failedScripts.length,
    scriptsFailed: failedScripts.length,
    storageWorking: storageStatus === 'OK',
    online: navigator.onLine,
    potentialRedirectLoop: currentCount > 3
  };
  
  console.log('🎯 DIAGNOSTIC SUMMARY:', summary);
  
  return summary;
};

export const checkForCommonIssues = (): string[] => {
  const issues: string[] = [];
  
  // Check for missing React
  if (typeof window.React === 'undefined') {
    issues.push('React not loaded globally');
  }
  
  // Check for missing root element
  if (!document.getElementById('root')) {
    issues.push('Root element not found');
  }
  
  // Check for CSP violations
  const metaCsp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (metaCsp) {
    const cspContent = metaCsp.getAttribute('content') || '';
    if (cspContent.includes("'none'") && !cspContent.includes("'unsafe-inline'")) {
      issues.push('CSP may be blocking inline scripts');
    }
  }
  
  // Check for missing Supabase env vars
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    issues.push('Supabase environment variables missing');
  }
  
  // Check for duplicate React contexts
  const contexts = (window as any).__REACT_CONTEXT_DEVTOOLS__;
  if (contexts && Object.keys(contexts).length > 10) {
    issues.push('Potential context provider duplication');
  }
  
  if (issues.length > 0) {
    console.warn('🚨 Common issues detected:', issues);
  }
  
  return issues;
};