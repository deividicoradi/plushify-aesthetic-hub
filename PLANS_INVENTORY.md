# 📋 INVENTÁRIO DE PLANOS - PLUSHIFY

**Última Atualização:** `date +"%Y-%m-%d %H:%M:%S"`  
**Status:** ✅ Auditado e Corrigido

---

## 🎯 Fonte de Verdade

### 1. CATÁLOGO DE PLANOS (Database)

Tabela: `public.plan_catalog`

| Plan Code | Interval | Preço (BRL) | Trial (dias) | Stripe Product ID | Stripe Price ID | Status |
|-----------|----------|-------------|--------------|-------------------|-----------------|--------|
| `trial` | month | R$ 0,00 | 3 | - | - | ✅ Ativo |
| `professional` | month | R$ 89,00 | 0 | TBD | TBD | ✅ Ativo |
| `professional` | year | R$ 890,00 | 0 | TBD | TBD | ✅ Ativo |
| `premium` | month | R$ 179,00 | 0 | TBD | TBD | ✅ Ativo |
| `premium` | year | R$ 1.790,00 | 0 | TBD | TBD | ✅ Ativo |

**Query para verificar:**
```sql
SELECT * FROM public.plan_catalog ORDER BY plan_code, interval;
```

---

## 📊 Mapeamento Stripe ↔ Plushify

### Trial (3 dias)
- **Código Interno:** `trial`
- **Billing Interval:** `month` (padrão)
- **Valor:** R$ 0,00
- **Trial Period:** 3 dias
- **Stripe:** Não usa Stripe (gerenciado internamente)

### Professional Mensal
- **Código Interno:** `professional`
- **Billing Interval:** `month`
- **Valor:** R$ 89,00/mês
- **Stripe Price ID:** `price_professional_monthly` (dinâmico)
- **Stripe Amount:** 8900 (centavos)

### Professional Anual
- **Código Interno:** `professional`
- **Billing Interval:** `year`
- **Valor:** R$ 890,00/ano (R$ 74,17/mês)
- **Economia:** R$ 178,00/ano (-17%)
- **Stripe Price ID:** `price_professional_annual` (dinâmico)
- **Stripe Amount:** 89000 (centavos)

### Premium (Enterprise) Mensal
- **Código Interno:** `premium`
- **Billing Interval:** `month`
- **Valor:** R$ 179,00/mês
- **Stripe Price ID:** `price_premium_monthly` (dinâmico)
- **Stripe Amount:** 17900 (centavos)

### Premium (Enterprise) Anual
- **Código Interno:** `premium`
- **Billing Interval:** `year`
- **Valor:** R$ 1.790,00/ano (R$ 149,17/mês)
- **Economia:** R$ 358,00/ano (-17%)
- **Stripe Price ID:** `price_premium_annual` (dinâmico)
- **Stripe Amount:** 179000 (centavos)

---

## 🔄 Fluxos Implementados

### ✅ 1. Criação de Assinatura (Checkout)

**Edge Function:** `create-checkout`

- ✅ Validação rigorosa de inputs
- ✅ Criação dinâmica de Prices no Stripe
- ✅ Metadata completo (user_id, plan_type, billing_period)
- ✅ Success/Cancel URLs com parâmetros

**Metadata incluído:**
```typescript
{
  user_id: "uuid",
  user_email: "email",
  plan_type: "professional" | "premium",
  billing_period: "monthly" | "annual",
  security_check: "validated",
  created_at: "ISO timestamp"
}
```

### ✅ 2. Webhook do Stripe

**Edge Function:** `stripe-webhook`

**Eventos tratados:**

1. **`checkout.session.completed`**
   - ✅ Extrai metadata (plan_type, billing_period)
   - ✅ Chama `start_subscription()` RPC
   - ✅ Persiste em `user_subscriptions` com billing_interval

2. **`customer.subscription.updated`**
   - ✅ Atualiza plan_type e billing_interval
   - ✅ Atualiza status (active, past_due, canceled)
   - ✅ Registra current_period_end
   - ✅ Suporte a pró-rata automático (via Stripe)

3. **`customer.subscription.deleted`**
   - ✅ Downgrade para trial (3 dias)
   - ✅ Usa `start_subscription()` RPC

4. **`invoice.payment_failed`**
   - ⚠️ Logado (sem ação automática ainda)

### ✅ 3. Verificação de Assinatura

**Edge Function:** `check-subscription`

- ✅ Busca no Stripe por email
- ✅ Extrai metadata quando disponível
- ✅ Fallback para detecção por preço
- ✅ Cria trial se não encontrar customer
- ✅ Cache de 5 minutos

### ✅ 4. Trial de 3 Dias

**Implementação:**

- ✅ Criado automaticamente em primeiro acesso
- ✅ `trial_ends_at` = now() + 3 days
- ✅ `status` = 'trial_active' ou 'active'
- ✅ `plan_type` = 'trial'
- ✅ Job de expiração via `expire_trial_subscriptions()`

**Expiração:**

```sql
-- Executar diariamente via cron
SELECT * FROM public.expire_trial_subscriptions();
```

**Status após expiração:**
- `status` muda de `active`/`trial_active` → `expired`
- Usuário bloqueado até upgrade

### ✅ 5. Upgrades/Downgrades

**Entre Planos (Professional ↔ Premium):**
- ✅ Webhook `customer.subscription.updated` detecta mudança
- ✅ Atualiza `plan_type` e `billing_interval`
- ✅ Pró-rata gerenciado pelo Stripe
- ✅ `current_period_end` atualizado

**Entre Periodicidades (Mensal ↔ Anual):**
- ✅ Detectado via `billing_period` no metadata
- ✅ Atualiza `billing_interval` (month/year)
- ✅ Pró-rata gerenciado pelo Stripe

---

## 🗄️ Estrutura do Banco

### Tabela: `user_subscriptions`

**Campos críticos (NOT NULL):**
- ✅ `user_id` - UUID do usuário
- ✅ `plan_type` - enum: 'trial' | 'professional' | 'premium'
- ✅ `status` - enum: 'active' | 'trial_active' | 'past_due' | 'canceled' | 'expired' | 'inactive'
- ✅ `started_at` - Timestamp de início

**Campos opcionais:**
- `billing_interval` - 'month' | 'year' (NULL para trial legacy)
- `trial_ends_at` - Timestamp de expiração (NULL para não-trial)
- `expires_at` - Timestamp de expiração geral (para compatibilidade)
- `current_period_end` - Timestamp do fim do período atual (Stripe)
- `stripe_subscription_id` - ID da subscription no Stripe
- `stripe_customer_id` - ID do customer no Stripe
- `cancel_at_period_end` - Boolean para cancelamento agendado

**Constraints:**
- ✅ `plan_type IN ('trial', 'professional', 'premium')`
- ✅ `billing_interval IN ('month', 'year') OR NULL`
- ✅ `status IN ('active', 'trial_active', 'past_due', 'canceled', 'expired', 'inactive')`

**Índices:**
- ✅ `uniq_active_sub_by_user` - Garante 1 assinatura ativa por usuário
- ✅ `idx_trial_expiring` - Otimiza query de trials expirando
- ✅ `idx_stripe_subscription` - Busca rápida por Stripe ID

---

## 🔐 Funções RPC (SECURITY DEFINER)

### 1. `start_subscription()`

**Uso:** Criar ou atualizar assinatura (via service_role)

**Parâmetros:**
```sql
start_subscription(
  p_user_id uuid,
  p_plan_code text,                    -- 'trial' | 'professional' | 'premium'
  p_billing_interval text DEFAULT 'month', -- 'month' | 'year'
  p_trial_days integer DEFAULT 0,      -- 3 para trial, 0 para pagos
  p_stripe_subscription_id text DEFAULT NULL,
  p_stripe_customer_id text DEFAULT NULL,
  p_current_period_end timestamp DEFAULT NULL
)
RETURNS uuid
```

**Comportamento:**
- ✅ Valida inputs
- ✅ Cancela assinaturas ativas anteriores do mesmo usuário
- ✅ Cria/atualiza assinatura única
- ✅ Calcula `trial_ends_at` automaticamente
- ✅ Define `status` correto ('active' ou 'trial_active')

**Exemplo:**
```sql
-- Criar trial de 3 dias
SELECT start_subscription(
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  'trial',
  'month',
  3
);

-- Criar assinatura paga
SELECT start_subscription(
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  'professional',
  'year',
  0,
  'sub_123456',
  'cus_123456',
  '2024-12-31T23:59:59Z'
);
```

### 2. `expire_trial_subscriptions()`

**Uso:** Expirar trials vencidos (executar diariamente)

**Retorno:** `TABLE(expired_count integer)`

**Comportamento:**
- ✅ Atualiza `status` → 'expired' onde `trial_ends_at` <= now()
- ✅ Retorna contagem de trials expirados

**Exemplo:**
```sql
SELECT * FROM expire_trial_subscriptions();
-- Resultado: { expired_count: 5 }
```

---

## 📈 Relatórios e Monitoramento

### Consultas Administrativas

Todas as queries estão em: **`ADMIN_QUERIES.sql`**

**Principais:**

1. ✅ Assinaturas ativas por plano e intervalo
2. ✅ Trials expirando nos próximos 5 dias
3. ✅ Trials já expirados (alerta)
4. ✅ Usuários sem assinatura
5. ✅ Múltiplas assinaturas ativas (inconsistência)
6. ✅ Assinaturas com dados incompletos
7. ✅ Catálogo de planos
8. ✅ Overview por status
9. ✅ MRR estimado
10. ✅ Upgrades/downgrades (últimos 30 dias)

**Executar relatório de backfill:**
```sql
SELECT * FROM report_subscription_backfill();
```

---

## ✅ Critérios de Aceitação (STATUS)

| Critério | Status | Observação |
|----------|--------|------------|
| Catálogo completo (mensal/anual) | ✅ | Tabela `plan_catalog` criada |
| Persistência em `user_subscriptions` | ✅ | Via RPC `start_subscription()` |
| Trial de 3 dias | ✅ | `trial_ends_at` calculado automaticamente |
| Expiração automática de trials | ✅ | Função `expire_trial_subscriptions()` |
| Upgrade/downgrade entre planos | ✅ | Webhook `subscription.updated` |
| Troca entre periodicidades | ✅ | Via `billing_interval` |
| Campos críticos NOT NULL | ✅ | Migrations aplicadas |
| 1 assinatura ativa por usuário | ✅ | Índice único `uniq_active_sub_by_user` |
| Metadata completo no Stripe | ✅ | `user_id`, `plan_type`, `billing_period` |
| Backfill de dados legados | ✅ | Executado na migração |

---

## 🚨 Ações Pendentes

### Stripe Product/Price IDs

⚠️ **IMPORTANTE:** Atualmente usando criação dinâmica de Prices.

**Próximos passos:**

1. Criar Products fixos no Stripe Dashboard:
   - `prod_professional` - "Plushify Professional"
   - `prod_premium` - "Plushify Enterprise"

2. Criar Prices fixos para cada Product:
   - Professional Monthly: `price_XXX` (R$ 89,00/mês)
   - Professional Annual: `price_YYY` (R$ 890,00/ano)
   - Premium Monthly: `price_ZZZ` (R$ 179,00/mês)
   - Premium Annual: `price_AAA` (R$ 1.790,00/ano)

3. Atualizar `plan_catalog`:
```sql
UPDATE plan_catalog 
SET stripe_price_id = 'price_XXX' 
WHERE plan_code = 'professional' AND interval = 'month';
-- Repetir para todos
```

4. Atualizar `create-checkout` para usar Price IDs fixos

### Cron Job de Expiração

⚠️ **CONFIGURAR:** Job diário no Supabase

```sql
select cron.schedule(
  'expire-trial-subscriptions',
  '0 0 * * *',  -- Todo dia à meia-noite
  $$
  select expire_trial_subscriptions();
  $$
);
```

---

## 🔍 Verificação Pós-Deploy

### Checklist

- [ ] Executar `SELECT * FROM report_subscription_backfill()`
- [ ] Verificar "Multiple active subs" = 0
- [ ] Verificar trials com `trial_ends_at` preenchido
- [ ] Testar criação de checkout (mensal e anual)
- [ ] Testar webhook com Stripe CLI
- [ ] Simular expiração de trial
- [ ] Testar upgrade Professional → Premium
- [ ] Testar troca Mensal → Anual

---

## 📞 Suporte

**Documentação:**
- Consultas: `ADMIN_QUERIES.sql`
- Schema: `supabase/migrations/...`

**Logs:**
- Edge Functions: Supabase Dashboard → Functions → Logs
- Webhook: Stripe Dashboard → Developers → Webhooks

**Contato:**
- Supabase Support: https://supabase.com/support
- Stripe Support: https://support.stripe.com
