/**
 * Utilitário de WebSocket Resiliente
 * 
 * Características:
 * - Detecção de ambiente/sandbox (iframe)
 * - Validação/normalização de URL (ws/wss)
 * - Fallback para EventSource quando WS não for possível
 * - Reconexão com backoff exponencial e limite
 * - Impede múltiplas tentativas paralelas
 * - Limpeza correta de listeners
 * - Logs apenas em dev
 */

export enum ConnectionReadyState {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3,
}

export interface ResilientWebSocketOptions {
  protocols?: string | string[];
  maxReconnects?: number;
  initialRetryDelay?: number;
  maxRetryDelay?: number;
  eventSourceOptions?: EventSourceInit;
  onOpen?: (event: Event) => void;
  onMessage?: (event: MessageEvent | Event) => void;
  onError?: (event: Event) => void;
  onClose?: (event: CloseEvent | Event) => void;
  debug?: boolean;
}

interface ConnectionState {
  connection: WebSocket | EventSource | null;
  readyState: ConnectionReadyState;
  reconnectCount: number;
  reconnectTimer: number | null;
  isReconnecting: boolean;
  isFallbackMode: boolean;
  listeners: Map<string, EventListener[]>;
}

// Cache de conexões compartilhadas
const sharedConnections = new Map<string, ConnectionState>();

// Detectar se está em ambiente sandbox/iframe restritivo
function detectSandboxEnvironment(): boolean {
  try {
    // Verificar se está em iframe
    if (window.self !== window.top) {
      const sandbox = document.querySelector('iframe')?.getAttribute('sandbox');
      if (sandbox && !sandbox.includes('allow-same-origin')) {
        return true;
      }
    }
    return false;
  } catch (e) {
    // Cross-origin iframe lança erro ao acessar window.top
    return true;
  }
}

// Normalizar e validar URL WebSocket
function normalizeWebSocketUrl(url: string): string {
  const isDev = process.env.NODE_ENV !== 'production';
  
  try {
    const parsed = new URL(url);
    
    // Normalizar protocolo
    if (parsed.protocol === 'http:') {
      parsed.protocol = 'ws:';
    } else if (parsed.protocol === 'https:') {
      parsed.protocol = 'wss:';
    } else if (parsed.protocol !== 'ws:' && parsed.protocol !== 'wss:') {
      throw new Error(`Invalid WebSocket protocol: ${parsed.protocol}`);
    }
    
    return parsed.toString();
  } catch (e) {
    if (isDev) {
      console.error('[ResilientWS] Invalid URL:', url, e);
    }
    throw new Error(`Invalid WebSocket URL: ${url}`);
  }
}

// Calcular delay de reconexão com backoff exponencial e jitter
function calculateBackoff(
  attemptNumber: number,
  initialDelay: number,
  maxDelay: number
): number {
  const exponentialDelay = initialDelay * Math.pow(2, attemptNumber);
  const cappedDelay = Math.min(exponentialDelay, maxDelay);
  // Adicionar jitter (±25%)
  const jitter = cappedDelay * 0.25 * (Math.random() * 2 - 1);
  return Math.max(100, cappedDelay + jitter);
}

// Log apenas em desenvolvimento
function devLog(message: string, ...args: any[]): void {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[ResilientWS] ${message}`, ...args);
  }
}

function devError(message: string, ...args: any[]): void {
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[ResilientWS] ${message}`, ...args);
  }
}

// Criar conexão WebSocket
function createWebSocketConnection(
  url: string,
  state: ConnectionState,
  options: ResilientWebSocketOptions
): WebSocket | null {
  try {
    const ws = new WebSocket(url, options.protocols);
    
    ws.addEventListener('open', (event) => {
      devLog('WebSocket connected:', url);
      state.readyState = ConnectionReadyState.OPEN;
      state.reconnectCount = 0;
      state.isReconnecting = false;
      options.onOpen?.(event);
      
      // Disparar callbacks de listeners
      state.listeners.get('open')?.forEach(listener => listener(event));
    });
    
    ws.addEventListener('message', (event) => {
      options.onMessage?.(event);
      state.listeners.get('message')?.forEach(listener => listener(event));
    });
    
    ws.addEventListener('error', (event) => {
      devError('WebSocket error:', url, event);
      options.onError?.(event);
      state.listeners.get('error')?.forEach(listener => listener(event));
    });
    
    ws.addEventListener('close', (event) => {
      devLog('WebSocket closed:', url, 'code:', event.code, 'reason:', event.reason);
      state.readyState = ConnectionReadyState.CLOSED;
      options.onClose?.(event);
      state.listeners.get('close')?.forEach(listener => listener(event));
      
      // Tentar reconectar se não foi fechamento limpo
      if (event.code !== 1000 && event.code !== 1001) {
        attemptReconnect(url, state, options);
      }
    });
    
    return ws;
  } catch (e) {
    devError('Failed to create WebSocket:', url, e);
    return null;
  }
}

// Criar conexão EventSource como fallback
function createEventSourceConnection(
  url: string,
  state: ConnectionState,
  options: ResilientWebSocketOptions
): EventSource | null {
  try {
    // EventSource só suporta HTTP/HTTPS
    const httpUrl = url.replace(/^wss?:/, url.startsWith('wss:') ? 'https:' : 'http:');
    
    devLog('Falling back to EventSource:', httpUrl);
    const es = new EventSource(httpUrl, options.eventSourceOptions);
    state.isFallbackMode = true;
    
    es.addEventListener('open', (event) => {
      devLog('EventSource connected:', httpUrl);
      state.readyState = ConnectionReadyState.OPEN;
      state.reconnectCount = 0;
      state.isReconnecting = false;
      options.onOpen?.(event);
      state.listeners.get('open')?.forEach(listener => listener(event));
    });
    
    es.addEventListener('message', (event) => {
      options.onMessage?.(event);
      state.listeners.get('message')?.forEach(listener => listener(event));
    });
    
    es.addEventListener('error', (event) => {
      devError('EventSource error:', httpUrl, event);
      options.onError?.(event);
      state.listeners.get('error')?.forEach(listener => listener(event));
      
      // EventSource tenta reconectar automaticamente
      // mas vamos gerenciar manualmente para consistência
      if (es.readyState === EventSource.CLOSED) {
        state.readyState = ConnectionReadyState.CLOSED;
        attemptReconnect(url, state, options);
      }
    });
    
    return es;
  } catch (e) {
    devError('Failed to create EventSource:', url, e);
    return null;
  }
}

// Tentar reconectar com backoff exponencial
function attemptReconnect(
  url: string,
  state: ConnectionState,
  options: ResilientWebSocketOptions
): void {
  const maxReconnects = options.maxReconnects ?? 10;
  const initialDelay = options.initialRetryDelay ?? 1000;
  const maxDelay = options.maxRetryDelay ?? 30000;
  
  // Não reconectar se já estiver tentando ou atingiu o limite
  if (state.isReconnecting) {
    devLog('Already reconnecting, skipping duplicate attempt');
    return;
  }
  
  if (state.reconnectCount >= maxReconnects) {
    devError('Max reconnection attempts reached:', state.reconnectCount);
    return;
  }
  
  state.isReconnecting = true;
  state.reconnectCount++;
  
  const delay = calculateBackoff(state.reconnectCount - 1, initialDelay, maxDelay);
  devLog(`Reconnecting in ${delay}ms (attempt ${state.reconnectCount}/${maxReconnects})`);
  
  state.reconnectTimer = window.setTimeout(() => {
    state.reconnectTimer = null;
    
    // Limpar conexão antiga
    if (state.connection) {
      try {
        if (state.connection instanceof WebSocket) {
          state.connection.close();
        } else if (state.connection instanceof EventSource) {
          state.connection.close();
        }
      } catch (e) {
        devError('Error closing old connection:', e);
      }
      state.connection = null;
    }
    
    // Tentar criar nova conexão
    const normalizedUrl = normalizeWebSocketUrl(url);
    state.connection = createConnection(normalizedUrl, state, options);
    
    if (!state.connection) {
      state.isReconnecting = false;
      // Tentar novamente após delay
      attemptReconnect(url, state, options);
    }
  }, delay);
}

// Criar conexão (WS ou EventSource)
function createConnection(
  url: string,
  state: ConnectionState,
  options: ResilientWebSocketOptions
): WebSocket | EventSource | null {
  const inSandbox = detectSandboxEnvironment();
  
  // Tentar WebSocket primeiro (a menos que em sandbox restritivo)
  if (!inSandbox && !state.isFallbackMode) {
    const ws = createWebSocketConnection(url, state, options);
    if (ws) return ws;
    
    devLog('WebSocket failed, trying EventSource fallback...');
  }
  
  // Fallback para EventSource
  return createEventSourceConnection(url, state, options);
}

// Criar ou obter conexão compartilhada
export function createOrJoinResilientConnection(
  url: string,
  options: ResilientWebSocketOptions = {}
): {
  connection: WebSocket | EventSource | null;
  readyState: ConnectionReadyState;
  addEventListener: (type: string, listener: EventListener) => void;
  removeEventListener: (type: string, listener: EventListener) => void;
  send: (data: string | ArrayBufferLike | Blob | ArrayBufferView) => void;
  close: () => void;
  cleanup: () => void;
} {
  const normalizedUrl = normalizeWebSocketUrl(url);
  
  // Tentar reutilizar conexão existente
  let state = sharedConnections.get(normalizedUrl);
  
  if (!state) {
    // Criar nova conexão
    state = {
      connection: null,
      readyState: ConnectionReadyState.CONNECTING,
      reconnectCount: 0,
      reconnectTimer: null,
      isReconnecting: false,
      isFallbackMode: false,
      listeners: new Map(),
    };
    
    sharedConnections.set(normalizedUrl, state);
    state.connection = createConnection(normalizedUrl, state, options);
  }
  
  return {
    connection: state.connection,
    readyState: state.readyState,
    
    addEventListener(type: string, listener: EventListener) {
      if (!state.listeners.has(type)) {
        state.listeners.set(type, []);
      }
      state.listeners.get(type)!.push(listener);
      
      // Adicionar ao objeto real também
      state.connection?.addEventListener(type, listener);
    },
    
    removeEventListener(type: string, listener: EventListener) {
      const listeners = state.listeners.get(type);
      if (listeners) {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
      
      // Remover do objeto real também
      state.connection?.removeEventListener(type, listener);
    },
    
    send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
      if (state.connection instanceof WebSocket && state.readyState === ConnectionReadyState.OPEN) {
        state.connection.send(data);
      } else {
        devError('Cannot send: connection not ready or is EventSource');
      }
    },
    
    close() {
      if (state.reconnectTimer) {
        clearTimeout(state.reconnectTimer);
        state.reconnectTimer = null;
      }
      
      state.isReconnecting = false;
      
      if (state.connection) {
        try {
          if (state.connection instanceof WebSocket) {
            state.connection.close(1000, 'Client closed');
          } else if (state.connection instanceof EventSource) {
            state.connection.close();
          }
        } catch (e) {
          devError('Error closing connection:', e);
        }
      }
      
      state.readyState = ConnectionReadyState.CLOSED;
    },
    
    cleanup() {
      this.close();
      
      // Limpar todos os listeners
      state.listeners.forEach((listeners, type) => {
        listeners.forEach(listener => {
          state.connection?.removeEventListener(type, listener);
        });
      });
      state.listeners.clear();
      
      // Remover do cache
      sharedConnections.delete(normalizedUrl);
      
      devLog('Connection cleanup complete:', normalizedUrl);
    },
  };
}

// Limpar todas as conexões (útil para testes ou cleanup global)
export function cleanupAllConnections(): void {
  devLog('Cleaning up all connections...');
  
  sharedConnections.forEach((state, url) => {
    if (state.reconnectTimer) {
      clearTimeout(state.reconnectTimer);
    }
    
    if (state.connection) {
      try {
        if (state.connection instanceof WebSocket) {
          state.connection.close(1000, 'Global cleanup');
        } else if (state.connection instanceof EventSource) {
          state.connection.close();
        }
      } catch (e) {
        devError('Error during cleanup:', e);
      }
    }
  });
  
  sharedConnections.clear();
  devLog('All connections cleaned up');
}
