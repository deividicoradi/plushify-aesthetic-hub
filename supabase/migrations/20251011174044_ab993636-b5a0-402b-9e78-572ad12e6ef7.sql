-- =====================================================
-- CORREÇÃO DO FLUXO DE ASSINATURAS
-- =====================================================

-- 1. PRIMEIRO: Atualizar assinaturas existentes sem current_period_end
UPDATE public.user_subscriptions
SET current_period_end = CASE 
  WHEN billing_interval = 'month' THEN created_at + interval '1 month'
  WHEN billing_interval = 'year' THEN created_at + interval '1 year'
  ELSE created_at + interval '1 month'
END,
updated_at = now()
WHERE plan_type IN ('professional', 'premium')
  AND current_period_end IS NULL;

-- 2. Atualizar função start_subscription
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
  v_current_period_end timestamp with time zone;
  v_existing_sub RECORD;
BEGIN
  IF p_plan_code NOT IN ('trial', 'professional', 'premium') THEN
    RAISE EXCEPTION 'Invalid plan_code: %', p_plan_code;
  END IF;
  IF p_billing_interval NOT IN ('month', 'year') THEN
    RAISE EXCEPTION 'Invalid billing_interval: %', p_billing_interval;
  END IF;

  IF p_trial_days > 0 THEN
    v_trial_end := now() + (p_trial_days || ' days')::interval;
    v_status := 'trial_active';
  ELSE
    v_trial_end := NULL;
    v_status := 'active';
  END IF;

  IF p_plan_code IN ('professional', 'premium') THEN
    IF p_current_period_end IS NOT NULL THEN
      v_current_period_end := p_current_period_end;
    ELSIF p_billing_interval = 'month' THEN
      v_current_period_end := now() + interval '1 month';
    ELSIF p_billing_interval = 'year' THEN
      v_current_period_end := now() + interval '1 year';
    END IF;
  ELSE
    v_current_period_end := NULL;
  END IF;

  SELECT * INTO v_existing_sub
  FROM public.user_subscriptions
  WHERE user_id = p_user_id
    AND plan_type = p_plan_code::plan_type
    AND billing_interval = p_billing_interval
    AND status IN ('active', 'trial_active')
    AND (stripe_subscription_id = p_stripe_subscription_id OR (stripe_subscription_id IS NULL AND p_stripe_subscription_id IS NULL))
  LIMIT 1;

  IF v_existing_sub.id IS NOT NULL THEN
    UPDATE public.user_subscriptions
    SET stripe_customer_id = COALESCE(p_stripe_customer_id, stripe_customer_id),
        current_period_end = COALESCE(v_current_period_end, current_period_end),
        updated_at = now()
    WHERE id = v_existing_sub.id
    RETURNING id INTO v_subscription_id;
    
    RAISE NOTICE 'Subscription already exists (idempotent), updated: %', v_subscription_id;
    RETURN v_subscription_id;
  END IF;

  UPDATE public.user_subscriptions
  SET status = 'canceled',
      updated_at = now()
  WHERE user_id = p_user_id
    AND status IN ('active', 'trial_active');

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
    v_current_period_end,
    now(),
    now()
  )
  RETURNING id INTO v_subscription_id;

  RAISE NOTICE 'Subscription created for user % with plan % (%) - ID: %', 
    p_user_id, p_plan_code, p_billing_interval, v_subscription_id;

  RETURN v_subscription_id;
END;
$$;

-- 3. Função de validação
CREATE OR REPLACE FUNCTION public.validate_single_active_subscription()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_active_count integer;
BEGIN
  SELECT COUNT(*)
  INTO v_active_count
  FROM public.user_subscriptions
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
    AND status IN ('active', 'trial_active');

  IF v_active_count > 1 THEN
    RAISE EXCEPTION 'User % cannot have more than one active subscription (found %)', 
      COALESCE(NEW.user_id, OLD.user_id), v_active_count;
  END IF;

  RETURN NEW;
END;
$$;

-- 4. Constraint trigger
DROP TRIGGER IF EXISTS ensure_single_active_subscription ON public.user_subscriptions;

CREATE CONSTRAINT TRIGGER ensure_single_active_subscription
  AFTER INSERT OR UPDATE ON public.user_subscriptions
  DEFERRABLE INITIALLY IMMEDIATE
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_single_active_subscription();

-- 5. CHECK constraints
ALTER TABLE public.user_subscriptions
DROP CONSTRAINT IF EXISTS paid_plans_require_period_end;

ALTER TABLE public.user_subscriptions
ADD CONSTRAINT paid_plans_require_period_end
CHECK (
  plan_type = 'trial' OR 
  (plan_type IN ('professional', 'premium') AND current_period_end IS NOT NULL)
);

ALTER TABLE public.user_subscriptions
DROP CONSTRAINT IF EXISTS period_end_is_future;

ALTER TABLE public.user_subscriptions
ADD CONSTRAINT period_end_is_future
CHECK (
  current_period_end IS NULL OR current_period_end >= created_at
);