-- =====================================================
-- PLUSHIFY: CONSULTAS ADMINISTRATIVAS DE ASSINATURAS
-- =====================================================
-- Execute estas queries no Supabase SQL Editor para monitorar assinaturas

-- 1. ASSINATURAS ATIVAS POR PLANO E INTERVALO
-- =====================================================
SELECT 
  plan_type,
  billing_interval,
  status,
  COUNT(*) as total_subscriptions,
  COUNT(DISTINCT user_id) as unique_users
FROM public.user_subscriptions
WHERE status IN ('active', 'trial_active')
GROUP BY plan_type, billing_interval, status
ORDER BY plan_type, billing_interval;

-- 2. TRIALS QUE EXPIRAM NOS PRÓXIMOS 5 DIAS
-- =====================================================
SELECT 
  us.id,
  us.user_id,
  au.email,
  us.plan_type,
  us.billing_interval,
  us.trial_ends_at,
  EXTRACT(DAY FROM (us.trial_ends_at - now())) as days_until_expiration
FROM public.user_subscriptions us
JOIN auth.users au ON au.id = us.user_id
WHERE us.status IN ('active', 'trial_active')
  AND us.plan_type = 'trial'
  AND us.trial_ends_at BETWEEN now() AND now() + INTERVAL '5 days'
ORDER BY us.trial_ends_at ASC;

-- 3. TRIALS QUE JÁ EXPIRARAM (DEVEM SER EXPIRADOS PELO CRON)
-- =====================================================
SELECT 
  us.id,
  us.user_id,
  au.email,
  us.plan_type,
  us.status,
  us.trial_ends_at,
  EXTRACT(DAY FROM (now() - us.trial_ends_at)) as days_since_expiration
FROM public.user_subscriptions us
JOIN auth.users au ON au.id = us.user_id
WHERE us.status IN ('active', 'trial_active')  -- Não deveria estar ativo!
  AND us.trial_ends_at IS NOT NULL
  AND us.trial_ends_at < now()
ORDER BY us.trial_ends_at ASC;

-- 4. USUÁRIOS SEM ASSINATURA REGISTRADA
-- =====================================================
SELECT 
  au.id as user_id,
  au.email,
  au.created_at as user_created_at,
  EXTRACT(DAY FROM (now() - au.created_at)) as days_since_signup
FROM auth.users au
LEFT JOIN public.user_subscriptions us 
  ON us.user_id = au.id 
  AND us.status IN ('active', 'trial_active', 'past_due')
WHERE us.user_id IS NULL
ORDER BY au.created_at DESC
LIMIT 50;

-- 5. MÚLTIPLAS ASSINATURAS ATIVAS (INCONSISTÊNCIA - DEVE SER 0)
-- =====================================================
SELECT 
  user_id,
  COUNT(*) as active_subscriptions,
  ARRAY_AGG(plan_type) as plan_types,
  ARRAY_AGG(billing_interval) as billing_intervals,
  ARRAY_AGG(status) as statuses
FROM public.user_subscriptions
WHERE status IN ('active', 'trial_active')
GROUP BY user_id
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC;

-- 6. ASSINATURAS COM DADOS INCOMPLETOS (NÃO DEVERIA EXISTIR)
-- =====================================================
SELECT 
  us.id,
  us.user_id,
  au.email,
  us.plan_type,
  us.billing_interval,
  us.status,
  us.started_at,
  CASE 
    WHEN us.user_id IS NULL THEN 'Missing user_id'
    WHEN us.plan_type IS NULL THEN 'Missing plan_type'
    WHEN us.billing_interval IS NULL THEN 'Missing billing_interval'
    WHEN us.status IS NULL THEN 'Missing status'
    WHEN us.started_at IS NULL THEN 'Missing started_at'
    WHEN us.plan_type = 'trial' AND us.trial_ends_at IS NULL THEN 'Trial without trial_ends_at'
    ELSE 'Unknown issue'
  END as issue
FROM public.user_subscriptions us
LEFT JOIN auth.users au ON au.id = us.user_id
WHERE 
  us.user_id IS NULL 
  OR us.plan_type IS NULL 
  OR us.billing_interval IS NULL 
  OR us.status IS NULL 
  OR us.started_at IS NULL
  OR (us.plan_type = 'trial' AND us.trial_ends_at IS NULL)
ORDER BY us.created_at DESC;

-- 7. CATÁLOGO DE PLANOS (TABELA plan_catalog)
-- =====================================================
SELECT 
  plan_code,
  interval,
  amount_cents / 100.0 as amount_brl,
  trial_days,
  is_active,
  stripe_product_id,
  stripe_price_id
FROM public.plan_catalog
ORDER BY 
  CASE plan_code 
    WHEN 'trial' THEN 1
    WHEN 'professional' THEN 2
    WHEN 'premium' THEN 3
  END,
  CASE interval
    WHEN 'month' THEN 1
    WHEN 'year' THEN 2
  END;

-- 8. ASSINATURAS POR STATUS (OVERVIEW GERAL)
-- =====================================================
SELECT 
  status,
  COUNT(*) as total,
  COUNT(DISTINCT user_id) as unique_users,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM public.user_subscriptions
GROUP BY status
ORDER BY COUNT(*) DESC;

-- 9. RECEITA MENSAL RECORRENTE (MRR) ESTIMADA
-- =====================================================
WITH monthly_revenue AS (
  SELECT 
    us.plan_type,
    us.billing_interval,
    COUNT(*) as subscriptions,
    pc.amount_cents / 100.0 as amount,
    CASE 
      WHEN us.billing_interval = 'year' THEN (pc.amount_cents / 100.0) / 12
      ELSE pc.amount_cents / 100.0
    END as monthly_amount
  FROM public.user_subscriptions us
  JOIN public.plan_catalog pc 
    ON pc.plan_code = us.plan_type 
    AND pc.interval = us.billing_interval
  WHERE us.status IN ('active', 'trial_active')
    AND us.plan_type != 'trial'
  GROUP BY us.plan_type, us.billing_interval, pc.amount_cents
)
SELECT 
  plan_type,
  billing_interval,
  subscriptions,
  amount as price,
  monthly_amount as monthly_price,
  subscriptions * monthly_amount as total_mrr
FROM monthly_revenue
ORDER BY total_mrr DESC;

-- 10. UPGRADES E DOWNGRADES (ÚLTIMOS 30 DIAS)
-- =====================================================
WITH subscription_changes AS (
  SELECT 
    us.user_id,
    au.email,
    LAG(us.plan_type) OVER (PARTITION BY us.user_id ORDER BY us.updated_at) as previous_plan,
    us.plan_type as current_plan,
    LAG(us.billing_interval) OVER (PARTITION BY us.user_id ORDER BY us.updated_at) as previous_interval,
    us.billing_interval as current_interval,
    us.updated_at
  FROM public.user_subscriptions us
  JOIN auth.users au ON au.id = us.user_id
  WHERE us.updated_at >= now() - INTERVAL '30 days'
)
SELECT 
  user_id,
  email,
  previous_plan || ' (' || previous_interval || ')' as from_plan,
  current_plan || ' (' || current_interval || ')' as to_plan,
  updated_at,
  CASE 
    WHEN previous_plan = 'trial' AND current_plan IN ('professional', 'premium') THEN 'Trial Conversion'
    WHEN previous_plan = 'professional' AND current_plan = 'premium' THEN 'Upgrade'
    WHEN previous_plan = 'premium' AND current_plan = 'professional' THEN 'Downgrade'
    WHEN previous_interval = 'month' AND current_interval = 'year' THEN 'Monthly to Annual'
    WHEN previous_interval = 'year' AND current_interval = 'month' THEN 'Annual to Monthly'
    ELSE 'Other Change'
  END as change_type
FROM subscription_changes
WHERE previous_plan IS NOT NULL 
  AND (previous_plan != current_plan OR previous_interval != current_interval)
ORDER BY updated_at DESC;

-- 11. EXECUTAR EXPIRAÇÃO MANUAL DE TRIALS (TESTE)
-- =====================================================
-- USE COM CUIDADO: Expira trials vencidos manualmente
-- SELECT * FROM public.expire_trial_subscriptions();

-- 12. CRIAR ASSINATURA MANUALMENTE (ADMIN)
-- =====================================================
-- Exemplo de como criar uma assinatura trial para um usuário
-- SELECT public.start_subscription(
--   'USER_UUID_HERE'::uuid,
--   'trial',
--   'month',
--   3
-- );

-- 13. RELATÓRIO DE BACKFILL (VER RESULTADO DA MIGRAÇÃO)
-- =====================================================
SELECT * FROM public.report_subscription_backfill();

-- 14. LISTAR ASSINATURAS COM STRIPE IDS
-- =====================================================
SELECT 
  us.id,
  us.user_id,
  au.email,
  us.plan_type,
  us.billing_interval,
  us.status,
  us.stripe_subscription_id,
  us.stripe_customer_id,
  us.current_period_end,
  us.cancel_at_period_end
FROM public.user_subscriptions us
JOIN auth.users au ON au.id = us.user_id
WHERE us.stripe_subscription_id IS NOT NULL
ORDER BY us.created_at DESC
LIMIT 50;
