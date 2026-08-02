-- O e-mail de placeholder pós-exclusão (deleted-<uuid>@deleted.plushify.com.br)
-- deixava o admin sem jeito de saber quem era a conta pra tentar recuperar
-- o cliente ou entrar em contato. account_deletion_log já guarda o e-mail
-- original (email_before) desde a migração anterior — só faltava expor isso
-- na listagem do admin.

DROP FUNCTION IF EXISTS public.admin_list_customers(integer, integer, text, text, text);

CREATE OR REPLACE FUNCTION public.admin_list_customers(
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0,
  p_search text DEFAULT NULL,
  p_plan_type text DEFAULT NULL,
  p_status text DEFAULT NULL
)
RETURNS TABLE(
  user_id uuid,
  email text,
  plan_type text,
  status text,
  billing_interval text,
  payment_kind text,
  started_at timestamptz,
  expires_at timestamptz,
  trial_ends_at timestamptz,
  signed_up_at timestamptz,
  last_sign_in_at timestamptz,
  deleted_email_before text,
  deleted_at timestamptz,
  total_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;

  RETURN QUERY
  SELECT
    u.id AS user_id,
    u.email::text,
    s.plan_type::text,
    COALESCE(s.status, 'sem_plano') AS status,
    s.billing_interval,
    s.payment_kind,
    s.started_at,
    s.expires_at,
    s.trial_ends_at,
    u.created_at AS signed_up_at,
    u.last_sign_in_at,
    del.email_before AS deleted_email_before,
    del.requested_at AS deleted_at,
    count(*) OVER ()::bigint AS total_count
  FROM auth.users u
  LEFT JOIN public.user_subscriptions s ON s.user_id = u.id AND s.status IN ('active', 'trial_active')
  LEFT JOIN LATERAL (
    SELECT l.email_before, l.requested_at
    FROM public.account_deletion_log l
    WHERE l.user_id = u.id
    ORDER BY l.requested_at DESC
    LIMIT 1
  ) del ON true
  WHERE NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id AND r.role = 'admin')
    AND (
      p_search IS NULL OR p_search = ''
      OR u.email ILIKE '%' || p_search || '%'
      OR del.email_before ILIKE '%' || p_search || '%'
    )
    AND (p_plan_type IS NULL OR p_plan_type = '' OR s.plan_type::text = p_plan_type)
    AND (p_status IS NULL OR p_status = '' OR COALESCE(s.status, 'sem_plano') = p_status)
  ORDER BY u.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_list_customers(integer, integer, text, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_list_customers(integer, integer, text, text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_list_customers(integer, integer, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_customers(integer, integer, text, text, text) TO service_role;

-- Mesma coisa no modal de detalhe do cliente (retorna jsonb, tipo de
-- retorno não muda — CREATE OR REPLACE basta aqui).
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
  v_deleted_email_before text;
  v_deleted_at timestamptz;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;

  SELECT u.email::text, u.created_at INTO v_email, v_signed_up_at
  FROM auth.users u WHERE u.id = p_user_id;

  IF v_email IS NULL THEN
    RAISE EXCEPTION 'Cliente não encontrado';
  END IF;

  SELECT l.email_before, l.requested_at INTO v_deleted_email_before, v_deleted_at
  FROM public.account_deletion_log l
  WHERE l.user_id = p_user_id
  ORDER BY l.requested_at DESC
  LIMIT 1;

  SELECT COALESCE(jsonb_agg(t ORDER BY t.started_at DESC), '[]'::jsonb) INTO v_subscriptions
  FROM (
    SELECT
      id, plan_type::text, status, billing_interval, payment_kind,
      plan_amount_paid, started_at, expires_at, trial_ends_at,
      cancel_at_period_end, updated_at, abacate_checkout_id, abacate_subscription_id
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
    'upgrades', v_upgrades,
    'deleted_email_before', v_deleted_email_before,
    'deleted_at', v_deleted_at
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_get_customer_detail(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_get_customer_detail(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_get_customer_detail(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_customer_detail(uuid) TO service_role;
