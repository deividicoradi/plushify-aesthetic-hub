-- Busca por e-mail na listagem de clientes do painel admin. CREATE OR
-- REPLACE com um parâmetro novo (p_search) muda a assinatura da função —
-- cria um objeto novo no Postgres com grants padrão, então dropamos a
-- versão antiga de 2 parâmetros e reafirmamos os grants explicitamente
-- (mesmo cuidado já documentado no incidente de start_subscription).
DROP FUNCTION IF EXISTS public.admin_list_customers(integer, integer);

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
  LEFT JOIN public.user_subscriptions s ON s.user_id = u.id AND s.status IN ('active', 'trial_active')
  WHERE NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id AND r.role = 'admin')
    AND (p_search IS NULL OR p_search = '' OR u.email ILIKE '%' || p_search || '%')
  ORDER BY u.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_list_customers(integer, integer, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_list_customers(integer, integer, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_list_customers(integer, integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_customers(integer, integer, text) TO service_role;
