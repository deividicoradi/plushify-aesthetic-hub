-- Log de acesso dos próprios administradores (IP, quando, ação) — lê
-- auth.audit_log_entries, tabela nativa do Supabase Auth que já registra
-- todo evento de autenticação (login, logout, refresh de token). Filtra só
-- pelos usuários que são admin hoje, e só ações de login/logout — não expõe
-- histórico de login de clientes comuns, só visibilidade de quem acessou
-- o próprio painel administrativo.
CREATE OR REPLACE FUNCTION public.admin_get_admin_login_log(p_limit integer DEFAULT 100)
RETURNS TABLE(
  id uuid,
  admin_email text,
  action text,
  ip_address text,
  created_at timestamptz
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
    l.id,
    u.email::text,
    COALESCE(l.payload->>'action', 'desconhecida') AS action,
    NULLIF(l.ip_address, '')::text AS ip_address,
    l.created_at
  FROM auth.audit_log_entries l
  JOIN auth.users u ON u.id = (l.payload->>'actor_id')::uuid
  WHERE EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id AND r.role = 'admin')
    AND l.payload->>'action' IN ('login', 'logout')
  ORDER BY l.created_at DESC
  LIMIT p_limit;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_get_admin_login_log(integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_get_admin_login_log(integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_get_admin_login_log(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_admin_login_log(integer) TO service_role;
