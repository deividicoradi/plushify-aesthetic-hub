/**
 * Exemplo de uso do ResilientWebSocket
 * 
 * Este componente demonstra como usar o hook useResilientWebSocket
 * para gerenciar conexões WebSocket de forma resiliente
 */

import { useState } from 'react';
import { useResilientWebSocket } from '@/hooks/useResilientWebSocket';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wifi, 
  WifiOff, 
  Loader2, 
  Send, 
  AlertTriangle 
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  direction: 'sent' | 'received';
}

export function ResilientWebSocketExample() {
  const [wsUrl, setWsUrl] = useState('wss://echo.websocket.org');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');

  const {
    send,
    lastMessage,
    isConnected,
    isConnecting,
    isFallbackMode,
    connect,
    disconnect,
    readyState,
  } = useResilientWebSocket(wsUrl, {
    maxReconnects: 5,
    initialRetryDelay: 1000,
    maxRetryDelay: 30000,
    onMessage: (event) => {
      // Processar mensagem recebida
      if ('data' in event) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            text: event.data,
            timestamp: new Date(),
            direction: 'received',
          },
        ]);
      }
    },
    onOpen: () => {
      console.log('✅ WebSocket conectado!');
    },
    onError: (event) => {
      console.error('❌ Erro na conexão:', event);
    },
    onClose: (event) => {
      console.log('🔌 WebSocket fechado');
    },
  });

  const handleSend = () => {
    if (inputMessage.trim() && isConnected) {
      const message = {
        id: crypto.randomUUID(),
        text: inputMessage,
        timestamp: new Date(),
        direction: 'sent' as const,
      };

      setMessages((prev) => [...prev, message]);
      send(inputMessage);
      setInputMessage('');
    }
  };

  const getStatusBadge = () => {
    if (isConnecting) {
      return (
        <Badge variant="outline" className="gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Conectando...
        </Badge>
      );
    }

    if (isConnected) {
      return (
        <Badge variant="default" className="gap-1 bg-success">
          <Wifi className="h-3 w-3" />
          Conectado
        </Badge>
      );
    }

    return (
      <Badge variant="destructive" className="gap-1">
        <WifiOff className="h-3 w-3" />
        Desconectado
      </Badge>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>WebSocket Resiliente</CardTitle>
            <CardDescription>
              Exemplo de conexão WebSocket com reconexão automática
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Alertas de Status */}
        {isFallbackMode && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Modo fallback ativo - usando EventSource em vez de WebSocket
            </AlertDescription>
          </Alert>
        )}

        {/* Configuração da URL */}
        <div className="flex gap-2">
          <Input
            value={wsUrl}
            onChange={(e) => setWsUrl(e.target.value)}
            placeholder="wss://echo.websocket.org"
            disabled={isConnected || isConnecting}
          />
          {!isConnected ? (
            <Button onClick={connect} disabled={isConnecting}>
              {isConnecting ? 'Conectando...' : 'Conectar'}
            </Button>
          ) : (
            <Button onClick={disconnect} variant="destructive">
              Desconectar
            </Button>
          )}
        </div>

        {/* Área de Mensagens */}
        <div className="border rounded-lg p-4 h-64 overflow-y-auto space-y-2 bg-muted/20">
          {messages.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm">
              Nenhuma mensagem ainda
            </p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.direction === 'sent' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`rounded-lg px-3 py-2 max-w-[80%] ${
                    msg.direction === 'sent'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input de Mensagem */}
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Digite uma mensagem..."
            disabled={!isConnected}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            onClick={handleSend}
            disabled={!isConnected || !inputMessage.trim()}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Informações de Debug */}
        <div className="text-xs text-muted-foreground space-y-1 border-t pt-4">
          <p>
            <strong>Ready State:</strong> {readyState}
          </p>
          <p>
            <strong>Modo Fallback:</strong> {isFallbackMode ? 'Sim' : 'Não'}
          </p>
          <p>
            <strong>Última mensagem:</strong>{' '}
            {lastMessage ? new Date().toLocaleTimeString() : 'Nenhuma'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
