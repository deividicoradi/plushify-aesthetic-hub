-- Corrigir start_subscription para funcionar sem constraint específica
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
  v_existing_id uuid;
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

  -- Check if user already has an active subscription
  SELECT id INTO v_existing_id
  FROM public.user_subscriptions
  WHERE user_id = p_user_id
    AND status IN ('active', 'trial_active')
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    -- Update existing subscription
    UPDATE public.user_subscriptions
    SET plan_type = p_plan_code::plan_type,
        billing_interval = p_billing_interval,
        status = v_status,
        trial_ends_at = v_trial_end,
        stripe_subscription_id = COALESCE(p_stripe_subscription_id, stripe_subscription_id),
        stripe_customer_id = COALESCE(p_stripe_customer_id, stripe_customer_id),
        current_period_end = COALESCE(p_current_period_end, current_period_end),
        updated_at = now()
    WHERE id = v_existing_id
    RETURNING id INTO v_subscription_id;
  ELSE
    -- Insert new subscription
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
    RETURNING id INTO v_subscription_id;
  END IF;

  RAISE NOTICE 'Subscription created/updated for user % with plan % (%) - ID: %', 
    p_user_id, p_plan_code, p_billing_interval, v_subscription_id;

  RETURN v_subscription_id;
END;
$$;