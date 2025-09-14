// Utility para limpar recursos antigos e evitar conflitos

export const cleanupResources = () => {
  try {
    // Limpar service workers antigos
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(let registration of registrations) {
          registration.unregister().catch(err => {
            console.warn('Failed to unregister service worker:', err);
          });
        }
      });
    }

    // Limpar caches antigos
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Manter apenas caches essenciais
            if (!cacheName.includes('v10')) {
              return caches.delete(cacheName);
            }
          })
        );
      }).catch(err => {
        console.warn('Failed to clear old caches:', err);
      });
    }

    // Limpar localStorage de itens desnecessários
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('pwa-') || key.includes('workbox-'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (err) {
      console.warn('Failed to clean localStorage:', err);
    }

    // Limpar sessionStorage
    try {
      const sessionKeysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.includes('pwa-') || key.includes('workbox-'))) {
          sessionKeysToRemove.push(key);
        }
      }
      sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
    } catch (err) {
      console.warn('Failed to clean sessionStorage:', err);
    }

  } catch (error) {
    console.warn('Error during cleanup:', error);
  }
};

// Executar limpeza no carregamento da página
export const initCleanup = () => {
  // Executar após um pequeno delay para não interferir com o carregamento
  setTimeout(cleanupResources, 1000);
};