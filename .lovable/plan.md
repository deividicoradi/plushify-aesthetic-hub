# Plano: Integração WhatsApp Multi-Tenant com OpenWA

## Contexto
O projeto já possui as secrets `OPENWA_BASE_URL` e `OPENWA_API_KEY` e a Edge Function `whatsapp-proxy` publicada. Vamos estruturar uma integração multi-tenant segura, onde cada estabelecimento gerencia sua própria sessão do WhatsApp e os dados são isolados no banco.

## Decisões padrão adotadas
- Biblioteca: **OpenWA** (já configurado via secrets/proxy).
- Hospedagem: **VPS self-hosted** (não usar WhatsApp Cloud API).
- Comunicação cliente ↔ backend: sempre via **Edge Function `whatsapp-proxy`** com validação JWT.
- Sessões: nomeadas `plushify-{user_id}`.
- Acesso: restrito a usuários com plano **premium**.
- Funcionalidade: envio outbound + recebimento inbound (webhook de mensagens e status).

## Etapas

### 1. Schema do banco (multi-tenant)
Criar migrations para:
- `whatsapp_sessions`: uma linha por usuário/tenant (`user_id` FK para `auth.users`), status (`pending`, `connected`, `disconnected`), `session_name`, `connected_at`, `disconnected_at`, `qr_code` (texto temporário).
- `whatsapp_messages`: histórico de mensagens enviadas/recebidas, com `user_id`, `session_id`, `direction` (`in`/`out`), `phone`, `content`, `status`, `external_message_id`, `sent_at`.
- `whatsapp_contacts`: catálogo de contatos sincronizados por tenant (`user_id`, `phone`, `name`, `client_id` opcional FK).
- Habilitar RLS em todas as tabelas.
- Políticas: usuário autenticado vê apenas registros onde `user_id = auth.uid()`.
- Adicionar GRANTs padrão para `authenticated` e `service_role`.

### 2. Edge Function `whatsapp-proxy`
Refatorar/expandir `supabase/functions/whatsapp-proxy/index.ts`:
- Validar JWT do usuário (`auth.getUser`).
- Verificar acesso premium via `has_feature_access` ou tabela `user_subscriptions`.
- Rotas internas:
  - `POST /start-session`: solicita QR code para `plushify-{user_id}`.
  - `GET /session-status`: retorna status da sessão.
  - `POST /send-message`: envia mensagem para um número.
  - `POST /disconnect`: encerra a sessão.
  - `POST /webhook`: recebe eventos do OpenWA (mensagem recebida, status, QR code) e persiste no banco usando service role.
- Esconder credenciais do VPS: nenhum secret exposto no frontend; a Edge Function adiciona `OPENWA_API_KEY` no header.
- CORS e validação de entrada (Zod).

### 3. Frontend
Criar telas/componentes:
- `src/pages/WhatsAppConfig.tsx`: tela dentro do layout interno (`/app/whatsapp`) com:
  - Botão para conectar sessão (solicita QR code).
  - Exibição do QR code para scan.
  - Status da conexão.
  - Botão de desconectar.
- `src/components/whatsapp/WhatsAppStatusBadge.tsx`: indicador de status na sidebar/navbar.
- Hook `src/hooks/useWhatsAppSession.ts`: gerencia sessão, polling de status e QR code.
- Hook `src/hooks/useWhatsAppSend.ts`: envia mensagens via proxy.
- Integrar envio de mensagens nos fluxos existentes (lembrete de agendamento, lembrete de retorno, cobrança) usando o proxy quando o tenant tem WhatsApp conectado; fallback para `wa.me` quando não tem.

### 4. Webhook do OpenWA
- Configurar no VPS o webhook apontando para `https://<project-ref>.supabase.co/functions/v1/whatsapp-proxy/webhook`.
- Tratar eventos:
  - `qr`: salvar QR code na sessão.
  - `authenticated`/`ready`: marcar sessão como conectada.
  - `disconnected`: marcar como desconectada.
  - `message`: salvar mensagem recebida em `whatsapp_messages`.
  - `message_status`: atualizar status de entrega/leitura.

### 5. Segurança e isolamento
- RLS garante que um tenant nunca veja mensagens/sessões de outro.
- A Edge Function valida JWT e plano antes de tocar no VPS.
- A chave `OPENWA_API_KEY` nunca sai do backend.
- Adicionar rate limit na Edge Function para evitar spam.

### 6. Testes e publicação
- Rodar `supabase--linter` para validar RLS/grants.
- Testar fluxo de conexão e envio via Edge Function.
- Deploy da `whatsapp-proxy` e das migrations.
- Publicar frontend.

## Resultado esperado
- Tela `/app/whatsapp` para conectar/desconectar o WhatsApp do estabelecimento.
- Indicador de status no layout interno.
- Envio de mensagens via proxy para quem tem sessão ativa.
- Recebimento de mensagens e histórico salvo no banco, isolado por tenant.
- Acesso limitado a usuários premium.
