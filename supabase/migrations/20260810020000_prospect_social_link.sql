-- Muitos prospects só têm o perfil de rede social (Instagram etc), sem
-- telefone nem e-mail ainda. Adiciona social_link (URL do perfil) como
-- mais um jeito de contato/identificação.

ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS social_link text;

DROP FUNCTION IF EXISTS public.admin_list_prospects(text, integer, integer, timestamptz, timestamptz);
CREATE OR REPLACE FUNCTION public.admin_list_prospects(
  p_status text DEFAULT NULL,
  p_limit integer DEFAULT 200,
  p_offset integer DEFAULT 0,
  p_start_date timestamptz DEFAULT NULL,
  p_end_date timestamptz DEFAULT NULL
)
RETURNS TABLE(
  id uuid, name text, email text, phone text, social_link text, origin text, contact_channel text,
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
  SELECT p.id, p.name, p.email, p.phone, p.social_link, p.origin, p.contact_channel,
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

DROP FUNCTION IF EXISTS public.admin_create_prospect(text, text, text, text, text, text, numeric, text, uuid);
CREATE OR REPLACE FUNCTION public.admin_create_prospect(
  p_name text,
  p_phone text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_origin text DEFAULT NULL,
  p_contact_channel text DEFAULT NULL,
  p_plan_interest text DEFAULT NULL,
  p_estimated_value numeric DEFAULT NULL,
  p_notes text DEFAULT NULL,
  p_prospector_id uuid DEFAULT NULL,
  p_social_link text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_dup RECORD;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;

  SELECT * INTO v_dup FROM public.admin_find_duplicate_prospect(p_phone, p_email, NULL) LIMIT 1;
  IF FOUND THEN
    RAISE EXCEPTION 'Já existe um prospect cadastrado com esse % (%): %', v_dup.matched_field, v_dup.status, v_dup.name
      USING ERRCODE = 'unique_violation';
  END IF;

  INSERT INTO public.prospects (name, phone, email, origin, contact_channel, plan_interest, estimated_value, notes, prospector_id, social_link, created_by)
  VALUES (p_name, p_phone, p_email, p_origin, p_contact_channel, p_plan_interest, p_estimated_value, p_notes, p_prospector_id, p_social_link, auth.uid())
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

DROP FUNCTION IF EXISTS public.admin_update_prospect(uuid, text, text, text, text, text, text, numeric, text, uuid);
CREATE OR REPLACE FUNCTION public.admin_update_prospect(
  p_id uuid,
  p_name text,
  p_phone text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_origin text DEFAULT NULL,
  p_contact_channel text DEFAULT NULL,
  p_plan_interest text DEFAULT NULL,
  p_estimated_value numeric DEFAULT NULL,
  p_notes text DEFAULT NULL,
  p_prospector_id uuid DEFAULT NULL,
  p_social_link text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_dup RECORD;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;

  SELECT * INTO v_dup FROM public.admin_find_duplicate_prospect(p_phone, p_email, p_id) LIMIT 1;
  IF FOUND THEN
    RAISE EXCEPTION 'Já existe um prospect cadastrado com esse % (%): %', v_dup.matched_field, v_dup.status, v_dup.name
      USING ERRCODE = 'unique_violation';
  END IF;

  UPDATE public.prospects
  SET name = p_name, phone = p_phone, email = p_email, origin = p_origin,
      contact_channel = p_contact_channel, plan_interest = p_plan_interest,
      estimated_value = p_estimated_value, notes = p_notes, prospector_id = p_prospector_id,
      social_link = p_social_link
  WHERE id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prospect não encontrado';
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_create_prospect(text, text, text, text, text, text, numeric, text, uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_create_prospect(text, text, text, text, text, text, numeric, text, uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_create_prospect(text, text, text, text, text, text, numeric, text, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_create_prospect(text, text, text, text, text, text, numeric, text, uuid, text) TO service_role;

REVOKE EXECUTE ON FUNCTION public.admin_update_prospect(uuid, text, text, text, text, text, text, numeric, text, uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_update_prospect(uuid, text, text, text, text, text, text, numeric, text, uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_update_prospect(uuid, text, text, text, text, text, text, numeric, text, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_prospect(uuid, text, text, text, text, text, text, numeric, text, uuid, text) TO service_role;
