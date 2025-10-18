# Migração para WhatsApp Cloud API

## Resumo
Todo o sistema WhatsApp foi migrado do sistema legado (VPS/Evolution) para a **WhatsApp Cloud API oficial da Meta**.

## Mudanças Principais

### 1. Estrutura de Dados
**ANTES (Sistema Legado):**
- Tabelas: `whatsapp_sessions`, `whatsapp_messages`, `whatsapp_contatos`, `whatsapp_rate_limits`
- Usava QR Code para conexão
- Dependia de servidor VPS externo
- Campo `server_url` nas sessões

**DEPOIS (WhatsApp Cloud API):**
- Tabelas: `wa_accounts`, `wa_messages`, `wa_contacts`, `wa_threads`, `wa_rate_limits`
- Usa credenciais (WABA ID, Phone Number ID, Access Token)
- API oficial da Meta via Graph API
- Sem necessidade de servidor externo

### 2. Conexão
**ANTES:**
1. Cliente solicita conexão
2. Servidor gera QR Code
3. Usuário escaneia QR Code
4. Sessão estabelecida

**DEPOIS:**
1. Usuário configura credenciais (Settings)
2. Sistema valida credenciais com Graph API
3. Conexão automática se credenciais válidas
4. Sem QR Code necessário

### 3. Arquivos Atualizados

#### Frontend (React)
- ✅ `src/hooks/useWhatsAppRESTAPI.ts` - Hook principal atualizado para novas tabelas
- ✅ `src/components/whatsapp/WhatsAppNotificationCenter.tsx` - Subscrições atualizadas
- ✅ `src/components/whatsapp/WhatsAppConnectionPanel.tsx` - Removido QR Code
- ✅ `src/components/whatsapp/WhatsAppConnectionCard.tsx` - Interface atualizada
- ✅ `src/components/whatsapp/WhatsAppStatsPanel.tsx` - Removido server_url
- ✅ `src/components/whatsapp/WhatsAppSettings.tsx` - Configuração de credenciais

#### Backend (Edge Functions)
- ✅ `supabase/functions/whatsapp-api/index.ts` - Migrado para Cloud API
- ✅ `supabase/functions/whatsapp-cloud-api/index.ts` - Já usando Cloud API
- ❌ `supabase/functions/whatsapp-manager/index.ts` - **DELETADO** (era sistema legado)

### 4. Interface WhatsAppSession

**ANTES:**
```typescript
interface WhatsAppSession {
  id: string | null;
  session_id?: string;
  status: string;
  qr_code?: string;          // ❌ REMOVIDO
  server_url?: string;       // ❌ REMOVIDO
  last_activity?: string;
  expires_at?: string;
  created_at?: string;
}
```

**DEPOIS:**
```typescript
interface WhatsAppSession {
  id: string | null;
  session_id?: string;
  status: string;
  account_id?: string;        // ✅ NOVO
  phone_number_id?: string;   // ✅ NOVO
  last_activity?: string;
  expires_at?: string;
  created_at?: string;
}
```

### 5. Subscrições Realtime

**ANTES:**
- `whatsapp_sessions` → Mudanças de sessão
- `whatsapp_messages` → Novas mensagens

**DEPOIS:**
- `wa_accounts` → Mudanças na conta (status, credenciais)
- `wa_messages` → Novas mensagens

### 6. Configuração

Para configurar o WhatsApp agora:

1. Acesse **WhatsApp → Settings**
2. Insira as credenciais:
   - **WABA ID**: ID da conta WhatsApp Business
   - **Phone Number ID**: ID do número de telefone
   - **Access Token**: Token de acesso da Meta
3. Clique em "Salvar Configuração"
4. Sistema valida automaticamente via Graph API

### 7. Endpoints da Edge Function

#### `/whatsapp-api/connect` (POST)
- Verifica credenciais em `wa_accounts`
- Testa conexão com Graph API
- Retorna status da conta

#### `/whatsapp-api/disconnect` (POST)
- Desativa conta em `wa_accounts`

#### `/whatsapp-api/status` (GET)
- Retorna status atual da conta

### 8. Tabelas Legadas

As seguintes tabelas ainda existem mas NÃO são mais usadas:
- `whatsapp_sessions_legacy`
- `whatsapp_messages_legacy`
- `whatsapp_contatos_legacy`
- `whatsapp_rate_limits_legacy`
- E outras com sufixo `_legacy`

**IMPORTANTE:** Estas tabelas podem ser deletadas após backup completo.

## Benefícios da Migração

1. ✅ **API Oficial**: Usa a API oficial da Meta
2. ✅ **Sem QR Code**: Conexão via credenciais
3. ✅ **Mais Estável**: Menos dependências externas
4. ✅ **Melhor Segurança**: Tokens criptografados
5. ✅ **Escalável**: Infraestrutura da Meta
6. ✅ **Compliance**: Segue diretrizes oficiais

## Próximos Passos

1. ⚠️ Testar conexão com credenciais reais
2. ⚠️ Validar envio de mensagens
3. ⚠️ Testar webhook de mensagens recebidas
4. ⚠️ Backup e remoção de tabelas legadas
5. ⚠️ Documentar processo para usuários finais

## Documentação Meta

- [WhatsApp Business Platform](https://developers.facebook.com/docs/whatsapp)
- [Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Graph API](https://developers.facebook.com/docs/graph-api)
