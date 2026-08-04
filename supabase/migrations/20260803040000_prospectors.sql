-- Quem está prospectando: cadastro simples de pessoas da equipe que
-- fazem prospecção, vinculado a cada prospect, pra medir quem traz/
-- converte mais leads. Mesmo padrão admin-only da tabela prospects
-- (nenhuma policy direta, acesso só via RPC admin_* com has_role).

CREATE TABLE public.prospectors (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  name text NOT NULL CHECK (length(trim(name)) > 0 AND length(name) <= 255),
  active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.prospectors ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.prospectors FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.prospectors TO service_role;

CREATE TRIGGER trg_prospectors_updated_at
BEFORE UPDATE ON public.prospectors
FOR EACH ROW EXECUTE FUNCTION public.touch_prospects_updated_at();

ALTER TABLE public.prospects
  ADD COLUMN prospector_id uuid REFERENCES public.prospectors(id) ON DELETE SET NULL;

CREATE INDEX idx_prospects_prospector_id ON public.prospects(prospector_id);

-- =====================================================
-- CRUD de prospectors
-- =====================================================

CREATE OR REPLACE FUNCTION public.admin_list_prospectors()
RETURNS TABLE(id uuid, name text, active boolean, created_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;

  RETURN QUERY
  SELECT p.id, p.name, p.active, p.created_at
  FROM public.prospectors p
  ORDER BY p.active DESC, p.name ASC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_create_prospector(p_name text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;

  INSERT INTO public.prospectors (name, created_by)
  VALUES (p_name, auth.uid())
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_prospector(
  p_id uuid,
  p_name text,
  p_active boolean DEFAULT true
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;

  UPDATE public.prospectors
  SET name = p_name, active = p_active
  WHERE id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prospectador não encontrado';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_prospector(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;

  -- Não apaga o prospector se tiver prospects vinculados (evita perder
  -- a autoria histórica) — só desativa. Só apaga de fato quem nunca
  -- prospectou nada.
  IF EXISTS (SELECT 1 FROM public.prospects WHERE prospector_id = p_id) THEN
    UPDATE public.prospectors SET active = false WHERE id = p_id;
  ELSE
    DELETE FROM public.prospectors WHERE id = p_id;
  END IF;
END;
$$;

-- =====================================================
-- Ranking de quem mais prospecta/converte, por período
-- =====================================================

CREATE OR REPLACE FUNCTION public.admin_get_prospector_stats(
  p_start_date date,
  p_end_date date
)
RETURNS TABLE(
  prospector_id uuid,
  prospector_name text,
  total_prospected bigint,
  total_converted bigint,
  total_lost bigint,
  conversion_rate numeric
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
    pr.id,
    pr.name,
    COUNT(p.id)::bigint AS total_prospected,
    COUNT(p.id) FILTER (WHERE p.status = 'convertido')::bigint AS total_converted,
    COUNT(p.id) FILTER (WHERE p.status = 'perdido')::bigint AS total_lost,
    CASE WHEN COUNT(p.id) = 0 THEN 0
         ELSE ROUND(COUNT(p.id) FILTER (WHERE p.status = 'convertido')::numeric / COUNT(p.id)::numeric * 100, 1)
    END AS conversion_rate
  FROM public.prospectors pr
  LEFT JOIN public.prospects p
    ON p.prospector_id = pr.id
    AND p.created_at::date BETWEEN p_start_date AND p_end_date
  GROUP BY pr.id, pr.name
  ORDER BY total_prospected DESC, pr.name ASC;
END;
$$;

-- =====================================================
-- Atualiza list/create/update de prospects para incluir prospector_id
-- =====================================================

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
  converted_user_id uuid, converted_at timestamptz, first_payment_value numeric,
  notes text, prospector_id uuid, prospector_name text,
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
         p.converted_user_id, p.converted_at, p.first_payment_value,
         p.notes, p.prospector_id, pr.name AS prospector_name,
         p.created_at, p.updated_at, count(*) OVER ()::bigint AS total_count
  FROM public.prospects p
  LEFT JOIN public.prospectors pr ON pr.id = p.prospector_id
  WHERE p_status IS NULL OR p.status = p_status
  ORDER BY p.updated_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

DROP FUNCTION IF EXISTS public.admin_create_prospect(text, text, text, text, text, text, numeric, text);
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
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;

  INSERT INTO public.prospects (name, phone, email, origin, contact_channel, plan_interest, estimated_value, notes, prospector_id, created_by)
  VALUES (p_name, p_phone, p_email, p_origin, p_contact_channel, p_plan_interest, p_estimated_value, p_notes, p_prospector_id, auth.uid())
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

DROP FUNCTION IF EXISTS public.admin_update_prospect(uuid, text, text, text, text, text, text, numeric, text);
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
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
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

-- GRANTs
DO $$
DECLARE
  fn text;
BEGIN
  FOREACH fn IN ARRAY ARRAY[
    'admin_list_prospectors()',
    'admin_create_prospector(text)',
    'admin_update_prospector(uuid, text, boolean)',
    'admin_delete_prospector(uuid)',
    'admin_get_prospector_stats(date, date)',
    'admin_list_prospects(text, integer, integer)',
    'admin_create_prospect(text, text, text, text, text, text, numeric, text, uuid)',
    'admin_update_prospect(uuid, text, text, text, text, text, text, numeric, text, uuid)'
  ]
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM PUBLIC', fn);
    EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM anon', fn);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO authenticated', fn);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO service_role', fn);
  END LOOP;
END $$;
