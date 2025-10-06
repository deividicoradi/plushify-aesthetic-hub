/**
 * Service Worker Manager - Singleton para garantir registro único e ciclo de vida correto
 */

class ServiceWorkerManager {
  private static instance: ServiceWorkerManager | null = null;
  private registration: ServiceWorkerRegistration | null = null;
  private initialized = false;
  private updateCallbacks: Set<() => void> = new Set();

  private constructor() {}

  static getInstance(): ServiceWorkerManager {
    if (!ServiceWorkerManager.instance) {
      ServiceWorkerManager.instance = new ServiceWorkerManager();
    }
    return ServiceWorkerManager.instance;
  }

  /**
   * Inicializar SW - chamar apenas uma vez no boot da aplicação
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('[SW] Already initialized');
      return;
    }

    if (!('serviceWorker' in navigator)) {
      console.log('[SW] Service Worker not supported');
      return;
    }

    try {
      // 1. Remover registros duplicados primeiro
      await this.cleanupDuplicateRegistrations();

      // 2. Aguardar o SW estar pronto (gerado pelo vite-plugin-pwa)
      this.registration = await navigator.serviceWorker.ready;
      console.log('[SW] Service Worker ready');

      // 3. Configurar listeners de update
      this.setupUpdateListener();

      this.initialized = true;
    } catch (error) {
      console.error('[SW] Initialization error:', error);
    }
  }

  /**
   * Limpar SWs duplicados - manter apenas o mais recente
   */
  private async cleanupDuplicateRegistrations(): Promise<void> {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      if (registrations.length <= 1) {
        console.log('[SW] No duplicate registrations found');
        return;
      }

      console.log(`[SW] Found ${registrations.length} registrations, cleaning up duplicates...`);

      // Manter apenas a primeira (mais recente)
      for (let i = 1; i < registrations.length; i++) {
        await registrations[i].unregister();
        console.log('[SW] Unregistered duplicate registration', i);
      }
    } catch (error) {
      console.error('[SW] Cleanup error:', error);
    }
  }

  /**
   * Configurar listener de updates - apenas uma vez
   */
  private setupUpdateListener(): void {
    if (!this.registration) return;

    // Detectar novo SW em waiting
    if (this.registration.waiting && navigator.serviceWorker.controller) {
      this.notifyUpdate();
    }

    // Monitorar novos updates
    this.registration.addEventListener('updatefound', () => {
      const newWorker = this.registration?.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          this.notifyUpdate();
        }
      });
    });

    // Forçar verificação de update (apenas uma vez)
    this.registration.update().catch(() => {});
  }

  /**
   * Notificar callbacks de update registrados
   */
  private notifyUpdate(): void {
    console.log('[SW] Update available, notifying callbacks');
    this.updateCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('[SW] Update callback error:', error);
      }
    });
  }

  /**
   * Registrar callback para quando houver update disponível
   */
  onUpdateAvailable(callback: () => void): () => void {
    this.updateCallbacks.add(callback);
    
    // Retornar função de cleanup
    return () => {
      this.updateCallbacks.delete(callback);
    };
  }

  /**
   * Ativar update pendente
   */
  async activateUpdate(): Promise<void> {
    if (!this.registration?.waiting) {
      console.log('[SW] No waiting worker to activate');
      return;
    }

    try {
      console.log('[SW] Activating update...');
      
      // Configurar listener de controllerchange ANTES de enviar SKIP_WAITING
      const controllerChangePromise = new Promise<void>((resolve) => {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('[SW] Controller changed, reloading...');
          resolve();
        }, { once: true });
      });

      // Enviar mensagem para skip waiting
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      console.log('[SW] SKIP_WAITING message sent');
      
      // Aguardar controller change e recarregar apenas uma vez
      await controllerChangePromise;
      window.location.reload();
    } catch (error) {
      console.error('[SW] Activation error:', error);
      throw error;
    }
  }

  /**
   * Verificar se há update disponível
   */
  hasUpdateAvailable(): boolean {
    return !!(this.registration?.waiting && navigator.serviceWorker.controller);
  }
}

export const swManager = ServiceWorkerManager.getInstance();
