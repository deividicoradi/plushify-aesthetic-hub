-- Filtro por plano e status na lista de Clientes — até aqui só dava pra
-- buscar por e-mail, sem jeito de isolar "só trial" ou "só cancelados" pra
-- investigar padrão. Assinatura muda (2 parâmetros novos), então precisa
-- dropar a versão anterior antes do CREATE OR REPLACE.
DROP FUNCTION IF EXISTS public.admin_list_customers(integer, integer, text);

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
