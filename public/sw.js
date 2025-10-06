// Service Worker customizado para lidar com SKIP_WAITING
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Received SKIP_WAITING message');
    self.skipWaiting();
  }
});

// Não fazer claim automático - deixar o app controlar
self.addEventListener('activate', (event) => {
  console.log('[SW] Activated');
  // NÃO chamar clients.claim() aqui - será controlado pelo app
});
