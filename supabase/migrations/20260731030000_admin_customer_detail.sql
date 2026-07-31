-- Detalhe de 1 cliente pro painel admin: histórico completo de assinaturas
-- (agora que user_subscriptions permite múltiplas linhas por usuário) e
-- histórico de upgrades com crédito aplicado. Mesma proteção has_role das
-- demais RPCs admin. Não expõe CPF/cartão (não passam pelo nosso banco).
CREATE OR REPLACE FUNCTION public.admin_get_customer_detail(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  v_signed_up_at timestamptz;
  v_subscriptions jsonb;
  v_upgrades jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;

  SELECT u.email::text, u.created_at INTO v_email, v_signed_up_at
  FROM auth.users u WHERE u.id = p_user_id;

  IF v_email IS NULL THEN
    RAISE EXCEPTION 'Cliente não encontrado';
  END IF;

  SELECT COALESCE(jsonb_agg(t ORDER BY t.started_at DESC), '[]'::jsonb) INTO v_subscriptions
  FROM (
    SELECT
      id, plan_type::text, status, billing_interval, payment_kind,
      plan_amount_paid, started_at, expires_at, trial_ends_at,
      cancel_at_period_end, updated_at
    FROM public.user_subscriptions
    WHERE user_id = p_user_id
  ) t;

  SELECT COALESCE(jsonb_agg(t ORDER BY t.accepted_at DESC), '[]'::jsonb) INTO v_upgrades
  FROM (
    SELECT
      id, previous_plan_type, previous_billing_interval,
      new_plan_type, new_billing_interval,
      credit_cents, new_price_cents, charge_now_cents, accepted_at
    FROM public.plan_upgrade_consents
    WHERE user_id = p_user_id
  ) t;

  RETURN jsonb_build_object(
    'user_id', p_user_id,
    'email', v_email,
    'signed_up_at', v_signed_up_at,
    'subscriptions', v_subscriptions,
    'upgrades', v_upgrades
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_get_customer_detail(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_get_customer_detail(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_get_customer_detail(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_customer_detail(uuid) TO service_role;
