-- Série temporal de receita/novos/cancelamentos pro gráfico de Visão Geral
-- do admin — hoje só existe o instantâneo "agora", sem visão de tendência.
-- MRR de cada mês é medido no ÚLTIMO INSTANTE do mês (snapshot), olhando
-- quem tinha assinatura ativa iniciada até aquele ponto e ainda não
-- cancelada/expirada até lá — aproximação razoável sem precisar reconstruir
-- histórico completo de billing.
CREATE OR REPLACE FUNCTION public.admin_get_revenue_series(p_months integer DEFAULT 6)
RETURNS TABLE(
  month_start date,
  mrr_cents numeric,
  new_signups integer,
  cancellations integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;

  IF p_months IS NULL OR p_months <= 0 OR p_months > 24 THEN
    p_months := 6;
  END IF;

  RETURN QUERY
  WITH months AS (
    SELECT date_trunc('month', now())::date - (n || ' months')::interval AS month_start
    FROM generate_series(0, p_months - 1) AS n
  ),
  bounds AS (
    SELECT
      m.month_start::date AS month_start,
      (m.month_start + interval '1 month' - interval '1 second') AS month_end
    FROM months m
  )
  SELECT
    b.month_start,
    COALESCE((
      SELECT SUM(
        CASE WHEN s.billing_interval = 'year' THEN s.plan_amount_paid / 12.0 ELSE s.plan_amount_paid END
      )
      FROM public.user_subscriptions s
      JOIN auth.users u ON u.id = s.user_id
      WHERE s.plan_amount_paid IS NOT NULL
        AND s.started_at <= b.month_end
        AND (s.status NOT IN ('cancelled', 'canceled', 'refunded', 'disputed') OR s.updated_at > b.month_end)
        AND NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id AND r.role = 'admin')
    ), 0) AS mrr_cents,
    (
      SELECT count(*)::integer FROM auth.users u
      WHERE u.created_at BETWEEN b.month_start AND b.month_end
        AND NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id AND r.role = 'admin')
    ) AS new_signups,
    (
      SELECT count(*)::integer FROM public.user_subscriptions s
      JOIN auth.users u ON u.id = s.user_id
      WHERE s.status IN ('cancelled', 'canceled', 'refunded', 'disputed')
        AND s.updated_at BETWEEN b.month_start AND b.month_end
        AND NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id AND r.role = 'admin')
    ) AS cancellations
  FROM bounds b
  ORDER BY b.month_start ASC;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_get_revenue_series(integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_get_revenue_series(integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_get_revenue_series(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_revenue_series(integer) TO service_role;
