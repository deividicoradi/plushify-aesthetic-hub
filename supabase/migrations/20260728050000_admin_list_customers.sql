-- Lista de clientes pro painel administrativo — mesma proteção de
-- admin_get_overview_stats (confere has_role ANTES de tocar em qualquer
-- linha), exclui contas admin da listagem, e devolve só os campos
-- necessários pra gestão (nunca CPF, nunca dado de cartão — isso nem
-- passa pelo nosso banco, fica só na AbacatePay).
CREATE OR REPLACE FUNCTION public.admin_list_customers(
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
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
    count(*) OVER ()::bigint AS total_count
  FROM auth.users u
  LEFT JOIN public.user_subscriptions s ON s.user_id = u.id
  WHERE NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id AND r.role = 'admin')
  ORDER BY u.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_list_customers(integer, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_list_customers(integer, integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_list_customers(integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_customers(integer, integer) TO service_role;
