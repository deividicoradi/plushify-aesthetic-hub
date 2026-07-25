CREATE OR REPLACE FUNCTION public.reward_referral_on_paid_activation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_referral record;
BEGIN
  IF NEW.status = 'active' AND NEW.plan_type IN ('professional', 'premium') THEN
    SELECT * INTO v_referral FROM public.referrals
      WHERE referred_id = NEW.user_id AND status = 'pending'
      FOR UPDATE SKIP LOCKED;

    IF FOUND THEN
      UPDATE public.referrals SET status = 'rewarded', rewarded_at = now() WHERE id = v_referral.id;

      UPDATE public.user_subscriptions
        SET expires_at = GREATEST(COALESCE(expires_at, now()), now()) + interval '30 days'
        WHERE user_id = v_referral.referrer_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;