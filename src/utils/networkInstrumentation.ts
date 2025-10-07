// Network instrumentation and hard block for :8080 in preview/prod
// Loads once at startup

(() => {
  const isDev = import.meta.env.MODE === 'development';
  const host = window.location.hostname;
  const onLovablePreview = /\.lovableproject\.com$/i.test(host);
  const block8080 = onLovablePreview && !isDev; // Block only outside dev

  // Utility: safe console without spamming
  const log = (...args: any[]) => {
    if (isDev) console.debug('[NET]', ...args);
  };

  // Save originals
  const originalFetch = window.fetch.bind(window);
  const OriginalWebSocket = window.WebSocket;

  // Reentrancy flag to avoid logging our own logs accidentally
  const NO_LOG_HEADER = 'x-no-log';
  const LOG_URL_HINT = '/__telemetry'; // not used, but reserved

  // Helper: should block 8080 pings?
  const isBlocked8080 = (url: string) => block8080 && /https?:\/\/[^/]+\.lovableproject\.com:8080(\/|$)/i.test(url);

  // Helper: limit size
  const limit = (str: string, max = 4096) => (str.length > max ? str.slice(0, max) + '…' : str);

  // Patch fetch
  window.fetch = async function patchedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    try {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request)?.url || String(input);

      // Hard-block :8080 in preview/prod
      if (url && isBlocked8080(url)) {
        log('Blocked request to :8080', url);
        return new Response('', { status: 204, statusText: 'No Content' });
      }

      // Reentrancy guard: skip logging if header present or our own telemetry endpoint
      const headers = new Headers((init && init.headers) || (input instanceof Request ? input.headers : undefined));
      if (!headers.has(NO_LOG_HEADER)) headers.set(NO_LOG_HEADER, '1');

      const isTelemetry = url.includes(LOG_URL_HINT);

      // Serialize request body safely
      let requestBodyInfo = '' as string;
      const body = init?.body ?? (input instanceof Request ? (input as Request).body : undefined);
      try {
        if (typeof init?.body === 'string') {
          requestBodyInfo = limit(init!.body as string);
        } else if (init?.body instanceof FormData) {
          requestBodyInfo = '[FormData]';
        } else if (init?.body instanceof URLSearchParams) {
          requestBodyInfo = `[URLSearchParams] ${limit(String(init!.body))}`;
        } else if (init?.body instanceof Blob) {
          requestBodyInfo = `[Blob ${init!.body.type || 'binary'}]`;
        } else if (init?.body instanceof ArrayBuffer || ArrayBuffer.isView(init?.body as any)) {
          requestBodyInfo = '[ArrayBuffer]';
        } else if (init?.body && typeof init.body === 'object') {
          requestBodyInfo = limit(JSON.stringify(init.body as any));
        } else if (body) {
          requestBodyInfo = '[Stream]';
        }
      } catch (err) {
        requestBodyInfo = 'Could not serialize request body';
      }

      // Build args with our header injected
      const patchedInit: RequestInit | undefined = init ? { ...init, headers } : undefined;
      const res = await originalFetch(input as any, patchedInit as any);

      // Try to clone response body (best-effort, text only and small bodies)
      let responseBodyInfo = '';
      try {
        const ct = (res.headers.get('content-type') || '').toLowerCase();
        const cl = parseInt(res.headers.get('content-length') || '0', 10);
        const isTextual = ct.includes('application/json') || ct.startsWith('text/');
        const isSmall = !Number.isFinite(cl) || cl <= 65536; // 64KB limit
        if (typeof (res as any).clone === 'function' && isTextual && isSmall) {
          const text = await res.clone().text();
          responseBodyInfo = limit(text);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'; // fix: instanceof Error
        responseBodyInfo = `[clone failed: ${msg}]`;
      }

      // Lightweight log without network (avoids loops and long tasks)
      if (!isTelemetry) {
        log('REQUEST', {
          url,
          method: (init?.method || (input instanceof Request ? (input as Request).method : 'GET')).toUpperCase(),
          status: res.status,
          statusText: res.statusText,
          requestBody: requestBodyInfo,
          responseBody: responseBodyInfo,
        });
      }

      return res;
    } catch (e) {
      // Never break original flow due to logger
      return originalFetch(input as any, init as any);
    }
  };

  // Patch WebSocket to block :8080 silently in preview/prod
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).WebSocket = function(url: string | URL, protocols?: string | string[]) {
      const u = typeof url === 'string' ? url : url.toString();
      if (isBlocked8080(u)) {
        log('Blocked WebSocket to :8080', u);
        // Return a no-op socket to avoid console errors
        const noop: any = {
          url: u,
          readyState: 3,
          close: () => void 0,
          send: () => void 0,
          addEventListener: () => void 0,
          removeEventListener: () => void 0,
          dispatchEvent: () => false,
          onopen: null,
          onmessage: null,
          onerror: null,
          onclose: null,
        };
        queueMicrotask(() => {
          try { if (typeof noop.onclose === 'function') noop.onclose(new CloseEvent('close')); } catch {}
        });
        return noop;
      }
      return new OriginalWebSocket(url as any, protocols as any);
    } as any;
  } catch {}

  // Patch EventSource to block :8080 silently in preview/prod
  try {
    const OriginalEventSource = window.EventSource;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).EventSource = function(url: string | URL, eventSourceInitDict?: EventSourceInit) {
      const u = typeof url === 'string' ? url : url.toString();
      if (isBlocked8080(u)) {
        log('Blocked EventSource to :8080', u);
        // Return minimal stub
        const noop: any = {
          url: u,
          readyState: 2,
          close: () => void 0,
          addEventListener: () => void 0,
          removeEventListener: () => void 0,
          dispatchEvent: () => false,
          onopen: null,
          onmessage: null,
          onerror: null,
        };
        queueMicrotask(() => {
          try { if (typeof noop.onerror === 'function') noop.onerror(new Event('error')); } catch {}
        });
        return noop;
      }
      return new OriginalEventSource(u, eventSourceInitDict);
    } as any;
  } catch {}
})();
