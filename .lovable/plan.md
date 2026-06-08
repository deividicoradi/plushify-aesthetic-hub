# Plano: Migrar schema para o novo Cloud e remover WhatsApp

## Contexto
O novo Lovable Cloud está vazio. Existem 134 migrations históricas em `supabase/migrations/` que reproduzem o schema antigo (80 delas mexem em WhatsApp). Vou recriar o schema no novo Cloud sem nada de WhatsApp, e apagar todo código de WhatsApp do projeto.

## Etapas

### 1. Remover código de WhatsApp
Apagar:
- `src/pages/WhatsApp.tsx`, `src/pages/WhatsAppDashboard.tsx`
- `src/components/whatsapp/` (pasta inteira)
- `src/hooks/useWhatsApp.ts`, `useWhatsAppPolling.ts`, `useWhatsAppRESTAPI.ts`
- `src/integrations/whatsClient.ts`, `src/integrations/whatsapp/`
- `src/api/whatsapp.ts`
- `src/components/navbar/WhatsAppStatusIndicator.tsx`
- `supabase/functions/whatsapp-*`, `sessao-de-whatsapp`, `enviar-mensagem-whatsapp`, `whatsapp-cloud-api`, `whatsapp-disconnect`, `whatsapp-status`, `whatsapp-api`, `whatsapp-qr-webhook`, `whatsapp-webhook`
- `docs/whatsapp-server/`, `docs/guia-whatsapp-completo.md`, `WHATSAPP_*.md`, `SECURITY_FIX_WHATSAPP_CONTATOS.md`, `scripts/setup-whatsapp-vps.sh`, `scripts/deploy-whatsapp.sh`
- Rotas/links de WhatsApp em `App.tsx`, `Navbar`, `DashboardSidebar`, etc.
- Blocos `[functions.whatsapp-*]` / `sessao-de-whatsapp` / `enviar-mensagem-whatsapp` no `supabase/config.toml`
- Chamar `delete_edge_functions` para remover as functions do Cloud

### 2. Recriar schema no novo Cloud
- Concatenar as 134 migrations em ordem, filtrando todo bloco que cria/altera tabelas, funções, triggers, políticas, tipos ou índices ligados a WhatsApp (`whatsapp_*`, `wpp_*`, contatos_whatsapp, etc.)
- Rodar como uma única migration nova via `supabase--migration`
- Após aprovação, o `types.ts` é regenerado com todas as tabelas; os erros TypeScript do `src/api/*` desaparecem

### 3. Limpar pontas soltas
- Remover `src/utils/whatsappCircuitBreaker.ts`
- Remover imports/usos órfãos pós-remoção (corrigir os arquivos que quebrarem com a deleção)
- Rodar `supabase--linter` para confirmar RLS/grants ok
- Atualizar `.env.example` se necessário

## Riscos
- Replay de 134 migrations pode falhar em uma ou outra linha (ex.: `ALTER TYPE` já existente, `DROP` de coisa que não existe). Vou tratar com `IF EXISTS` / `IF NOT EXISTS` ou comentar a linha problemática. Se uma migration estiver irrecuperável, peço sua orientação antes de seguir.
- Dados antigos não migram — só o schema. O novo Cloud começa sem registros.
- Secrets antigos (`STRIPE_*`, etc.) precisarão ser reconfigurados no novo Cloud quando você quiser usar Stripe/etc.

## Resultado esperado
- Build TS verde
- Todas as telas (Dashboard, Financeiro, Agendamentos, Clientes, etc.) usando o novo Cloud
- Zero código/tabelas/edge functions de WhatsApp no projeto
- Pronto para você reintegrar WhatsApp do zero depois
