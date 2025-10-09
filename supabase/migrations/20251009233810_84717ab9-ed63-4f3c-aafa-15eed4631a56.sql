-- =====================================================
-- PLUSHIFY: AUDITORIA E CORREÇÃO COMPLETA DE PLANOS
-- =====================================================

-- 1. AJUSTAR TABELA user_subscriptions COM TODAS AS COLUNAS NECESSÁRIAS
-- =====================================================

-- Adicionar coluna billing_interval se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_subscriptions' AND column_name = 'billing_interval'
  ) THEN
    ALTER TABLE public.user_subscriptions ADD COLUMN billing_interval text CHECK (billing_interval IN ('month', 'year'));
  END IF;
END $$;

-- Adicionar coluna stripe_subscription_id se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_subscriptions' AND column_name = 'stripe_subscription_id'
  ) THEN
    ALTER TABLE public.user_subscriptions ADD COLUMN stripe_subscription_id text;
  END IF;
END $$;

-- Adicionar coluna stripe_customer_id se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_subscriptions' AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE public.user_subscriptions ADD COLUMN stripe_customer_id text;
  END IF;
END $$;

-- Adicionar coluna current_period_end se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_subscriptions' AND column_name = 'current_period_end'
  ) THEN
    ALTER TABLE public.user_subscriptions ADD COLUMN current_period_end timestamp with time zone;
  END IF;
END $$;

-- Adicionar coluna cancel_at_period_end se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_subscriptions' AND column_name = 'cancel_at_period_end'
  ) THEN
    ALTER TABLE public.user_subscriptions ADD COLUMN cancel_at_period_end boolean DEFAULT false;
  END IF;
END $$;

-- 2. CRIAR CONSTRAINTS E ÍNDICES
-- =====================================================

-- Adicionar constraints de validação
DO $$ 
BEGIN
  -- Check para plan_type
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_subscriptions_plan_type_check'
  ) THEN
    ALTER TABLE public.user_subscriptions 
    ADD CONSTRAINT user_subscriptions_plan_type_check 
    CHECK (plan_type IN ('trial', 'professional', 'premium'));
  END IF;

  -- Check para billing_interval
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_subscriptions_billing_interval_check'
  ) THEN
    ALTER TABLE public.user_subscriptions 
    ADD CONSTRAINT user_subscriptions_billing_interval_check 
    CHECK (billing_interval IN ('month', 'year') OR billing_interval IS NULL);
  END IF;

  -- Check para status
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_subscriptions_status_check'
  ) THEN
    ALTER TABLE public.user_subscriptions 
    ADD CONSTRAINT user_subscriptions_status_check 
    CHECK (status IN ('active', 'trial_active', 'past_due', 'canceled', 'expired', 'inactive'));
  END IF;
END $$;

-- Garantir que campos críticos não sejam NULL
ALTER TABLE public.user_subscriptions ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.user_subscriptions ALTER COLUMN plan_type SET NOT NULL;
ALTER TABLE public.user_subscriptions ALTER COLUMN status SET NOT NULL;
ALTER TABLE public.user_subscriptions ALTER COLUMN started_at SET NOT NULL;

-- Criar índice único para 1 assinatura ativa por usuário
DROP INDEX IF EXISTS uniq_active_sub_by_user;
CREATE UNIQUE INDEX uniq_active_sub_by_user 
ON public.user_subscriptions(user_id) 
WHERE status IN ('active', 'trial_active');

-- Criar índice para trials expirando
CREATE INDEX IF NOT EXISTS idx_trial_expiring 
ON public.user_subscriptions(trial_ends_at, status) 
WHERE trial_ends_at IS NOT NULL;

-- Criar índice para Stripe subscription_id
CREATE INDEX IF NOT EXISTS idx_stripe_subscription 
ON public.user_subscriptions(stripe_subscription_id) 
WHERE stripe_subscription_id IS NOT NULL;

-- 3. CRIAR FUNÇÃO start_subscription (RPC)
-- =====================================================

CREATE OR REPLACE FUNCTION public.start_subscription(
  p_user_id uuid,
  p_plan_code text,
  p_billing_interval text DEFAULT 'month',
  p_trial_days integer DEFAULT 0,
  p_stripe_subscription_id text DEFAULT NULL,
  p_stripe_customer_id text DEFAULT NULL,
  p_current_period_end timestamp with time zone DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_subscription_id uuid;
  v_trial_end timestamp with time zone;
  v_status text;
BEGIN
  -- Validar inputs
  IF p_plan_code NOT IN ('trial', 'professional', 'premium') THEN
    RAISE EXCEPTION 'Invalid plan_code: %', p_plan_code;
  END IF;
  
  IF p_billing_interval NOT IN ('month', 'year') THEN
    RAISE EXCEPTION 'Invalid billing_interval: %', p_billing_interval;
  END IF;
  
  -- Calcular trial_ends_at
  IF p_trial_days > 0 THEN
    v_trial_end := now() + (p_trial_days || ' days')::interval;
    v_status := 'trial_active';
  ELSE
    v_trial_end := NULL;
    v_status := 'active';
  END IF;
  
  -- Cancelar/expirar assinaturas anteriores do mesmo usuário
  UPDATE public.user_subscriptions
  SET status = 'canceled',
      cancel_at_period_end = true,
      updated_at = now()
  WHERE user_id = p_user_id 
    AND status IN ('active', 'trial_active')
    AND id != COALESCE(v_subscription_id, '00000000-0000-0000-0000-000000000000'::uuid);
  
  -- Inserir ou atualizar assinatura
  INSERT INTO public.user_subscriptions (
    user_id,
    plan_type,
    billing_interval,
    status,
    started_at,
    trial_ends_at,
    stripe_subscription_id,
    stripe_customer_id,
    current_period_end,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_plan_code::plan_type,
    p_billing_interval,
    v_status,
    now(),
    v_trial_end,
    p_stripe_subscription_id,
    p_stripe_customer_id,
    p_current_period_end,
    now(),
    now()
  )
  ON CONFLICT (user_id) 
  WHERE status IN ('active', 'trial_active')
  DO UPDATE SET
    plan_type = EXCLUDED.plan_type,
    billing_interval = EXCLUDED.billing_interval,
    status = EXCLUDED.status,
    trial_ends_at = EXCLUDED.trial_ends_at,
    stripe_subscription_id = EXCLUDED.stripe_subscription_id,
    stripe_customer_id = EXCLUDED.stripe_customer_id,
    current_period_end = EXCLUDED.current_period_end,
    updated_at = now()
  RETURNING id INTO v_subscription_id;
  
  -- Log da ação
  RAISE NOTICE 'Subscription created/updated for user % with plan % (%)', p_user_id, p_plan_code, p_billing_interval;
  
  RETURN v_subscription_id;
END;
$$;

-- Comentário para documentação
COMMENT ON FUNCTION public.start_subscription IS 'Cria ou atualiza assinatura de usuário. Cancela assinaturas ativas anteriores. Usa service_role para bypass de RLS.';

-- 4. CRIAR FUNÇÃO DE EXPIRAÇÃO DE TRIALS (CRON)
-- =====================================================

CREATE OR REPLACE FUNCTION public.expire_trial_subscriptions()
RETURNS TABLE(expired_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_expired_count integer := 0;
BEGIN
  -- Expirar trials vencidos
  UPDATE public.user_subscriptions
  SET status = 'expired',
      updated_at = now()
  WHERE status IN ('active', 'trial_active', 'trial')
    AND trial_ends_at IS NOT NULL
    AND trial_ends_at <= now();
  
  GET DIAGNOSTICS v_expired_count = ROW_COUNT;
  
  -- Log da execução
  RAISE NOTICE 'Trial expiration job: % subscriptions expired', v_expired_count;
  
  RETURN QUERY SELECT v_expired_count;
END;
$$;

COMMENT ON FUNCTION public.expire_trial_subscriptions IS 'Expira assinaturas trial vencidas. Executar diariamente via cron.';

-- 5. BACKFILL DE DADOS LEGADOS
-- =====================================================

-- Preencher trial_ends_at para trials sem data
UPDATE public.user_subscriptions
SET trial_ends_at = started_at + interval '3 days',
    updated_at = now()
WHERE plan_type = 'trial'
  AND trial_ends_at IS NULL
  AND status IN ('active', 'trial_active');

-- Definir billing_interval padrão para trials
UPDATE public.user_subscriptions
SET billing_interval = 'month',
    updated_at = now()
WHERE plan_type = 'trial'
  AND billing_interval IS NULL;

-- Definir billing_interval padrão para professional/premium sem billing_interval
UPDATE public.user_subscriptions
SET billing_interval = 'month',
    updated_at = now()
WHERE plan_type IN ('professional', 'premium')
  AND billing_interval IS NULL;

-- Fechar inconsistências: manter apenas a assinatura mais recente ativa
WITH ranked_subs AS (
  SELECT id,
         user_id,
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
  FROM public.user_subscriptions
  WHERE status IN ('active', 'trial_active')
)
UPDATE public.user_subscriptions us
SET status = 'canceled',
    updated_at = now()
FROM ranked_subs rs
WHERE us.id = rs.id
  AND rs.rn > 1;

-- 6. CRIAR TABELA plan_catalog (CATÁLOGO DE PLANOS)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.plan_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_code text NOT NULL,
  interval text NOT NULL CHECK (interval IN ('month', 'year')),
  stripe_product_id text,
  stripe_price_id text,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'brl',
  trial_days integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT plan_catalog_plan_code_interval_key UNIQUE (plan_code, interval)
);

-- Inserir planos do catálogo
INSERT INTO public.plan_catalog (plan_code, interval, amount_cents, trial_days, is_active)
VALUES 
  ('trial', 'month', 0, 3, true),
  ('professional', 'month', 8900, 0, true),
  ('professional', 'year', 89000, 0, true),
  ('premium', 'month', 17900, 0, true),
  ('premium', 'year', 179000, 0, true)
ON CONFLICT (plan_code, interval) DO UPDATE
SET amount_cents = EXCLUDED.amount_cents,
    trial_days = EXCLUDED.trial_days,
    updated_at = now();

-- RLS para plan_catalog (somente leitura pública)
ALTER TABLE public.plan_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view plan catalog"
ON public.plan_catalog
FOR SELECT
USING (true);

-- 7. CRIAR FUNÇÃO DE RELATÓRIO DE BACKFILL
-- =====================================================

CREATE OR REPLACE FUNCTION public.report_subscription_backfill()
RETURNS TABLE(
  action text,
  count bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 'Total subscriptions' as action, COUNT(*) as count
  FROM public.user_subscriptions
  
  UNION ALL
  
  SELECT 'Active subscriptions' as action, COUNT(*) as count
  FROM public.user_subscriptions
  WHERE status IN ('active', 'trial_active')
  
  UNION ALL
  
  SELECT 'Trials with trial_ends_at filled' as action, COUNT(*) as count
  FROM public.user_subscriptions
  WHERE plan_type = 'trial' AND trial_ends_at IS NOT NULL
  
  UNION ALL
  
  SELECT 'Subscriptions with billing_interval' as action, COUNT(*) as count
  FROM public.user_subscriptions
  WHERE billing_interval IS NOT NULL
  
  UNION ALL
  
  SELECT 'Expired trials' as action, COUNT(*) as count
  FROM public.user_subscriptions
  WHERE status = 'expired'
  
  UNION ALL
  
  SELECT 'Multiple active subs (should be 0)' as action, COUNT(*) as count
  FROM (
    SELECT user_id, COUNT(*) as cnt
    FROM public.user_subscriptions
    WHERE status IN ('active', 'trial_active')
    GROUP BY user_id
    HAVING COUNT(*) > 1
  ) multi;
$$;

-- 8. EXECUTAR RELATÓRIO INICIAL
-- =====================================================

-- Executar e logar relatório de backfill
DO $$
DECLARE
  report_row RECORD;
BEGIN
  RAISE NOTICE '=== SUBSCRIPTION BACKFILL REPORT ===';
  FOR report_row IN SELECT * FROM public.report_subscription_backfill()
  LOOP
    RAISE NOTICE '% : %', report_row.action, report_row.count;
  END LOOP;
  RAISE NOTICE '====================================';
END $$;