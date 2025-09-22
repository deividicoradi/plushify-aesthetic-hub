// Sistema de otimização de performance
// Elimina forced reflows e otimiza handlers demorados

let rafId: number | null = null;
const pendingUpdates = new Set<() => void>();

// RequestAnimationFrame batching para evitar forced reflows
export const batchUpdate = (callback: () => void) => {
  pendingUpdates.add(callback);
  
  if (rafId === null) {
    rafId = requestAnimationFrame(() => {
      const updates = Array.from(pendingUpdates);
      pendingUpdates.clear();
      rafId = null;
      
      // Executar todas as atualizações em batch
      updates.forEach(update => {
        try {
          update();
        } catch (error) {
          console.error('[PERFORMANCE] Erro na atualização em batch:', error);
        }
      });
    });
  }
};

// Debounce para handlers demorados
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

// Throttle para eventos frequentes
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Otimizar setTimeout para evitar handlers demorados
export const optimizedSetTimeout = (callback: () => void, delay: number = 0) => {
  const start = performance.now();
  
  return setTimeout(() => {
    const optimizedCallback = () => {
      const callbackStart = performance.now();
      try {
        callback();
      } catch (error) {
        console.error('[PERFORMANCE] Erro no setTimeout otimizado:', error);
      } finally {
        const duration = performance.now() - callbackStart;
        if (duration > 16) { // > 1 frame (16ms)
          console.warn(`[PERFORMANCE] Handler demorado detectado: ${duration.toFixed(2)}ms`);
        }
      }
    };
    
    // Se o delay for longo, usar requestIdleCallback se disponível
    if (delay > 100 && 'requestIdleCallback' in window) {
      requestIdleCallback(optimizedCallback, { timeout: delay });
    } else {
      batchUpdate(optimizedCallback);
    }
  }, delay);
};

// Monitor de performance para detectar violações
export const initPerformanceMonitor = () => {
  if (typeof window === 'undefined') return;
  
  // Observer para Long Tasks
  if ('PerformanceObserver' in window && 'PerformanceLongTaskTiming' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) { // Tasks > 50ms
            console.warn(`[PERFORMANCE] Long task detectada: ${entry.duration.toFixed(2)}ms`);
          }
        }
      });
      observer.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      console.warn('[PERFORMANCE] Long Task Observer não suportado');
    }
  }
  
  // Monitor de Layout Shifts
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShift = entry as any;
          if (layoutShift.hadRecentInput) continue; // Ignorar shifts causados por input do usuário
          
          if (layoutShift.value > 0.1) { // CLS > 0.1
            console.warn(`[PERFORMANCE] Layout shift detectado: ${layoutShift.value.toFixed(4)}`);
          }
        }
      });
      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.warn('[PERFORMANCE] Layout Shift Observer não suportado');
    }
  }
  
  console.log('[PERFORMANCE] ✅ Monitor de performance inicializado');
};

// Limpeza na saída da página
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
    pendingUpdates.clear();
  });
}