-- BUG REAL encontrado em 2026-07-31: start_subscription (desde a reescrita de
-- 2026-07-28, upgrade_prorated_credit) usa "ON CONFLICT (user_id)", mas a
-- constraint UNIQUE(user_id) foi removida em 2025-10-11 (permitir histórico
-- de assinaturas). O que sobrou é só um ÍNDICE ÚNICO PARCIAL
-- (user_id WHERE status IN ('active','trial_active')) — Postgres exige que o
-- alvo do ON CONFLICT bata exatamente com esse predicado, senão erro em
-- runtime ("no unique or exclusion constraint matching the ON CONFLICT
-- specification"). Resultado: toda vez que start_subscription era chamado
-- pra um usuário que JÁ tinha assinatura ativa (ex: upgrade de plano), a
-- função falhava e o webhook não conseguia atualizar plan_type/status —
-- mesmo com o pagamento aprovado na AbacatePay. É exatamente o mesmo bug já
-- corrigido antes (migrations de 2025-10-09/2025-10-18), que a reescrita de
-- 2026-07-28 regrediu ao trocar "ON CONFLICT ON CONSTRAINT uniq_active_sub_by_user"
-- por um simples "ON CONFLICT (user_id)".

CREATE OR REPLACE FUNCTION public.start_subscription(
  p_user_id uuid,
  p_plan_code text,
  p_payment_kind text DEFAULT 'recurring_card',
  p_billing_interval text DEFAULT 'month',
  p_trial_days integer DEFAULT 0,
  p_abacate_subscription_id text DEFAULT NULL,
  p_abacate_customer_id text DEFAULT NULL,
  p_abacate_checkout_id text DEFAULT NULL,
  p_current_period_end timestamptz DEFAULT NULL,
  p_plan_amount_paid integer DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_trial_ends timestamptz;
BEGIN
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
    payment_kind, cancel_at_period_end, billing_interval, plan_amount_paid
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
    false,
    p_billing_interval,
    p_plan_amount_paid
  )
  -- Alvo do ON CONFLICT precisa bater com o índice único parcial real
  -- (uniq_active_sub_by_user / idx_one_active_subscription_per_user), não
  -- com um UNIQUE(user_id) que não existe mais.
  ON CONFLICT (user_id) WHERE status IN ('active', 'trial_active')
  DO UPDATE SET
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
    billing_interval        = EXCLUDED.billing_interval,
    plan_amount_paid        = COALESCE(EXCLUDED.plan_amount_paid, public.user_subscriptions.plan_amount_paid),
    updated_at              = now()
  RETURNING id INTO v_id;

  -- Rede de segurança: se por algum motivo sobrar mais de uma linha ativa
  -- pro mesmo usuário (ex: dado sujo de antes desta correção), fecha as
  -- outras explicitamente em vez de confiar só no índice único.
  UPDATE public.user_subscriptions
  SET status = 'cancelled', updated_at = now()
  WHERE user_id = p_user_id
    AND status IN ('active', 'trial_active')
    AND id <> v_id;

  RETURN v_id;
END;
$$;

-- Mesma assinatura de antes (10 parâmetros) — CREATE OR REPLACE preserva os
-- grants já existentes, mas reafirmamos explicitamente por segurança.
REVOKE EXECUTE ON FUNCTION public.start_subscription(uuid, text, text, text, integer, text, text, text, timestamptz, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.start_subscription(uuid, text, text, text, integer, text, text, text, timestamptz, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.start_subscription(uuid, text, text, text, integer, text, text, text, timestamptz, integer) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.start_subscription(uuid, text, text, text, integer, text, text, text, timestamptz, integer) TO service_role;

-- Limpeza de dado sujo: se algum usuário ficou com mais de uma linha
-- 'active'/'trial_active' por causa do bug acima, mantém só a mais recente
-- (por started_at) e fecha as demais como 'cancelled'.
WITH ranked AS (
  SELECT id, user_id,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY started_at DESC, updated_at DESC) AS rn
  FROM public.user_subscriptions
  WHERE status IN ('active', 'trial_active')
)
UPDATE public.user_subscriptions s
SET status = 'cancelled', updated_at = now()
FROM ranked r
WHERE s.id = r.id AND r.rn > 1;