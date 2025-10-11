-- Drop existing function to recreate with new logic
DROP FUNCTION IF EXISTS public.start_subscription(uuid, text, text, integer, text, text, timestamp with time zone);

-- Recreate start_subscription with proper single-active-subscription logic
CREATE OR REPLACE FUNCTION public.start_subscription(
  p_user_id UUID,
  p_plan_code TEXT,
  p_billing_interval TEXT DEFAULT 'month',
  p_trial_days INTEGER DEFAULT 0,
  p_stripe_subscription_id TEXT DEFAULT NULL,
  p_stripe_customer_id TEXT DEFAULT NULL,
  p_current_period_end TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_subscription_id UUID;
  v_trial_end TIMESTAMP WITH TIME ZONE;
  v_status TEXT;
  v_current_period_end TIMESTAMP WITH TIME ZONE;
  v_existing_sub RECORD;
BEGIN
  -- Validate plan_code
  IF p_plan_code NOT IN ('trial', 'professional', 'premium') THEN
    RAISE EXCEPTION 'Invalid plan_code: %', p_plan_code;
  END IF;

  -- Validate billing_interval
  IF p_billing_interval NOT IN ('month', 'year') THEN
    RAISE EXCEPTION 'Invalid billing_interval: %', p_billing_interval;
  END IF;

  -- STEP 1: Cancel all previous active/trial_active subscriptions for this user
  UPDATE public.user_subscriptions
  SET status = 'canceled',
      updated_at = now()
  WHERE user_id = p_user_id
    AND status IN ('active', 'trial_active');

  -- STEP 2: Define trial/status/dates based on plan type
  IF p_plan_code = 'trial' THEN
    -- Trial: always 3 days, no billing_interval relevance, no current_period_end
    v_trial_end := now() + interval '3 days';
    v_status := 'trial_active';
    v_current_period_end := NULL;
  ELSE
    -- Paid plans (professional, premium)
    v_trial_end := NULL;
    v_status := 'active';
    
    -- Set current_period_end based on billing_interval
    IF p_current_period_end IS NOT NULL THEN
      v_current_period_end := p_current_period_end;
    ELSIF p_billing_interval = 'month' THEN
      v_current_period_end := now() + interval '1 month';
    ELSIF p_billing_interval = 'year' THEN
      v_current_period_end := now() + interval '1 year';
    END IF;
  END IF;

  -- STEP 3: Check for idempotent insert (same user, plan, interval, stripe_subscription_id)
  -- If exact match exists and is active, just update and return
  SELECT * INTO v_existing_sub
  FROM public.user_subscriptions
  WHERE user_id = p_user_id
    AND plan_type = p_plan_code::plan_type
    AND billing_interval = p_billing_interval
    AND status IN ('active', 'trial_active')
    AND (
      (stripe_subscription_id = p_stripe_subscription_id) OR 
      (stripe_subscription_id IS NULL AND p_stripe_subscription_id IS NULL)
    )
  LIMIT 1;

  IF v_existing_sub.id IS NOT NULL THEN
    -- Idempotent: update metadata and return existing ID
    UPDATE public.user_subscriptions
    SET stripe_customer_id = COALESCE(p_stripe_customer_id, stripe_customer_id),
        current_period_end = COALESCE(v_current_period_end, current_period_end),
        trial_ends_at = COALESCE(v_trial_end, trial_ends_at),
        updated_at = now()
    WHERE id = v_existing_sub.id
    RETURNING id INTO v_subscription_id;
    
    RAISE NOTICE 'Idempotent subscription update for user % - ID: %', p_user_id, v_subscription_id;
    RETURN v_subscription_id;
  END IF;

  -- STEP 4: Create new subscription
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

  RAISE NOTICE 'New subscription created for user % with plan % (%) - ID: %', 
    p_user_id, p_plan_code, p_billing_interval, v_subscription_id;

  RETURN v_subscription_id;
END;
$$;

-- Create constraint trigger to validate single active subscription per user
CREATE OR REPLACE FUNCTION public.validate_single_active_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_active_count INTEGER;
BEGIN
  -- Count active subscriptions for this user
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

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS enforce_single_active_subscription ON public.user_subscriptions;

-- Create trigger to enforce single active subscription
CREATE CONSTRAINT TRIGGER enforce_single_active_subscription
AFTER INSERT OR UPDATE ON public.user_subscriptions
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION public.validate_single_active_subscription();

-- Create validation check to ensure paid plans have current_period_end
ALTER TABLE public.user_subscriptions DROP CONSTRAINT IF EXISTS paid_plans_must_have_period_end;

-- Note: We'll use a trigger instead of CHECK constraint for time-based validation
CREATE OR REPLACE FUNCTION public.validate_paid_plan_period_end()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Paid plans (professional, premium) with active status must have current_period_end
  IF NEW.plan_type IN ('professional', 'premium') 
     AND NEW.status = 'active'
     AND NEW.current_period_end IS NULL THEN
    RAISE EXCEPTION 'Paid plan % with active status must have current_period_end set', NEW.plan_type;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_paid_plan_period_end_trigger ON public.user_subscriptions;

CREATE TRIGGER validate_paid_plan_period_end_trigger
BEFORE INSERT OR UPDATE ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.validate_paid_plan_period_end();