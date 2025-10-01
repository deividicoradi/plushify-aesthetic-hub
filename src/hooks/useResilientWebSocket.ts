import { useEffect, useRef, useState, useCallback } from 'react';
import {
  createOrJoinResilientConnection,
  ConnectionReadyState,
  type ResilientWebSocketOptions,
} from '@/utils/resilientWebSocket';

export interface UseResilientWebSocketOptions extends ResilientWebSocketOptions {
  /** Se deve conectar automaticamente ao montar */
  autoConnect?: boolean;
  /** Se deve reconectar ao desmontar e remontar */
  reconnectOnMount?: boolean;
  /** Se deve compartilhar conexão entre componentes */
  share?: boolean;
}

export interface ResilientWebSocketReturn {
  /** Estado de prontidão da conexão */
  readyState: ConnectionReadyState;
  /** Última mensagem recebida */
  lastMessage: MessageEvent | Event | null;
  /** Enviar mensagem pelo WebSocket */
  send: (data: string | ArrayBufferLike | Blob | ArrayBufferView) => void;
  /** Conectar manualmente */
  connect: () => void;
  /** Desconectar */
  disconnect: () => void;
  /** Se está conectado */
  isConnected: boolean;
  /** Se está conectando */
  isConnecting: boolean;
  /** Se está em modo fallback (EventSource) */
  isFallbackMode: boolean;
}

/**
 * Hook React para gerenciar conexão WebSocket resiliente
 * 
 * @example
 * ```tsx
 * const { send, lastMessage, isConnected } = useResilientWebSocket(
 *   'wss://api.example.com/ws',
 *   {
 *     onMessage: (event) => console.log('Received:', event.data),
 *     maxReconnects: 5,
 *   }
 * );
 * ```
 */
export function useResilientWebSocket(
  url: string | null,
  options: UseResilientWebSocketOptions = {}
): ResilientWebSocketReturn {
  const {
    autoConnect = true,
    reconnectOnMount = false,
    share = true,
    ...connectionOptions
  } = options;

  const [readyState, setReadyState] = useState<ConnectionReadyState>(
    ConnectionReadyState.CLOSED
  );
  const [lastMessage, setLastMessage] = useState<MessageEvent | Event | null>(null);
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  
  const connectionRef = useRef<ReturnType<typeof createOrJoinResilientConnection> | null>(null);
  const urlRef = useRef<string | null>(url);
  const optionsRef = useRef(connectionOptions);

  // Atualizar refs quando props mudarem
  useEffect(() => {
    urlRef.current = url;
    optionsRef.current = connectionOptions;
  }, [url, connectionOptions]);

  // Conectar
  const connect = useCallback(() => {
    if (!urlRef.current) {
      console.warn('[useResilientWebSocket] No URL provided');
      return;
    }

    // Desconectar existente se houver
    if (connectionRef.current) {
      connectionRef.current.cleanup();
      connectionRef.current = null;
    }

    // Criar nova conexão
    const conn = createOrJoinResilientConnection(urlRef.current, {
      ...optionsRef.current,
      onOpen: (event) => {
        setReadyState(ConnectionReadyState.OPEN);
        optionsRef.current.onOpen?.(event);
      },
      onMessage: (event) => {
        setLastMessage(event);
        optionsRef.current.onMessage?.(event);
      },
      onError: (event) => {
        optionsRef.current.onError?.(event);
      },
      onClose: (event) => {
        setReadyState(ConnectionReadyState.CLOSED);
        optionsRef.current.onClose?.(event);
      },
    });

    connectionRef.current = conn;
    setReadyState(conn.readyState);
    
    // Detectar se está em modo fallback
    if (conn.connection instanceof EventSource) {
      setIsFallbackMode(true);
    }
  }, []);

  // Desconectar
  const disconnect = useCallback(() => {
    if (connectionRef.current) {
      connectionRef.current.close();
      setReadyState(ConnectionReadyState.CLOSED);
    }
  }, []);

  // Enviar mensagem
  const send = useCallback(
    (data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
      if (connectionRef.current && readyState === ConnectionReadyState.OPEN) {
        connectionRef.current.send(data);
      } else {
        console.warn('[useResilientWebSocket] Cannot send: connection not open');
      }
    },
    [readyState]
  );

  // Conectar automaticamente ao montar
  useEffect(() => {
    if (autoConnect && url) {
      connect();
    }

    // Cleanup ao desmontar
    return () => {
      if (connectionRef.current) {
        if (share) {
          // Em modo compartilhado, apenas fecha mas não limpa
          connectionRef.current.close();
        } else {
          // Em modo não-compartilhado, limpa completamente
          connectionRef.current.cleanup();
        }
        connectionRef.current = null;
      }
    };
  }, [autoConnect, url, share, connect]);

  // Reconectar ao remontar se necessário
  useEffect(() => {
    if (reconnectOnMount && url && readyState === ConnectionReadyState.CLOSED) {
      connect();
    }
  }, [reconnectOnMount, url, readyState, connect]);

  return {
    readyState,
    lastMessage,
    send,
    connect,
    disconnect,
    isConnected: readyState === ConnectionReadyState.OPEN,
    isConnecting: readyState === ConnectionReadyState.CONNECTING,
    isFallbackMode,
  };
}
