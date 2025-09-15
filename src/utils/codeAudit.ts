// Auditoria automática de código para detectar problemas
interface AuditResult {
  duplicatedImports: string[];
  unusedUtilities: string[];
  cycleDetection: string[];
  performanceIssues: string[];
  securityIssues: string[];
}

// Verificar se há imports duplicados ou conflitantes
export const auditImports = (): string[] => {
  const issues: string[] = [];
  
  // Verificar React duplicado
  if ((window as any).__REACT__ && (window as any).React) {
    issues.push('Multiple React instances detected');
  }
  
  // Verificar Sonner/Toast conflicts
  const toastElements = document.querySelectorAll('[data-sonner-toaster]');
  if (toastElements.length > 1) {
    issues.push('Multiple toast providers detected');
  }
  
  return issues;
};

// Verificar performance
export const auditPerformance = (): string[] => {
  const issues: string[] = [];
  
  // Verificar número de DOM nodes
  const nodeCount = document.querySelectorAll('*').length;
  if (nodeCount > 5000) {
    issues.push(`High DOM node count: ${nodeCount}`);
  }
  
  // Verificar memory leaks básicos (Chrome only)
  const perfMemory = (performance as any).memory;
  if (perfMemory && perfMemory.usedJSHeapSize > 50 * 1024 * 1024) {
    issues.push(`High memory usage: ${Math.round(perfMemory.usedJSHeapSize / 1024 / 1024)}MB`);
  }
  
  return issues;
};

// Verificar segurança básica
export const auditSecurity = (): string[] => {
  const issues: string[] = [];
  
  // Verificar console.log em produção
  if (import.meta.env.MODE === 'production') {
    const hasConsoleLogs = document.documentElement.innerHTML.includes('console.log');
    if (hasConsoleLogs) {
      issues.push('Console logs detected in production build');
    }
  }
  
  // Verificar HTTPS em produção
  if (import.meta.env.MODE === 'production' && location.protocol !== 'https:') {
    issues.push('Non-HTTPS connection in production');
  }
  
  return issues;
};

// Executar auditoria completa
export const runFullAudit = (): AuditResult => {
  return {
    duplicatedImports: auditImports(),
    unusedUtilities: [], // Placeholder for static analysis
    cycleDetection: [], // Placeholder for static analysis  
    performanceIssues: auditPerformance(),
    securityIssues: auditSecurity()
  };
};

// Executar auditoria em desenvolvimento
if (import.meta.env.MODE === 'development') {
  setTimeout(() => {
    const results = runFullAudit();
    const hasIssues = Object.values(results).some(arr => arr.length > 0);
    
    if (hasIssues) {
      console.group('🔍 Code Audit Results');
      Object.entries(results).forEach(([category, issues]) => {
        if (issues.length > 0) {
          console.warn(`${category}:`, issues);
        }
      });
      console.groupEnd();
    } else {
      console.log('✅ Code audit passed - no issues detected');
    }
  }, 2000);
}