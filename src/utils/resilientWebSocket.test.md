# ResilientWebSocket - Documentação e Testes

## Características Implementadas

✅ **Detecção de ambiente/sandbox (iframe)**
- Detecta automaticamente se está em iframe com sandbox restritivo
- Adapta estratégia de conexão baseado no ambiente

✅ **Validação/normalização de URL (ws/wss)**
- Normaliza http: → ws: e https: → wss:
- Valida protocolo e formato da URL
- Lança erro descritivo para URLs inválidas

✅ **Fallback para EventSource quando WS não for possível**
- Tenta WebSocket primeiro
- Cai automaticamente para EventSource se WS falhar
- Mantém mesma API de callbacks

✅ **Reconexão com backoff exponencial e limite**
- Backoff: 1s, 2s, 4s, 8s, 16s, até 30s máx
- Jitter de ±25% para evitar thundering herd
- Limite configurável (default: 10 tentativas)

✅ **Impede múltiplas tentativas paralelas**
- Flag `isReconnecting` previne duplicação
- Cache de conexões compartilhadas por URL

✅ **Limpeza correta de listeners**
- `cleanup()` remove todos os listeners
- Remove conexão do cache global
- Fecha conexão adequadamente

✅ **Logs apenas em dev**
- `devLog()` e `devError()` checam `NODE_ENV`
- Logs incluem: URL, código de erro, reason, tentativas

✅ **Não expõe CORS**
- Tratamento de CORS é responsabilidade do servidor
- Cliente apenas reporta erros

## Uso Básico

### Com Hook React

```typescript
import { useResilientWebSocket } from '@/hooks/useResilientWebSocket';

function MyComponent() {
  const { send, lastMessage, isConnected, isFallbackMode } = useResilientWebSocket(
    'wss://api.example.com/ws',
    {
      maxReconnects: 5,
      initialRetryDelay: 1000,
      maxRetryDelay: 30000,
      onMessage: (event) => {
        console.log('Received:', event.data);
      },
      onError: (event) => {
        console.error('Connection error:', event);
      },
    }
  );

  const handleSend = () => {
    if (isConnected) {
      send(JSON.stringify({ type: 'ping' }));
    }
  };

  return (
    <div>
      <p>Status: {isConnected ? 'Conectado' : 'Desconectado'}</p>
      {isFallbackMode && <p>⚠️ Modo fallback (EventSource)</p>}
      <button onClick={handleSend} disabled={!isConnected}>
        Enviar Mensagem
      </button>
      {lastMessage && <p>Última mensagem: {lastMessage.data}</p>}
    </div>
  );
}
```

### API Direta (sem React)

```typescript
import { createOrJoinResilientConnection } from '@/utils/resilientWebSocket';

const conn = createOrJoinResilientConnection('wss://api.example.com/ws', {
  maxReconnects: 10,
  onMessage: (event) => console.log('Message:', event.data),
  onOpen: () => console.log('Connected!'),
  onClose: () => console.log('Disconnected'),
});

// Enviar mensagem
conn.send(JSON.stringify({ hello: 'world' }));

// Fechar
conn.close();

// Cleanup completo
conn.cleanup();
```

## Configurações Avançadas

### Opções Completas

```typescript
interface ResilientWebSocketOptions {
  /** Protocolos WebSocket (ex: ['v1.chat', 'v2.chat']) */
  protocols?: string | string[];
  
  /** Máximo de tentativas de reconexão (default: 10) */
  maxReconnects?: number;
  
  /** Delay inicial para reconexão em ms (default: 1000) */
  initialRetryDelay?: number;
  
  /** Delay máximo para reconexão em ms (default: 30000) */
  maxRetryDelay?: number;
  
  /** Opções para EventSource fallback */
  eventSourceOptions?: EventSourceInit;
  
  /** Callback quando conexão abre */
  onOpen?: (event: Event) => void;
  
  /** Callback quando mensagem chega */
  onMessage?: (event: MessageEvent | Event) => void;
  
  /** Callback quando ocorre erro */
  onError?: (event: Event) => void;
  
  /** Callback quando conexão fecha */
  onClose?: (event: CloseEvent | Event) => void;
  
  /** Habilitar logs de debug (default: false) */
  debug?: boolean;
}
```

## Cenários de Teste

### 1. Conexão Normal Desktop
```
✓ Primeira chamada cria exatamente 1 conexão WS
✓ Chamadas subsequentes reutilizam conexão existente
✓ Sem tempestade de conexões
```

### 2. Iframe com Sandbox Restritivo
```
✓ Detecta ambiente sandbox
✓ Cai automaticamente para EventSource
✓ Callbacks funcionam normalmente
✓ setReadyState e setLastMessage funcionam
```

### 3. Reconexão Automática
```
✓ Servidor fecha conexão (código 1006)
✓ Cliente tenta reconectar: 1s, 2s, 4s, 8s...
✓ Jitter impede reconexões síncronas
✓ Para após N tentativas (configurável)
```

### 4. Múltiplas Instâncias
```
✓ Componente A e B usam mesma URL
✓ Apenas 1 conexão WebSocket é criada
✓ Ambos recebem mensagens via listeners
✓ Cleanup remove apenas listeners do componente
```

### 5. Limpeza Correta
```
✓ connectionRef.cleanup() remove todos listeners
✓ Fecha conexão com código 1000
✓ Remove do cache sharedConnections
✓ Estado final é CLOSED
```

## Logs em Desenvolvimento

Exemplo de logs que você verá em `NODE_ENV !== 'production'`:

```
[ResilientWS] WebSocket connected: wss://api.example.com/ws
[ResilientWS] WebSocket closed: wss://... code: 1006 reason: 
[ResilientWS] Reconnecting in 1234ms (attempt 1/10)
[ResilientWS] WebSocket connected: wss://api.example.com/ws
[ResilientWS] Falling back to EventSource: https://api.example.com/ws
[ResilientWS] EventSource connected: https://api.example.com/ws
[ResilientWS] Connection cleanup complete: wss://api.example.com/ws
```

## Tratamento de Erros

### Códigos de Close Comuns

- `1000`: Fechamento normal (não reconecta)
- `1001`: Going away (não reconecta)
- `1006`: Conexão anormal (reconecta automaticamente)
- `1008`: Policy violation (reconecta)
- `1011`: Server error (reconecta)

### Estratégia de Fallback

1. Tenta WebSocket (exceto em sandbox)
2. Se falhar, tenta EventSource
3. Se EventSource falhar, tenta reconexão com backoff
4. Após N tentativas, para e loga erro

## Compatibilidade com API Antiga

Esta implementação mantém compatibilidade com a API original:
- Mesma assinatura de callbacks
- Mesmo comportamento de estado
- Cache de conexões compartilhadas
- Não quebra código existente

## Limpeza Global

Para limpar todas as conexões (útil em testes ou ao deslogar):

```typescript
import { cleanupAllConnections } from '@/utils/resilientWebSocket';

// Limpar tudo
cleanupAllConnections();
```

## Boas Práticas

1. **Use `share: true`** (default) para reutilizar conexões
2. **Configure `maxReconnects`** baseado no seu caso de uso
3. **Monitore `isFallbackMode`** para alertar usuário se necessário
4. **Sempre faça cleanup** ao desmontar componentes que não compartilham
5. **Trate erros** com `onError` callback
6. **Valide mensagens** antes de processar `lastMessage`

## Performance

- ✅ 1 conexão por URL (não N conexões)
- ✅ Reconexão inteligente com backoff
- ✅ Listeners eficientes com Map
- ✅ Cleanup automático ao desmontar
- ✅ Jitter previne thundering herd
