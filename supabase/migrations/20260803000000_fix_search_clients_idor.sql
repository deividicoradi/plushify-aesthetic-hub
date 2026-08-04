-- search_clients ficou de fora da correção de segurança aplicada a
-- get_dashboard_summary (20250907194915): continuava SECURITY DEFINER,
-- recebendo target_user_id do client sem comparar com auth.uid() e sem
-- REVOKE de PUBLIC/anon. Qualquer usuário autenticado podia passar o
-- user_id de outro tenant e ler nome/e-mail/telefone dos clientes dele.

CREATE OR REPLACE FUNCTION public.search_clients(target_user_id uuid, search_term text DEFAULT NULL)
RETURNS TABLE(
  id uuid,
  name text,
  email text,
  phone text,
  status text,
  last_visit timestamp with time zone
)
LANGUAGE plpgsql
STABLE SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF target_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: Cannot access other users data';
  END IF;

  RETURN QUERY
  SELECT c.id, c.name, c.email, c.phone, c.status, c.last_visit
  FROM public.clients c
  WHERE c.user_id = target_user_id
    AND (search_term IS NULL OR c.name ILIKE '%' || search_term || '%' OR c.email ILIKE '%' || search_term || '%')
  ORDER BY c.name ASC;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.search_clients(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.search_clients(uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.search_clients(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_clients(uuid, text) TO service_role;
