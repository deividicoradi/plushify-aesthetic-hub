-- Trava de duplicidade de prospect: compara telefone (só dígitos) e
-- e-mail (case-insensitive) contra os já cadastrados, em qualquer
-- status — duplicidade é sobre "é a mesma pessoa/negócio", não sobre
-- o estágio do funil, então nem um prospect "perdido" libera recadastro
-- automático. Bloqueia no create/update (não só avisa na tela) e
-- também oferece uma função de checagem prévia pro frontend avisar
-- antes de o admin nem preencher o resto do formulário.

CREATE OR REPLACE FUNCTION public.admin_find_duplicate_prospect(
  p_phone text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_exclude_id uuid DEFAULT NULL
)
RETURNS TABLE(id uuid, name text, status text, matched_field text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_phone_digits text;
  v_email text;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;

  v_phone_digits := NULLIF(regexp_replace(COALESCE(p_phone, ''), '[^0-9]', '', 'g'), '');
  v_email := NULLIF(lower(trim(COALESCE(p_email, ''))), '');

  IF v_phone_digits IS NULL AND v_email IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT p.id, p.name, p.status,
         CASE WHEN v_phone_digits IS NOT NULL AND regexp_replace(COALESCE(p.phone, ''), '[^0-9]', '', 'g') = v_phone_digits
              THEN 'phone' ELSE 'email' END AS matched_field
  FROM public.prospects p
  WHERE (p_exclude_id IS NULL OR p.id != p_exclude_id)
    AND (
      (v_phone_digits IS NOT NULL AND regexp_replace(COALESCE(p.phone, ''), '[^0-9]', '', 'g') = v_phone_digits)
      OR (v_email IS NOT NULL AND lower(trim(COALESCE(p.email, ''))) = v_email)
    )
  LIMIT 1;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_find_duplicate_prospect(text, text, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_find_duplicate_prospect(text, text, uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_find_duplicate_prospect(text, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_find_duplicate_prospect(text, text, uuid) TO service_role;

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
  p_prospector_id uuid DEFAULT NULL
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

  INSERT INTO public.prospects (name, phone, email, origin, contact_channel, plan_interest, estimated_value, notes, prospector_id, created_by)
  VALUES (p_name, p_phone, p_email, p_origin, p_contact_channel, p_plan_interest, p_estimated_value, p_notes, p_prospector_id, auth.uid())
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
  p_prospector_id uuid DEFAULT NULL
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
      estimated_value = p_estimated_value, notes = p_notes, prospector_id = p_prospector_id
  WHERE id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prospect não encontrado';
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_create_prospect(text, text, text, text, text, text, numeric, text, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_create_prospect(text, text, text, text, text, text, numeric, text, uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_create_prospect(text, text, text, text, text, text, numeric, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_create_prospect(text, text, text, text, text, text, numeric, text, uuid) TO service_role;

REVOKE EXECUTE ON FUNCTION public.admin_update_prospect(uuid, text, text, text, text, text, text, numeric, text, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_update_prospect(uuid, text, text, text, text, text, text, numeric, text, uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_update_prospect(uuid, text, text, text, text, text, text, numeric, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_prospect(uuid, text, text, text, text, text, text, numeric, text, uuid) TO service_role;
