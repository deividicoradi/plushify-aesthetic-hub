CREATE OR REPLACE FUNCTION public.auto_start_trial_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  v_existing_count integer;
BEGIN
  BEGIN
    v_email := LOWER(COALESCE(NEW.email, ''));

    IF v_email = '' OR
       v_email IS NULL OR
       v_email LIKE '%@example.%' OR
       v_email LIKE '%@test.%' OR
       v_email = 'public@plushify.com.br' OR
       v_email LIKE '%+test@%' THEN
      RAISE NOTICE 'Trial auto-start: Skipping internal/seed account: %', v_email;
      RETURN NEW;
    END IF;

    SELECT COUNT(*) INTO v_existing_count
    FROM public.user_subscriptions
    WHERE user_id = NEW.id
      AND status IN ('active', 'trial_active', 'trial');

    IF v_existing_count > 0 THEN
      RAISE NOTICE 'Trial auto-start: User % already has active subscription, skipping', NEW.id;
      RETURN NEW;
    END IF;

    PERFORM public.start_subscription(
      p_user_id := NEW.id,
      p_plan_code := 'trial',
      p_payment_kind := 'trial',
      p_billing_interval := 'month',
      p_trial_days := 7,
      p_abacate_subscription_id := NULL,
      p_abacate_customer_id := NULL,
      p_abacate_checkout_id := NULL,
      p_current_period_end := NULL
    );

    RAISE NOTICE 'Trial auto-start: Successfully created trial subscription for user %', NEW.id;

  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Trial auto-start: Error creating trial for user % - % %',
        NEW.id, SQLERRM, SQLSTATE;
  END;

  RETURN NEW;
END;
$$;