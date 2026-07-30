-- Churn rate real: cancelamentos_30d ÷ pagantes ativos hoje, não só a
-- contagem absoluta de cancelamentos (que sozinha não diz se é grave ou
-- irrelevante frente ao tamanho da base). Mesma assinatura de antes
-- (sem parâmetros) — CREATE OR REPLACE preserva os grants já existentes.
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
  v_paying_active integer;
  v_churn_rate_pct numeric;
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

  -- Base de comparação: assinantes pagantes ativos hoje (Professional +
  -- Premium). Trial fica fora — churn de trial é uma métrica diferente
  -- (conversão), não cancelamento de receita.
  SELECT count(*) INTO v_paying_active
  FROM public.user_subscriptions s
  WHERE s.status = 'active'
    AND s.plan_type IN ('professional', 'premium')
    AND NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = s.user_id AND r.role = 'admin');

  v_churn_rate_pct := CASE
    WHEN v_paying_active > 0 THEN ROUND((v_cancellations_30d::numeric / v_paying_active) * 100, 1)
    ELSE 0
  END;

  RETURN jsonb_build_object(
    'total_users', v_total_users,
    'new_signups_30d', v_new_signups_30d,
    'active_by_plan', COALESCE(v_active_by_plan, '{}'::jsonb),
    'mrr_cents', ROUND(v_mrr_cents),
    'cancellations_30d', v_cancellations_30d,
    'churn_rate_pct', v_churn_rate_pct,
    'generated_at', now()
  );
END;
$$;
