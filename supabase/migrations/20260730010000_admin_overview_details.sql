-- Listas de detalhe pros cards clicáveis da Visão Geral do painel admin.
-- Mesma proteção das demais RPCs admin (has_role checado antes de tocar em
-- qualquer linha) e mesma exclusão de contas admin das listas. Limita cada
-- lista a 300 registros (suficiente pro volume atual, evita payload gigante
-- se a base crescer muito antes de virarmos isso em paginação de verdade).
CREATE OR REPLACE FUNCTION public.admin_get_overview_details()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_users jsonb;
  v_new_signups jsonb;
  v_active_subscriptions jsonb;
  v_cancellations jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;

  SELECT COALESCE(jsonb_agg(t), '[]'::jsonb) INTO v_users
  FROM (
    SELECT u.id AS user_id, u.email::text, u.created_at AS signed_up_at
    FROM auth.users u
    WHERE NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id AND r.role = 'admin')
    ORDER BY u.created_at DESC
    LIMIT 300
  ) t;

  SELECT COALESCE(jsonb_agg(t), '[]'::jsonb) INTO v_new_signups
  FROM (
    SELECT u.id AS user_id, u.email::text, u.created_at AS signed_up_at
    FROM auth.users u
    WHERE u.created_at > now() - interval '30 days'
      AND NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id AND r.role = 'admin')
    ORDER BY u.created_at DESC
    LIMIT 300
  ) t;

  SELECT COALESCE(jsonb_agg(t), '[]'::jsonb) INTO v_active_subscriptions
  FROM (
    SELECT
      u.id AS user_id,
      u.email::text,
      s.plan_type::text,
      s.billing_interval,
      s.plan_amount_paid,
      (CASE WHEN s.billing_interval = 'year' THEN ROUND(s.plan_amount_paid / 12.0) ELSE s.plan_amount_paid END) AS mrr_contribution_cents,
      s.started_at
    FROM public.user_subscriptions s
    JOIN auth.users u ON u.id = s.user_id
    WHERE s.status = 'active'
      AND NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id AND r.role = 'admin')
    ORDER BY s.started_at DESC
    LIMIT 300
  ) t;

  SELECT COALESCE(jsonb_agg(t), '[]'::jsonb) INTO v_cancellations
  FROM (
    SELECT u.id AS user_id, u.email::text, s.plan_type::text, s.status, s.updated_at
    FROM public.user_subscriptions s
    JOIN auth.users u ON u.id = s.user_id
    WHERE s.status IN ('cancelled', 'refunded', 'disputed')
      AND s.updated_at > now() - interval '30 days'
      AND NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id AND r.role = 'admin')
    ORDER BY s.updated_at DESC
    LIMIT 300
  ) t;

  RETURN jsonb_build_object(
    'users', v_users,
    'new_signups', v_new_signups,
    'active_subscriptions', v_active_subscriptions,
    'cancellations', v_cancellations
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_get_overview_details() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_get_overview_details() FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_get_overview_details() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_overview_details() TO service_role;
