-- admin_list_prospects não tinha filtro por período — a lista do Comercial
-- só crescia infinitamente (200 registros fixos, sem paginação de fato).
-- Adiciona p_start_date/p_end_date (filtra por created_at, o momento em
-- que o prospect foi cadastrado/chamado) pro front oferecer Hoje/Semana/
-- Mês/Ano/Tudo, reaproveitando o p_limit/p_offset que já existiam.

DROP FUNCTION IF EXISTS public.admin_list_prospects(text, integer, integer);

CREATE OR REPLACE FUNCTION public.admin_list_prospects(
  p_status text DEFAULT NULL,
  p_limit integer DEFAULT 200,
  p_offset integer DEFAULT 0,
  p_start_date timestamptz DEFAULT NULL,
  p_end_date timestamptz DEFAULT NULL
)
RETURNS TABLE(
  id uuid, name text, email text, phone text, origin text, contact_channel text,
  plan_interest text, estimated_value numeric, status text, loss_reason text,
  next_action_note text, next_action_date date, last_contact_at timestamptz,
  converted_user_id uuid, converted_user_email text, converted_at timestamptz,
  first_payment_value numeric, notes text, prospector_id uuid, prospector_name text,
  created_at timestamptz, updated_at timestamptz, total_count bigint
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
  SELECT p.id, p.name, p.email, p.phone, p.origin, p.contact_channel,
         p.plan_interest, p.estimated_value, p.status, p.loss_reason,
         p.next_action_note, p.next_action_date, p.last_contact_at,
         p.converted_user_id, u.email::text AS converted_user_email, p.converted_at,
         p.first_payment_value, p.notes, p.prospector_id, pr.name AS prospector_name,
         p.created_at, p.updated_at, count(*) OVER ()::bigint AS total_count
  FROM public.prospects p
  LEFT JOIN public.prospectors pr ON pr.id = p.prospector_id
  LEFT JOIN auth.users u ON u.id = p.converted_user_id
  WHERE (p_status IS NULL OR p.status = p_status)
    AND (p_start_date IS NULL OR p.created_at >= p_start_date)
    AND (p_end_date IS NULL OR p.created_at <= p_end_date)
  ORDER BY p.updated_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_list_prospects(text, integer, integer, timestamptz, timestamptz) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_list_prospects(text, integer, integer, timestamptz, timestamptz) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_list_prospects(text, integer, integer, timestamptz, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_prospects(text, integer, integer, timestamptz, timestamptz) TO service_role;
