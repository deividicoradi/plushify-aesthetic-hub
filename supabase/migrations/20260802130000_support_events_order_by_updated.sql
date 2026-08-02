-- admin_list_support_events ordenava por prioridade primeiro (urgente >
-- atenção > normal) e só depois por data — por isso a lista parecia
-- embaralhada pro admin, que esperava sempre o chamado mais recente
-- (criado OU atualizado, ex: marcado como concluído agora) no topo.
-- Troca pra ordenar só por updated_at DESC.

CREATE OR REPLACE FUNCTION public.admin_list_support_events(
  p_status text DEFAULT NULL,
  p_limit integer DEFAULT 100,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  event_number integer,
  user_email text,
  title text,
  description text,
  event_type text,
  status text,
  priority text,
  admin_response text,
  created_at timestamptz,
  updated_at timestamptz,
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
  SELECT e.id, e.event_number, u.email::text, e.title, e.description, e.event_type, e.status, e.priority, e.admin_response,
         e.created_at, e.updated_at, count(*) OVER ()::bigint AS total_count
  FROM public.support_events e
  JOIN auth.users u ON u.id = e.user_id
  WHERE p_status IS NULL OR e.status = p_status
  ORDER BY e.updated_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_list_support_events(text, integer, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_list_support_events(text, integer, integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_list_support_events(text, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_support_events(text, integer, integer) TO service_role;
