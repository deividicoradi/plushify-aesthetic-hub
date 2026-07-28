-- Auditoria de upgrades pro painel administrativo — lê plan_upgrade_consents
-- (criada em 2026-07-28 pra provar o aceite de cada upgrade) com o mesmo
-- padrão de proteção das outras RPCs admin.
CREATE OR REPLACE FUNCTION public.admin_list_upgrade_consents(
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  email text,
  previous_plan_type text,
  new_plan_type text,
  credit_cents integer,
  new_price_cents integer,
  charge_now_cents integer,
  accepted_at timestamptz,
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
    c.id,
    u.email::text,
    c.previous_plan_type,
    c.new_plan_type,
    c.credit_cents,
    c.new_price_cents,
    c.charge_now_cents,
    c.accepted_at,
    count(*) OVER ()::bigint AS total_count
  FROM public.plan_upgrade_consents c
  JOIN auth.users u ON u.id = c.user_id
  ORDER BY c.accepted_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_list_upgrade_consents(integer, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_list_upgrade_consents(integer, integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_list_upgrade_consents(integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_upgrade_consents(integer, integer) TO service_role;
