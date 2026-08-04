-- admin_convert_prospect nunca recebia o vínculo com a conta real
-- (converted_user_id ficava sempre NULL) porque o formulário só pedia
-- o valor da primeira cobrança. Troca o parâmetro de uuid pra e-mail
-- (mais fácil de digitar/lembrar do que um UUID) e resolve o user_id
-- internamente contra auth.users.

DROP FUNCTION IF EXISTS public.admin_convert_prospect(uuid, uuid, numeric);

CREATE OR REPLACE FUNCTION public.admin_convert_prospect(
  p_id uuid,
  p_converted_email text DEFAULT NULL,
  p_first_payment_value numeric DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;

  IF p_converted_email IS NOT NULL AND length(trim(p_converted_email)) > 0 THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = lower(trim(p_converted_email));
    IF v_user_id IS NULL THEN
      RAISE EXCEPTION 'Nenhuma conta encontrada com o e-mail %', p_converted_email;
    END IF;
  END IF;

  UPDATE public.prospects
  SET status = 'convertido',
      converted_user_id = v_user_id,
      converted_at = now(),
      first_payment_value = p_first_payment_value
  WHERE id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prospect não encontrado';
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_convert_prospect(uuid, text, numeric) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_convert_prospect(uuid, text, numeric) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_convert_prospect(uuid, text, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_convert_prospect(uuid, text, numeric) TO service_role;

-- admin_list_prospects também precisa mostrar o e-mail da conta vinculada
-- (converted_user_id sozinho não é legível na tela).
DROP FUNCTION IF EXISTS public.admin_list_prospects(text, integer, integer);
CREATE OR REPLACE FUNCTION public.admin_list_prospects(
  p_status text DEFAULT NULL,
  p_limit integer DEFAULT 200,
  p_offset integer DEFAULT 0
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
  WHERE p_status IS NULL OR p.status = p_status
  ORDER BY p.updated_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_list_prospects(text, integer, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_list_prospects(text, integer, integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_list_prospects(text, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_prospects(text, integer, integer) TO service_role;
