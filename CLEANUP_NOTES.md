# Cleanup Notes — Auditoria de Código (Junho 2026)

Limpeza completa executada em 3 fases. Total: **~45 arquivos removidos**, **2 dependências npm**, **~3.500 linhas eliminadas**, zero quebras funcionais.

## ✅ Fase 1 — Remoções diretas (zero risco)
- 12 utils mortos: `appDiagnostics`, `codeAudit`, `deadCodeAnalyzer`, `importGuard`, `variableConflictDetector`, `attributeValidator`, `buildOptimizer`, `dashboardInsights`, `dashboardRecommendations`, `errorDiagnostics`, `supabaseRequestWrapper`, `finalValidation`
- 8 componentes órfãos: `EmergencyModeWrapper`, `LazyChart`, `OptimizedPerformanceWrapper`, `SecurityStatusIndicator`, `LoginModal`, `SecureLoginForm`, `ResilientWebSocketExample`, `dashboard/ModernDashboard`
- 2 páginas sem rota: `Blog.tsx`, `Careers.tsx`
- Artefatos: `App.css`, `_boot-evidence.txt`, `vite.config.ts.timestamp-*.mjs`, `resilientWebSocket.test.md`
- Dependência removida: `axios`

## ✅ Fase 2 — Consolidações
- **ErrorBoundary**: removidos `ErrorBoundary.tsx` e `ui/error-boundary.tsx`. Mantido apenas `AppErrorBoundary`.
- **Toast (Radix → Sonner)**: `src/hooks/use-toast.ts` reescrito como shim sobre Sonner, preservando a API `{ title, description, variant }`. Removidos `ui/toaster.tsx`, `ui/toast.tsx` e dependência `@radix-ui/react-toast`. Os 50 callsites continuam funcionando sem alteração.

## ✅ Fase 3 — Limpeza geral e LGPD
- **LGPD**: removido `test-data/users.csv` (dados de usuários no repositório).
- **Docs obsoletas removidas da raiz**: `ADMIN_QUERIES.sql`, `CACHE_CLEAR_INSTRUCTIONS.md`, `CLIENTS_SECURITY_FIX.md`, `PLANS_INVENTORY.md`, `SECURITY_IMPROVEMENTS.md`, `WEBSOCKET_IMPLEMENTATION.md`. Mantidos: `README.md`, `SECURITY.md`.
- **Assets órfãos**: 8 imagens não referenciadas em `public/lovable-uploads/`.
- **.gitignore**: adicionado `vite.config.ts.timestamp-*.mjs`.

---

## ⚠️ Decisões de alto risco — NÃO executadas (com justificativa)

### 1. Consolidação de `useReportsData` (raiz vs `financial/`)
- **Por que não removido**: O hook raiz `src/hooks/useReportsData.ts` é importado por 11 arquivos (páginas e componentes de Reports/Analytics) e exporta tipos compartilhados (`ReportsMetrics`, `MonthlyData`, `CategoryData`). O hook `src/hooks/financial/useReportsData.ts` (203 linhas) é usado apenas em `components/financial/ReportsTab.tsx`.
- **Risco**: Unificá-los exige refatorar tipos, hooks de consumo e potencialmente queries SQL — alta superfície de regressão.
- **Recomendação futura**: PR dedicado renomeando o hook financeiro (ex.: `useFinancialReportsData`) e consolidando tipos em `src/types/reports.ts`.

### 2. Consolidação de `useAnalyticsData`
- `src/hooks/useAnalyticsData.ts` é usado apenas por `useDashboardAnalytics`, que por sua vez é usado por `InsightsSection`. O hook análogo em `hooks/analytics/useAnalyticsData.ts` tem outra responsabilidade. Mantidos separados até refatoração da camada Analytics.

### 3. Edge Functions `appointment-automation` e `validate-appointment`
- **Por que não removidas**: Sem referências no frontend, mas podem ser invocadas via cron (pg_cron) ou webhook externo. Remoção sem confirmação pode quebrar automação silenciosa.
- **Ação requerida**: Verificar agendamentos em Cloud → Database → Cron Jobs e webhooks externos antes de deletar.

### 4. Migração completa Toast → Sonner nos callsites
- O shim atual mantém a API legada funcionando. Migrar os 50 callsites para `import { toast } from "sonner"` direto eliminaria a camada intermediária mas exige revisão manual em cada arquivo.
- **Status**: Shim é estável e de baixa manutenção; migração total é cosmética.

### 5. `src/components/PerformanceMonitor.tsx` vs `src/components/performance/PerformanceMonitor.tsx`
- Ambos existem. O primeiro está montado em `App.tsx`. Não consolidados nesta passada — verificar se o segundo é dead code em auditoria futura.