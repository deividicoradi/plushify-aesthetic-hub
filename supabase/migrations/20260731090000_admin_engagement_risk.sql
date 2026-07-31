-- Sinal de engajamento/risco de churn na lista de Clientes: até aqui só
-- dava pra ver "quantos clientes", nunca "quais estão sumidos" (não logam
-- há muito tempo apesar de pagar). Mesma assinatura de admin_list_customers
-- (3 parâmetros desde a migration de busca) — CREATE OR REPLACE preserva
-- os grants.
CREATE OR REPLACE FUNCTION public.admin_list_customers(
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0,
  p_search text DEFAULT NULL
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
    count(*) OVER ()::bigint AS total_count
  FROM auth.users u
  LEFT JOIN public.user_subscriptions s ON s.user_id = u.id AND s.status IN ('active', 'trial_active')
  WHERE NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id AND r.role = 'admin')
    AND (p_search IS NULL OR p_search = '' OR u.email ILIKE '%' || p_search || '%')
  ORDER BY u.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- Contagem de clientes pagantes ativos sem login recente (>14 dias, ou
-- nunca logaram) pro card de risco na Visão Geral.
CREATE OR REPLACE FUNCTION public.admin_get_engagement_risk()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_at_risk_count integer;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;

  SELECT count(*) INTO v_at_risk_count
  FROM public.user_subscriptions s
  JOIN auth.users u ON u.id = s.user_id
  WHERE s.status = 'active'
    AND s.plan_type IN ('professional', 'premium')
    AND (u.last_sign_in_at IS NULL OR u.last_sign_in_at < now() - interval '14 days')
    AND NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id AND r.role = 'admin');

  RETURN jsonb_build_object('at_risk_count', v_at_risk_count, 'threshold_days', 14);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_get_engagement_risk() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_get_engagement_risk() FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_get_engagement_risk() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_engagement_risk() TO service_role;
