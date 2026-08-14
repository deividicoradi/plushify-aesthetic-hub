-- Continuação da correção do item 1 do bug bounty (schema internal, ver
-- 20260814180000): move as tabelas do módulo Comercial (prospects/
-- prospect_interactions/prospectors) pro schema internal, fora da lista de
-- exposed schemas do PostgREST. Definições abaixo copiadas literalmente do
-- estado LIVE em produção (via pg_get_functiondef), só trocando as
-- referências de public.prospects/prospect_interactions/prospectors para
-- internal.* — nenhuma lógica muda.

ALTER TABLE public.prospects SET SCHEMA internal;
ALTER TABLE public.prospect_interactions SET SCHEMA internal;
ALTER TABLE public.prospectors SET SCHEMA internal;

CREATE OR REPLACE FUNCTION public.touch_prospect_last_contact()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE internal.prospects
  SET last_contact_at = NEW.occurred_at
  WHERE id = NEW.prospect_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_find_duplicate_prospect(p_phone text DEFAULT NULL::text, p_email text DEFAULT NULL::text, p_exclude_id uuid DEFAULT NULL::uuid)
RETURNS TABLE(id uuid, name text, status text, matched_field text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
         CASE WHEN v_phone_digits IS NOT NULL AND regexp_replace(COALESCE(p.phone, ''), '[^0-9]', '', 'g') = v_phone_digits THEN 'phone' ELSE 'email' END AS matched_field
  FROM internal.prospects p
  WHERE (p_exclude_id IS NULL OR p.id != p_exclude_id)
    AND (
      (v_phone_digits IS NOT NULL AND regexp_replace(COALESCE(p.phone, ''), '[^0-9]', '', 'g') = v_phone_digits)
      OR (v_email IS NOT NULL AND lower(trim(COALESCE(p.email, ''))) = v_email)
    )
  LIMIT 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_create_prospect(p_name text, p_phone text DEFAULT NULL::text, p_email text DEFAULT NULL::text, p_origin text DEFAULT NULL::text, p_contact_channel text DEFAULT NULL::text, p_plan_interest text DEFAULT NULL::text, p_estimated_value numeric DEFAULT NULL::numeric, p_notes text DEFAULT NULL::text, p_prospector_id uuid DEFAULT NULL::uuid, p_social_link text DEFAULT NULL::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
    RAISE EXCEPTION 'Já existe um prospect cadastrado com esse % (%): %', v_dup.matched_field, v_dup.status, v_dup.name USING ERRCODE = 'unique_violation';
  END IF;
  INSERT INTO internal.prospects (name, phone, email, origin, contact_channel, plan_interest, estimated_value, notes, prospector_id, social_link, created_by)
  VALUES (p_name, p_phone, p_email, p_origin, p_contact_channel, p_plan_interest, p_estimated_value, p_notes, p_prospector_id, p_social_link, auth.uid())
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_prospect(p_id uuid, p_name text, p_phone text DEFAULT NULL::text, p_email text DEFAULT NULL::text, p_origin text DEFAULT NULL::text, p_contact_channel text DEFAULT NULL::text, p_plan_interest text DEFAULT NULL::text, p_estimated_value numeric DEFAULT NULL::numeric, p_notes text DEFAULT NULL::text, p_prospector_id uuid DEFAULT NULL::uuid, p_social_link text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_dup RECORD;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;
  SELECT * INTO v_dup FROM public.admin_find_duplicate_prospect(p_phone, p_email, p_id) LIMIT 1;
  IF FOUND THEN
    RAISE EXCEPTION 'Já existe um prospect cadastrado com esse % (%): %', v_dup.matched_field, v_dup.status, v_dup.name USING ERRCODE = 'unique_violation';
  END IF;
  UPDATE internal.prospects
  SET name = p_name, phone = p_phone, email = p_email, origin = p_origin,
      contact_channel = p_contact_channel, plan_interest = p_plan_interest,
      estimated_value = p_estimated_value, notes = p_notes,
      prospector_id = p_prospector_id, social_link = p_social_link
  WHERE id = p_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prospect não encontrado';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_prospect(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;
  DELETE FROM internal.prospects WHERE id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_prospect_status(p_id uuid, p_status text, p_loss_reason text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;
  IF p_status NOT IN ('novo','contatado','interessado','negociando','sem_retorno','convertido','perdido') THEN
    RAISE EXCEPTION 'Status inválido';
  END IF;
  IF p_status = 'perdido' AND (p_loss_reason IS NULL OR length(trim(p_loss_reason)) = 0) THEN
    RAISE EXCEPTION 'Motivo da perda é obrigatório';
  END IF;
  UPDATE internal.prospects
  SET status = p_status,
      loss_reason = CASE WHEN p_status = 'perdido' THEN p_loss_reason ELSE loss_reason END
  WHERE id = p_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prospect não encontrado';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_convert_prospect(p_id uuid, p_converted_email text DEFAULT NULL::text, p_first_payment_value numeric DEFAULT NULL::numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
  UPDATE internal.prospects
  SET status = 'convertido', converted_user_id = v_user_id, converted_at = now(), first_payment_value = p_first_payment_value
  WHERE id = p_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prospect não encontrado';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_prospects(p_status text DEFAULT NULL::text, p_limit integer DEFAULT 200, p_offset integer DEFAULT 0, p_start_date timestamp with time zone DEFAULT NULL::timestamp with time zone, p_end_date timestamp with time zone DEFAULT NULL::timestamp with time zone)
RETURNS TABLE(id uuid, name text, email text, phone text, social_link text, origin text, contact_channel text, plan_interest text, estimated_value numeric, status text, loss_reason text, next_action_note text, next_action_date date, last_contact_at timestamp with time zone, converted_user_id uuid, converted_user_email text, converted_at timestamp with time zone, first_payment_value numeric, notes text, prospector_id uuid, prospector_name text, created_at timestamp with time zone, updated_at timestamp with time zone, total_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
  FROM internal.prospects p
  LEFT JOIN internal.prospectors pr ON pr.id = p.prospector_id
  LEFT JOIN auth.users u ON u.id = p.converted_user_id
  WHERE (p_status IS NULL OR p.status = p_status)
    AND (p_start_date IS NULL OR p.created_at >= p_start_date)
    AND (p_end_date IS NULL OR p.created_at <= p_end_date)
  ORDER BY p.updated_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_prospect_metrics(p_start_date date, p_end_date date)
RETURNS TABLE(total_prospected bigint, total_converted bigint, total_lost bigint, total_open bigint, conversion_rate numeric, loss_rate numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;
  RETURN QUERY
  SELECT
    COUNT(*)::bigint AS total_prospected,
    COUNT(*) FILTER (WHERE status = 'convertido')::bigint AS total_converted,
    COUNT(*) FILTER (WHERE status = 'perdido')::bigint AS total_lost,
    COUNT(*) FILTER (WHERE status NOT IN ('convertido','perdido'))::bigint AS total_open,
    CASE WHEN COUNT(*) = 0 THEN 0 ELSE ROUND(COUNT(*) FILTER (WHERE status = 'convertido')::numeric / COUNT(*)::numeric * 100, 1) END AS conversion_rate,
    CASE WHEN COUNT(*) = 0 THEN 0 ELSE ROUND(COUNT(*) FILTER (WHERE status = 'perdido')::numeric / COUNT(*)::numeric * 100, 1) END AS loss_rate
  FROM internal.prospects
  WHERE created_at::date BETWEEN p_start_date AND p_end_date;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_stale_prospects()
RETURNS TABLE(id uuid, name text, phone text, status text, last_contact_at timestamp with time zone, days_since_contact integer, urgency text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;
  RETURN QUERY
  SELECT p.id, p.name, p.phone, p.status, p.last_contact_at,
         EXTRACT(DAY FROM now() - COALESCE(p.last_contact_at, p.created_at))::integer AS days_since_contact,
         CASE
           WHEN now() - COALESCE(p.last_contact_at, p.created_at) >= INTERVAL '180 days' THEN 'critico'
           WHEN now() - COALESCE(p.last_contact_at, p.created_at) >= INTERVAL '90 days' THEN 'atencao'
         END AS urgency
  FROM internal.prospects p
  WHERE p.status NOT IN ('convertido','perdido')
    AND now() - COALESCE(p.last_contact_at, p.created_at) >= INTERVAL '90 days'
  ORDER BY COALESCE(p.last_contact_at, p.created_at) ASC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_add_prospect_interaction(p_prospect_id uuid, p_channel text, p_note text DEFAULT NULL::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM internal.prospects WHERE id = p_prospect_id) THEN
    RAISE EXCEPTION 'Prospect não encontrado';
  END IF;
  INSERT INTO internal.prospect_interactions (prospect_id, channel, note, created_by)
  VALUES (p_prospect_id, p_channel, p_note, auth.uid())
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_prospect_interactions(p_prospect_id uuid)
RETURNS TABLE(id uuid, prospect_id uuid, channel text, note text, occurred_at timestamp with time zone, created_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;
  RETURN QUERY
  SELECT i.id, i.prospect_id, i.channel, i.note, i.occurred_at, i.created_at
  FROM internal.prospect_interactions i
  WHERE i.prospect_id = p_prospect_id
  ORDER BY i.occurred_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_create_prospector(p_name text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;
  INSERT INTO internal.prospectors (name, created_by) VALUES (p_name, auth.uid()) RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_prospector(p_id uuid, p_name text, p_active boolean DEFAULT true)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;
  UPDATE internal.prospectors SET name = p_name, active = p_active WHERE id = p_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prospectador não encontrado';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_prospector(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;
  -- Não apaga o prospector se tiver prospects vinculados (evita perder
  -- a autoria histórica) — só desativa. Só apaga de fato quem nunca
  -- prospectou nada.
  IF EXISTS (SELECT 1 FROM internal.prospects WHERE prospector_id = p_id) THEN
    UPDATE internal.prospectors SET active = false WHERE id = p_id;
  ELSE
    DELETE FROM internal.prospectors WHERE id = p_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_prospectors()
RETURNS TABLE(id uuid, name text, active boolean, created_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;
  RETURN QUERY SELECT p.id, p.name, p.active, p.created_at FROM internal.prospectors p ORDER BY p.active DESC, p.name ASC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_prospector_stats(p_start_date date, p_end_date date)
RETURNS TABLE(prospector_id uuid, prospector_name text, total_prospected bigint, total_converted bigint, total_lost bigint, conversion_rate numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;
  RETURN QUERY
  SELECT pr.id, pr.name,
         COUNT(p.id)::bigint AS total_prospected,
         COUNT(p.id) FILTER (WHERE p.status = 'convertido')::bigint AS total_converted,
         COUNT(p.id) FILTER (WHERE p.status = 'perdido')::bigint AS total_lost,
         CASE WHEN COUNT(p.id) = 0 THEN 0 ELSE ROUND(COUNT(p.id) FILTER (WHERE p.status = 'convertido')::numeric / COUNT(p.id)::numeric * 100, 1) END AS conversion_rate
  FROM internal.prospectors pr
  LEFT JOIN internal.prospects p ON p.prospector_id = pr.id AND p.created_at::date BETWEEN p_start_date AND p_end_date
  GROUP BY pr.id, pr.name
  ORDER BY total_prospected DESC, pr.name ASC;
END;
$$;
