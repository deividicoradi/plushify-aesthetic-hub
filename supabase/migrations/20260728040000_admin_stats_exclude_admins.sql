-- admin_get_overview_stats() contava a própria conta admin (dono) junto com
-- os clientes reais nas métricas — "usuários totais", "novos cadastros",
-- "assinaturas ativas por plano" e "cancelamentos" ficavam infladas por
-- quem administra o sistema, não usa como negócio.

CREATE OR REPLACE FUNCTION public.admin_get_overview_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_users integer;
  v_new_signups_30d integer;
  v_active_by_plan jsonb;
  v_mrr_cents numeric;
  v_cancellations_30d integer;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;

  SELECT count(*) INTO v_total_users
  FROM auth.users u
  WHERE NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id AND r.role = 'admin');

  SELECT count(*) INTO v_new_signups_30d
  FROM auth.users u
  WHERE u.created_at > now() - interval '30 days'
    AND NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id AND r.role = 'admin');

  SELECT jsonb_object_agg(plan_type, plan_count) INTO v_active_by_plan
  FROM (
    SELECT s.plan_type::text AS plan_type, count(*) AS plan_count
    FROM public.user_subscriptions s
    WHERE s.status = 'active'
      AND NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = s.user_id AND r.role = 'admin')
    GROUP BY s.plan_type
  ) t;

  SELECT COALESCE(SUM(
    CASE
      WHEN s.billing_interval = 'year' THEN s.plan_amount_paid / 12.0
      ELSE s.plan_amount_paid
    END
  ), 0) INTO v_mrr_cents
  FROM public.user_subscriptions s
  WHERE s.status = 'active'
    AND s.plan_amount_paid IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = s.user_id AND r.role = 'admin');

  SELECT count(*) INTO v_cancellations_30d
  FROM public.user_subscriptions s
  WHERE s.status IN ('cancelled', 'refunded', 'disputed')
    AND s.updated_at > now() - interval '30 days'
    AND NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = s.user_id AND r.role = 'admin');

  RETURN jsonb_build_object(
    'total_users', v_total_users,
    'new_signups_30d', v_new_signups_30d,
    'active_by_plan', COALESCE(v_active_by_plan, '{}'::jsonb),
    'mrr_cents', ROUND(v_mrr_cents),
    'cancellations_30d', v_cancellations_30d,
    'generated_at', now()
  );
END;
$$;
