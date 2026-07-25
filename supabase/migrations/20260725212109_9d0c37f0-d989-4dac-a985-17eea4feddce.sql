-- 1. Código de indicação por usuário
CREATE TABLE IF NOT EXISTS public.referral_codes (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.referral_codes TO authenticated;
GRANT ALL ON public.referral_codes TO service_role;

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário vê apenas o próprio código de indicação"
  ON public.referral_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.get_or_create_referral_code() RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_code text;
  v_candidate text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;

  SELECT code INTO v_code FROM public.referral_codes WHERE user_id = auth.uid();
  IF v_code IS NOT NULL THEN
    RETURN v_code;
  END IF;

  LOOP
    v_candidate := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
    BEGIN
      INSERT INTO public.referral_codes (user_id, code) VALUES (auth.uid(), v_candidate);
      RETURN v_candidate;
    EXCEPTION WHEN unique_violation THEN
      NULL;
    END;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_or_create_referral_code() TO authenticated;

-- 2. Registro de indicações
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_email text,
  code text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'rewarded')),
  created_at timestamptz NOT NULL DEFAULT now(),
  rewarded_at timestamptz,
  UNIQUE (referred_id)
);

GRANT SELECT ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário vê as indicações que fez"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id, status);

-- 3. Captura a indicação no cadastro
CREATE OR REPLACE FUNCTION public.capture_referral_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_code text;
  v_referrer_id uuid;
BEGIN
  BEGIN
    v_code := NEW.raw_user_meta_data->>'referral_code';
    IF v_code IS NULL OR v_code = '' THEN
      RETURN NEW;
    END IF;

    SELECT user_id INTO v_referrer_id FROM public.referral_codes WHERE code = upper(v_code);

    IF v_referrer_id IS NULL OR v_referrer_id = NEW.id THEN
      RETURN NEW;
    END IF;

    INSERT INTO public.referrals (referrer_id, referred_id, referred_email, code)
    VALUES (v_referrer_id, NEW.id, NEW.email, upper(v_code))
    ON CONFLICT (referred_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'capture_referral_on_signup: erro ao registrar indicação para % - %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_referral ON auth.users;
CREATE TRIGGER on_auth_user_created_referral
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.capture_referral_on_signup();

-- 4. Recompensa quando o indicado assina um plano pago
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

      UPDATE public.user_subscriptions
        SET expires_at = COALESCE(expires_at, now()) + interval '30 days'
        WHERE user_id = NEW.user_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_reward_referral ON public.user_subscriptions;
CREATE TRIGGER trg_reward_referral
AFTER INSERT OR UPDATE ON public.user_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.reward_referral_on_paid_activation();