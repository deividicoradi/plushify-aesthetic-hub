-- get_public_services() retornava os serviços de TODOS os profissionais
-- cadastrados no Plushify misturados, sem nenhum filtro por salão — a página
-- pública de agendamento (/agendar) não tinha como isolar um profissional do
-- outro. Passa a exigir p_user_id, escopando a lista ao salão do link
-- compartilhado. get_public_available_slots e create_public_booking já eram
-- seguras (resolvem o profissional a partir do service_id), não precisam mudar.

DROP FUNCTION IF EXISTS public.get_public_services();

CREATE OR REPLACE FUNCTION public.get_public_services(p_user_id uuid)
RETURNS TABLE(id uuid, name text, description text, price numeric, duration integer, category text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT s.id, s.name, s.description, s.price, s.duration, s.category
  FROM public.services s
  WHERE s.active = true AND s.user_id = p_user_id
  ORDER BY s.name;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_services(uuid) TO anon, authenticated, service_role;
