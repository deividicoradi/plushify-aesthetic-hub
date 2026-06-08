/**
 * Stale Bundle Guard
 * --------------------------------------------------------------
 * Evita "tela branca" quando o navegador serve um index.html antigo
 * (via Service Worker ou cache HTTP) que referencia chunks JS/CSS
 * que já não existem mais no deploy atual.
 *
 * Estratégia em 3 camadas:
 *  1. Compara BUILD_ID embutido no bundle com o que está em localStorage.
 *     Se diferente, força limpeza completa + reload (1x via sessionStorage).
 *  2. Intercepta erros globais de "Failed to fetch dynamically imported
 *     module" / "ChunkLoadError" (sintoma clássico de bundle obsoleto)
 *     e dispara a mesma recuperação.
 *  3. Limpa Service Workers e Cache Storage antes de recarregar para
 *     garantir que o reload pegue o HTML novo do servidor.
 */

declare const __BUILD_ID__: string;
declare const __APP_VERSION__: string;

const BUILD_ID_KEY = 'plushify:build-id';
const RECOVERY_FLAG = 'plushify:stale-bundle-recovery';

const currentBuildId =
  typeof __BUILD_ID__ !== 'undefined' ? __BUILD_ID__ : 'dev';
const currentVersion =
  typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';

function isPreviewOrIframe(): boolean {
  try {
    if (window.self !== window.top) return true;
    const h = window.location.hostname;
    return (
      h.startsWith('id-preview--') ||
      h.startsWith('preview--') ||
      h.endsWith('.lovableproject.com') ||
      h.endsWith('.lovableproject-dev.com') ||
      h.endsWith('.beta.lovable.dev')
    );
  } catch {
    return true;
  }
}

async function purgeClientCaches(): Promise<void> {
  // 1. Desregistrar todos os service workers do app
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.allSettled(regs.map((r) => r.unregister()));
    }
  } catch (e) {
    console.warn('[StaleBundleGuard] SW unregister failed', e);
  }

  // 2. Apagar Cache Storage
  try {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.allSettled(keys.map((k) => caches.delete(k)));
    }
  } catch (e) {
    console.warn('[StaleBundleGuard] caches.delete failed', e);
  }

  // 3. Limpar resíduos de PWA/Workbox em localStorage/sessionStorage
  try {
    const drop = (storage: Storage) => {
      const toRemove: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const k = storage.key(i);
        if (k && /(workbox|pwa-|sw-)/i.test(k)) toRemove.push(k);
      }
      toRemove.forEach((k) => storage.removeItem(k));
    };
    drop(localStorage);
    drop(sessionStorage);
  } catch {
    /* noop */
  }
}

let recovering = false;

async function recoverFromStaleBundle(reason: string): Promise<void> {
  if (recovering) return;
  recovering = true;

  // Evitar loop infinito: só reload uma vez por sessão
  if (sessionStorage.getItem(RECOVERY_FLAG) === '1') {
    console.warn(
      `[StaleBundleGuard] Recovery já tentado nesta sessão (${reason}). Abortando reload.`
    );
    return;
  }
  sessionStorage.setItem(RECOVERY_FLAG, '1');

  console.warn(`[StaleBundleGuard] Bundle obsoleto detectado (${reason}). Limpando cache e recarregando...`);
  await purgeClientCaches();

  // Atualiza build id ANTES do reload para não disparar de novo
  try {
    localStorage.setItem(BUILD_ID_KEY, currentBuildId);
  } catch {
    /* noop */
  }

  // Reload "hard" com query param para furar cache de borda
  const url = new URL(window.location.href);
  url.searchParams.set('_v', currentBuildId);
  window.location.replace(url.toString());
}

function isChunkLoadError(message: string): boolean {
  if (!message) return false;
  return (
    /Failed to fetch dynamically imported module/i.test(message) ||
    /Importing a module script failed/i.test(message) ||
    /ChunkLoadError/i.test(message) ||
    /Loading chunk \d+ failed/i.test(message) ||
    /Unable to preload CSS/i.test(message)
  );
}

export function initStaleBundleGuard(): void {
  if (typeof window === 'undefined') return;

  // Skip em preview/iframe — Lovable editor já gerencia recarregamento
  if (isPreviewOrIframe()) {
    return;
  }

  // Limpar flag de recovery se chegamos até aqui com sucesso
  // (executar após pequeno delay para garantir que o app montou)
  window.setTimeout(() => {
    try {
      sessionStorage.removeItem(RECOVERY_FLAG);
    } catch {
      /* noop */
    }
  }, 5000);

  // 1. Build ID check
  try {
    const storedBuildId = localStorage.getItem(BUILD_ID_KEY);
    if (storedBuildId && storedBuildId !== currentBuildId) {
      console.info(
        `[StaleBundleGuard] Nova versão detectada (${storedBuildId} → ${currentBuildId})`
      );
      void recoverFromStaleBundle('version-mismatch');
      return;
    }
    if (!storedBuildId) {
      localStorage.setItem(BUILD_ID_KEY, currentBuildId);
    }
  } catch {
    /* noop */
  }

  // 2. Listener global para erros de chunk
  window.addEventListener('error', (event) => {
    const msg = event?.message || (event?.error && event.error.message) || '';
    if (isChunkLoadError(msg)) {
      event.preventDefault?.();
      void recoverFromStaleBundle('chunk-load-error');
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason: any = event?.reason;
    const msg =
      (reason && (reason.message || (typeof reason === 'string' ? reason : ''))) || '';
    if (isChunkLoadError(msg)) {
      event.preventDefault?.();
      void recoverFromStaleBundle('chunk-load-rejection');
    }
  });

  console.info(
    `[StaleBundleGuard] Ativo (build=${currentBuildId}, version=${currentVersion})`
  );
}

/**
 * Kill-switch manual: ?reset-cache=1 na URL força limpeza completa.
 * Útil para suporte / debug.
 */
export function checkManualResetFlag(): void {
  if (typeof window === 'undefined') return;
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.get('reset-cache') === '1') {
      url.searchParams.delete('reset-cache');
      void purgeClientCaches().then(() => {
        window.location.replace(url.toString());
      });
    }
  } catch {
    /* noop */
  }
}