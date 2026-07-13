-- 1. Colunas AbacatePay em user_subscriptions
ALTER TABLE public.user_subscriptions
  ADD COLUMN IF NOT EXISTS abacate_customer_id text,
  ADD COLUMN IF NOT EXISTS abacate_subscription_id text,
  ADD COLUMN IF NOT EXISTS abacate_checkout_id text,
  ADD COLUMN IF NOT EXISTS payment_kind text,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean NOT NULL DEFAULT false;

-- Restringe payment_kind a valores conhecidos (mantém NULL permitido para trial legado)
ALTER TABLE public.user_subscriptions
  DROP CONSTRAINT IF EXISTS user_subscriptions_payment_kind_check;
ALTER TABLE public.user_subscriptions
  ADD CONSTRAINT user_subscriptions_payment_kind_check
  CHECK (payment_kind IS NULL OR payment_kind IN ('recurring_card','pix','installments','trial'));

-- Índices únicos parciais (não colidem com registros legados NULL)
CREATE UNIQUE INDEX IF NOT EXISTS user_subscriptions_abacate_subscription_id_key
  ON public.user_subscriptions (abacate_subscription_id)
  WHERE abacate_subscription_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS user_subscriptions_abacate_checkout_id_key
  ON public.user_subscriptions (abacate_checkout_id)
  WHERE abacate_checkout_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS user_subscriptions_abacate_customer_id_idx
  ON public.user_subscriptions (abacate_customer_id)
  WHERE abacate_customer_id IS NOT NULL;

-- 2. Substitui start_subscription: parâmetros AbacatePay
DROP FUNCTION IF EXISTS public.start_subscription(uuid, text, text, integer, text, text, timestamptz);

CREATE OR REPLACE FUNCTION public.start_subscription(
  p_user_id uuid,
  p_plan_code text,
  p_payment_kind text DEFAULT 'recurring_card',
  p_billing_interval text DEFAULT 'month',
  p_trial_days integer DEFAULT 0,
  p_abacate_subscription_id text DEFAULT NULL,
  p_abacate_customer_id text DEFAULT NULL,
  p_abacate_checkout_id text DEFAULT NULL,
  p_current_period_end timestamptz DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_trial_ends timestamptz;
BEGIN
  -- Só o próprio usuário ou service_role pode chamar
  IF auth.uid() IS NOT NULL AND auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  IF p_payment_kind NOT IN ('recurring_card','pix','installments','trial') THEN
    RAISE EXCEPTION 'payment_kind inválido: %', p_payment_kind;
  END IF;

  v_trial_ends := CASE
    WHEN p_trial_days > 0 THEN now() + (p_trial_days || ' days')::interval
    ELSE NULL
  END;

  INSERT INTO public.user_subscriptions (
    user_id, plan_type, status, started_at, expires_at, trial_ends_at,
    abacate_subscription_id, abacate_customer_id, abacate_checkout_id,
    payment_kind, cancel_at_period_end
  )
  VALUES (
    p_user_id,
    p_plan_code::public.plan_type,
    'active',
    now(),
    p_current_period_end,
    v_trial_ends,
    p_abacate_subscription_id,
    p_abacate_customer_id,
    p_abacate_checkout_id,
    p_payment_kind,
    false
  )
  ON CONFLICT (user_id) DO UPDATE SET
    plan_type               = EXCLUDED.plan_type,
    status                  = EXCLUDED.status,
    started_at              = now(),
    expires_at              = EXCLUDED.expires_at,
    trial_ends_at           = EXCLUDED.trial_ends_at,
    abacate_subscription_id = COALESCE(EXCLUDED.abacate_subscription_id, public.user_subscriptions.abacate_subscription_id),
    abacate_customer_id     = COALESCE(EXCLUDED.abacate_customer_id, public.user_subscriptions.abacate_customer_id),
    abacate_checkout_id     = COALESCE(EXCLUDED.abacate_checkout_id, public.user_subscriptions.abacate_checkout_id),
    payment_kind            = EXCLUDED.payment_kind,
    cancel_at_period_end    = false,
    updated_at              = now()
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.start_subscription(uuid, text, text, text, integer, text, text, text, timestamptz) TO authenticated, service_role;