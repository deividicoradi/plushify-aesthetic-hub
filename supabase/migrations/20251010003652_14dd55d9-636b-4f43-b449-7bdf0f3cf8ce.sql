-- Fix start_subscription to cast plan_code text to enum plan_type
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
  -- Validate inputs
  IF p_plan_code NOT IN ('trial', 'professional', 'premium', 'enterprise') THEN
    RAISE EXCEPTION 'Invalid plan_code: %', p_plan_code;
  END IF;
  IF p_billing_interval NOT IN ('month', 'year') THEN
    RAISE EXCEPTION 'Invalid billing_interval: %', p_billing_interval;
  END IF;

  -- Compute trial end and status
  IF p_trial_days > 0 THEN
    v_trial_end := now() + (p_trial_days || ' days')::interval;
    v_status := 'trial_active';
  ELSE
    v_trial_end := NULL;
    v_status := 'active';
  END IF;

  -- Upsert subscription (cast plan_code to enum type)
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
  ON CONFLICT ON CONSTRAINT uniq_active_sub_by_user
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

  -- Cancel any previous active subscriptions for this user (except the current row)
  UPDATE public.user_subscriptions
  SET status = 'canceled',
      cancel_at_period_end = true,
      updated_at = now()
  WHERE user_id = p_user_id
    AND status IN ('active', 'trial_active')
    AND id != v_subscription_id;

  RAISE NOTICE 'Subscription created/updated for user % with plan % (%) - ID: %', 
    p_user_id, p_plan_code, p_billing_interval, v_subscription_id;

  RETURN v_subscription_id;
END;
$$;