// Service Worker cleanup and update enforcement
export const forceServiceWorkerUpdate = async (): Promise<void> => {
  if (!('serviceWorker' in navigator)) {
    console.log('[SW] Service Worker não suportado');
    return;
  }

  try {
    // Get all registrations
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    if (registrations.length === 0) {
      console.log('[SW] Nenhum Service Worker registrado');
      return;
    }

    for (const registration of registrations) {
      console.log('[SW] Atualizando Service Worker:', registration.scope);
      
      // Force update
      await registration.update();
      
      // If there's a waiting SW, force it to become active
      if (registration.waiting) {
        console.log('[SW] Forçando SW em espera a ativar');
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    }

    // Clear all caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      console.log('[SW] Limpando caches:', cacheNames);
      
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }

    console.log('[SW] Service Worker e caches atualizados com sucesso');
  } catch (error) {
    console.error('[SW] Erro ao atualizar Service Worker:', error);
  }
};

export const initServiceWorkerCleanup = (): void => {
  if (!('serviceWorker' in navigator)) return;

  // Listen for SW updates
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('[SW] Novo Service Worker ativo - recarregando página');
    window.location.reload();
  });

  // Auto-update every 30 seconds when page is visible
  const updateInterval = setInterval(async () => {
    if (document.hidden) return;
    
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      registration.update();
    }
  }, 30000);

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    clearInterval(updateInterval);
  });
};

export const clearAllAppData = async (): Promise<void> => {
  try {
    // Clear localStorage
    localStorage.clear();
    console.log('[CLEANUP] localStorage limpo');
    
    // Clear sessionStorage  
    sessionStorage.clear();
    console.log('[CLEANUP] sessionStorage limpo');
    
    // Clear IndexedDB (Supabase may use it)
    if ('indexedDB' in window) {
      // This is a simplified cleanup - in production you'd want to list all DBs
      try {
        const deleteReq = indexedDB.deleteDatabase('supabase');
        deleteReq.onsuccess = () => console.log('[CLEANUP] IndexedDB limpo');
      } catch (e) {
        console.warn('[CLEANUP] Erro ao limpar IndexedDB:', e);
      }
    }
    
    // Clear all caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('[CLEANUP] Todos os caches limpos');
    }
    
    // Force SW update
    await forceServiceWorkerUpdate();
    
  } catch (error) {
    console.error('[CLEANUP] Erro durante limpeza:', error);
  }
};