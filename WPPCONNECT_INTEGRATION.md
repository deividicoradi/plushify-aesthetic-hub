# Integração WhatsApp via WPPConnect

## Visão Geral

O Plushify está integrado com um servidor WPPConnect hospedado em VPS (porta 21465) para gerenciar sessões WhatsApp de cada usuário de forma isolada e segura.

## Arquitetura

### Fluxo de Conexão

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Cliente   │─────>│  Edge Functions  │─────>│  WPPConnect VPS │
│  (Browser)  │      │   (Supabase)     │      │   (porta 21465) │
└─────────────┘      └──────────────────┘      └─────────────────┘
       │                      │                         │
       │                      ▼                         │
       │              ┌──────────────┐                  │
       │              │  PostgreSQL  │                  │
       │              │ (Sessions DB)│                  │
       │              └──────────────┘                  │
       │                      │                         │
       └──────────<───────────┴─────────────<───────────┘
                         (Webhook QR)
```

### Componentes

#### 1. Edge Functions (Backend Seguro)

**`sessao-de-whatsapp`** - Inicia/Cria sessão
- **Método:** POST
- **Auth:** JWT obrigatório
- **Função:** Cria sessão nomeada como `user_<uuid>` no WPPConnect
- **Resposta:** Status da sessão + QR Code (se necessário)

**`whatsapp-qr-webhook`** - Recebe QR Code e status
- **Método:** POST
- **Auth:** Header `x-verify` com token secreto
- **Função:** Atualiza banco com QR Code e status da sessão
- **Segurança:** Valida token antes de processar

**`enviar-mensagem-whatsapp`** - Envia mensagem
- **Método:** POST
- **Auth:** JWT obrigatório
- **Body:** `{ phone, message, contactName? }`
- **Função:** Envia mensagem via WPPConnect usando a sessão do usuário

#### 2. Banco de Dados

**Tabela `whatsapp_sessions`**
```sql
- id (uuid)
- user_id (uuid) - FK para auth.users
- session_id (text) - Nome da sessão no WPP (user_<uuid>)
- status (text) - 'desconectado' | 'pareando' | 'conectado'
- qr_code (text) - Base64 do QR Code
- server_url (text) - URL do servidor WPP
- last_activity (timestamp)
- created_at, updated_at (timestamps)
```

**RLS (Row Level Security):**
- Usuários acessam apenas suas próprias sessões
- Policy: `auth.uid() = user_id`

#### 3. Frontend

**Componentes Principais:**

- `WPPConnectQRDisplay` - Exibe QR Code durante pareamento
- `WhatsAppConnectionCard` - Gerencia conexão e envio
- `useWhatsAppRESTAPI` - Hook para comunicação com Edge Functions

**Client (`wppConnectClient.ts`):**
- Abstração das chamadas às Edge Functions
- Tratamento de erros específicos do WhatsApp
- Type-safe com TypeScript

## Configuração de Secrets

Os seguintes secrets devem estar configurados no Supabase:

```bash
WPP_SERVER_URL=http://sua-vps:21465
WPP_SERVER_TOKEN=seu-token-bearer-aqui
QR_WEBHOOK_VERIFY_TOKEN=token-secreto-webhook
```

⚠️ **CRÍTICO:** Esses valores NUNCA devem aparecer no frontend ou código cliente.

## Fluxo de Uso

### 1. Conectar WhatsApp

```typescript
// Frontend
const { connectWhatsApp } = useWhatsAppRESTAPI();
await connectWhatsApp();

// Edge Function faz:
POST http://vps:21465/api/user_<uuid>/start-session
```

### 2. Webhook Recebe QR

```typescript
// WPPConnect envia:
POST https://supabase.co/functions/v1/whatsapp-qr-webhook
Headers: { x-verify: "token-secreto" }
Body: { session: "user_<uuid>", qrcode: "data:image/...", status: "QRCODE" }

// Webhook atualiza DB:
UPDATE whatsapp_sessions 
SET qr_code = '<base64>', status = 'pareando'
WHERE user_id = '<uuid>'
```

### 3. Frontend Exibe QR

```typescript
// Realtime subscription detecta mudança
useEffect(() => {
  supabase
    .channel(`whatsapp_sessions_${user.id}`)
    .on('postgres_changes', { event: 'UPDATE', ... }, (payload) => {
      // Atualiza estado com QR Code
      setSession({ ...payload.new });
    })
    .subscribe();
}, []);
```

### 4. Usuário Escaneia QR

- WhatsApp lê QR Code
- WPPConnect detecta conexão
- Webhook recebe: `{ status: "CONNECTED" }`
- DB atualizado: `status = 'conectado'`
- Frontend exibe "Conectado!"

### 5. Enviar Mensagem

```typescript
// Frontend
await sendMessage('+5511999999999', 'Olá!', 'João');

// Edge Function faz:
POST http://vps:21465/api/user_<uuid>/send-text
Body: { phone: "5511999999999", message: "Olá!" }
```

## Segurança

### Camadas de Proteção

1. **Autenticação JWT:** Todas as Edge Functions exigem usuário logado
2. **Webhook Validation:** Header `x-verify` valida origem do webhook
3. **RLS no Banco:** Isolamento total entre usuários
4. **Secrets no Vault:** Credenciais nunca expostas ao frontend
5. **Rate Limiting:** Proteção contra abuso (implementar se necessário)

### Boas Práticas

- ✅ Tokens APENAS em Edge Functions
- ✅ Comunicação cliente → Edge Function → VPS
- ✅ Validação de entrada em todas as funções
- ✅ Logs de segurança (tentativas de acesso indevido)
- ❌ NUNCA expor `WPP_SERVER_URL` ou `WPP_SERVER_TOKEN` no frontend

## Troubleshooting

### QR Code não aparece

1. Verificar se `sessao-de-whatsapp` foi chamada
2. Checar logs da Edge Function
3. Verificar se webhook está configurado no WPPConnect
4. Confirmar que `QR_WEBHOOK_VERIFY_TOKEN` está correto

### Mensagem não envia

1. Verificar status da sessão (deve estar 'conectado')
2. Checar formato do telefone (incluir DDI: 5511999999999)
3. Ver logs da Edge Function `enviar-mensagem-whatsapp`
4. Confirmar que WhatsApp no celular está online

### Sessão desconecta

1. WhatsApp pode desconectar após inatividade
2. Verificar se o celular está online
3. Reconectar através do botão no painel

## Manutenção

### Persistência de Sessões

O WPPConnect mantém sessões em `/root/sessions` na VPS. Se o servidor reiniciar, as sessões são restauradas automaticamente.

### Limpeza de Dados

Implementar rotina para limpar:
- QR Codes expirados (> 24h)
- Sessões inativas (> 7 dias desconectadas)

```sql
-- Exemplo de limpeza
DELETE FROM whatsapp_sessions 
WHERE status = 'desconectado' 
  AND updated_at < NOW() - INTERVAL '7 days';
```

## Escalabilidade

### Multi-Tenant

Cada usuário tem sua própria sessão isolada:
- Nome da sessão: `user_<uuid>`
- Dados separados por `user_id` no banco
- RLS garante isolamento total

### Performance

- Realtime Subscriptions para atualizações instantâneas
- Debouncing de stats (2 segundos)
- Polling apenas quando necessário (status 'pareando')

## Próximos Passos

- [ ] Implementar recebimento de mensagens (webhook de entrada)
- [ ] Adicionar suporte a mídia (imagens, vídeos)
- [ ] Templates de mensagem
- [ ] Agendamento de mensagens
- [ ] Relatórios e métricas avançadas
