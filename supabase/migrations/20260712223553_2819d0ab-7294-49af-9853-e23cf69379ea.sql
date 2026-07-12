CREATE OR REPLACE FUNCTION public.start_subscription(
  p_user_id uuid,
  p_plan_code text,
  p_billing_interval text DEFAULT 'month'::text,
  p_trial_days integer DEFAULT 0,
  p_stripe_subscription_id text DEFAULT NULL::text,
  p_stripe_customer_id text DEFAULT NULL::text,
  p_current_period_end timestamp with time zone DEFAULT NULL::timestamp with time zone
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_id uuid;
  v_status text;
  v_trial_ends timestamptz;
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  v_trial_ends := CASE WHEN p_trial_days > 0 THEN now() + (p_trial_days || ' days')::interval ELSE NULL END;
  v_status := 'active';

  INSERT INTO public.user_subscriptions (user_id, plan_type, status, started_at, expires_at, trial_ends_at)
  VALUES (p_user_id, p_plan_code::public.plan_type, v_status, now(), p_current_period_end, v_trial_ends)
  ON CONFLICT (user_id) DO UPDATE SET
    plan_type    = EXCLUDED.plan_type,
    status       = EXCLUDED.status,
    started_at   = now(),
    expires_at   = EXCLUDED.expires_at,
    trial_ends_at = EXCLUDED.trial_ends_at,
    updated_at   = now()
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.start_subscription(uuid, text, text, integer, text, text, timestamptz) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.start_subscription(uuid, text, text, integer, text, text, timestamptz) FROM anon;
REVOKE ALL ON FUNCTION public.start_subscription(uuid, text, text, integer, text, text, timestamptz) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.start_subscription(uuid, text, text, integer, text, text, timestamptz) TO service_role;