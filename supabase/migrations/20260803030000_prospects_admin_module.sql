-- Módulo Comercial (CORREÇÃO): a primeira versão deste módulo
-- (20260803020000_prospects_module.sql) foi construída errado — como
-- feature client-facing, com RLS "own data" por auth.uid(), para cada
-- dono de salão gerenciar os PRÓPRIOS leads. O pedido real era um
-- módulo dentro do painel ADMIN, para a equipe Plushify gerenciar a
-- prospecção de NOVOS clientes (donos de salão) que ainda não assinam.
-- Substitui completamente pelo padrão admin_* (has_role check) já
-- usado em todo o resto do painel.

DROP TRIGGER IF EXISTS trg_prospect_interaction_touch ON public.prospect_interactions;
DROP TRIGGER IF EXISTS trg_prospects_updated_at ON public.prospects;
DROP FUNCTION IF EXISTS public.touch_prospect_last_contact();
DROP FUNCTION IF EXISTS public.touch_prospects_updated_at();
DROP FUNCTION IF EXISTS public.get_stale_prospects();
DROP FUNCTION IF EXISTS public.get_prospect_metrics(date, date);
DROP FUNCTION IF EXISTS public.convert_prospect_to_client(uuid, numeric);
DROP TABLE IF EXISTS public.prospect_interactions;
DROP TABLE IF EXISTS public.prospects;

-- =====================================================
-- Tabelas
-- =====================================================

CREATE TABLE public.prospects (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  name text NOT NULL CHECK (length(trim(name)) > 0 AND length(name) <= 255),
  email text CHECK (email IS NULL OR public.validate_email(email)),
  phone text CHECK (phone IS NULL OR public.validate_phone(phone)),
  origin text CHECK (origin IS NULL OR origin IN ('instagram','facebook','whatsapp','indicacao','google','evento','porta','outro')),
  contact_channel text CHECK (contact_channel IS NULL OR contact_channel IN ('whatsapp','instagram','telefone','presencial','email','outro')),
  plan_interest text CHECK (plan_interest IS NULL OR plan_interest IN ('professional','premium','indefinido')),
  estimated_value numeric CHECK (estimated_value IS NULL OR estimated_value >= 0),
  status text NOT NULL DEFAULT 'novo' CHECK (status IN ('novo','contatado','interessado','negociando','convertido','perdido')),
  loss_reason text CHECK (loss_reason IS NULL OR length(loss_reason) <= 500),
  next_action_note text CHECK (next_action_note IS NULL OR length(next_action_note) <= 500),
  next_action_date date,
  last_contact_at timestamptz,
  converted_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  converted_at timestamptz,
  first_payment_value numeric CHECK (first_payment_value IS NULL OR first_payment_value >= 0),
  notes text CHECK (notes IS NULL OR length(notes) <= 2000),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_prospects_status ON public.prospects(status);
CREATE INDEX idx_prospects_last_contact ON public.prospects(last_contact_at);
CREATE INDEX idx_prospects_created_at ON public.prospects(created_at);

CREATE TABLE public.prospect_interactions (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  prospect_id uuid NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  channel text NOT NULL CHECK (channel IN ('whatsapp','instagram','telefone','presencial','email','outro')),
  note text CHECK (note IS NULL OR length(note) <= 1000),
  occurred_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_prospect_interactions_prospect_id ON public.prospect_interactions(prospect_id);

-- =====================================================
-- RLS: nenhuma policy direta — só service_role e RPCs SECURITY
-- DEFINER (checagem de has_role admin no corpo), mesmo padrão de
-- webhook_failures / email_send_log.
-- =====================================================

ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospect_interactions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.prospects FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.prospect_interactions FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.prospects TO service_role;
GRANT ALL ON public.prospect_interactions TO service_role;

CREATE OR REPLACE FUNCTION public.touch_prospects_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_prospects_updated_at
BEFORE UPDATE ON public.prospects
FOR EACH ROW EXECUTE FUNCTION public.touch_prospects_updated_at();

CREATE OR REPLACE FUNCTION public.touch_prospect_last_contact()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.prospects
  SET last_contact_at = NEW.occurred_at
  WHERE id = NEW.prospect_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_prospect_interaction_touch
AFTER INSERT ON public.prospect_interactions
FOR EACH ROW EXECUTE FUNCTION public.touch_prospect_last_contact();

-- =====================================================
-- RPCs admin_*
-- =====================================================

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
  notes text, created_at timestamptz, updated_at timestamptz, total_count bigint
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
         p.notes, p.created_at, p.updated_at, count(*) OVER ()::bigint AS total_count
  FROM public.prospects p
  WHERE p_status IS NULL OR p.status = p_status
  ORDER BY p.updated_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_prospect_interactions(p_prospect_id uuid)
RETURNS TABLE(id uuid, prospect_id uuid, channel text, note text, occurred_at timestamptz, created_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;

  RETURN QUERY
  SELECT i.id, i.prospect_id, i.channel, i.note, i.occurred_at, i.created_at
  FROM public.prospect_interactions i
  WHERE i.prospect_id = p_prospect_id
  ORDER BY i.occurred_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_create_prospect(
  p_name text,
  p_phone text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_origin text DEFAULT NULL,
  p_contact_channel text DEFAULT NULL,
  p_plan_interest text DEFAULT NULL,
  p_estimated_value numeric DEFAULT NULL,
  p_notes text DEFAULT NULL
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

  INSERT INTO public.prospects (name, phone, email, origin, contact_channel, plan_interest, estimated_value, notes, created_by)
  VALUES (p_name, p_phone, p_email, p_origin, p_contact_channel, p_plan_interest, p_estimated_value, p_notes, auth.uid())
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_prospect(
  p_id uuid,
  p_name text,
  p_phone text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_origin text DEFAULT NULL,
  p_contact_channel text DEFAULT NULL,
  p_plan_interest text DEFAULT NULL,
  p_estimated_value numeric DEFAULT NULL,
  p_notes text DEFAULT NULL
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
      estimated_value = p_estimated_value, notes = p_notes
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
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;

  DELETE FROM public.prospects WHERE id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_prospect_status(
  p_id uuid,
  p_status text,
  p_loss_reason text DEFAULT NULL
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

  IF p_status NOT IN ('novo','contatado','interessado','negociando','convertido','perdido') THEN
    RAISE EXCEPTION 'Status inválido';
  END IF;

  IF p_status = 'perdido' AND (p_loss_reason IS NULL OR length(trim(p_loss_reason)) = 0) THEN
    RAISE EXCEPTION 'Motivo da perda é obrigatório';
  END IF;

  UPDATE public.prospects
  SET status = p_status,
      loss_reason = CASE WHEN p_status = 'perdido' THEN p_loss_reason ELSE loss_reason END
  WHERE id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prospect não encontrado';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_add_prospect_interaction(
  p_prospect_id uuid,
  p_channel text,
  p_note text DEFAULT NULL
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

  IF NOT EXISTS (SELECT 1 FROM public.prospects WHERE id = p_prospect_id) THEN
    RAISE EXCEPTION 'Prospect não encontrado';
  END IF;

  INSERT INTO public.prospect_interactions (prospect_id, channel, note, created_by)
  VALUES (p_prospect_id, p_channel, p_note, auth.uid())
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_convert_prospect(
  p_id uuid,
  p_converted_user_id uuid DEFAULT NULL,
  p_first_payment_value numeric DEFAULT NULL
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
  SET status = 'convertido',
      converted_user_id = p_converted_user_id,
      converted_at = now(),
      first_payment_value = p_first_payment_value
  WHERE id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prospect não encontrado';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_prospect_metrics(
  p_start_date date,
  p_end_date date
)
RETURNS TABLE(
  total_prospected bigint,
  total_converted bigint,
  total_lost bigint,
  total_open bigint,
  conversion_rate numeric,
  loss_rate numeric
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
    COUNT(*)::bigint AS total_prospected,
    COUNT(*) FILTER (WHERE status = 'convertido')::bigint AS total_converted,
    COUNT(*) FILTER (WHERE status = 'perdido')::bigint AS total_lost,
    COUNT(*) FILTER (WHERE status NOT IN ('convertido','perdido'))::bigint AS total_open,
    CASE WHEN COUNT(*) = 0 THEN 0
         ELSE ROUND(COUNT(*) FILTER (WHERE status = 'convertido')::numeric / COUNT(*)::numeric * 100, 1)
    END AS conversion_rate,
    CASE WHEN COUNT(*) = 0 THEN 0
         ELSE ROUND(COUNT(*) FILTER (WHERE status = 'perdido')::numeric / COUNT(*)::numeric * 100, 1)
    END AS loss_rate
  FROM public.prospects
  WHERE created_at::date BETWEEN p_start_date AND p_end_date;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_stale_prospects()
RETURNS TABLE(
  id uuid, name text, phone text, status text,
  last_contact_at timestamptz, days_since_contact integer, urgency text
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
    p.id, p.name, p.phone, p.status, p.last_contact_at,
    EXTRACT(DAY FROM now() - COALESCE(p.last_contact_at, p.created_at))::integer AS days_since_contact,
    CASE
      WHEN now() - COALESCE(p.last_contact_at, p.created_at) >= INTERVAL '180 days' THEN 'critico'
      WHEN now() - COALESCE(p.last_contact_at, p.created_at) >= INTERVAL '90 days' THEN 'atencao'
    END AS urgency
  FROM public.prospects p
  WHERE p.status NOT IN ('convertido','perdido')
    AND now() - COALESCE(p.last_contact_at, p.created_at) >= INTERVAL '90 days'
  ORDER BY COALESCE(p.last_contact_at, p.created_at) ASC;
END;
$$;

-- GRANTs: todas as funções são authenticated (checagem interna de
-- has_role faz o gate real), seguindo o padrão idêntico ao resto do
-- admin_* do painel.
DO $$
DECLARE
  fn text;
BEGIN
  FOREACH fn IN ARRAY ARRAY[
    'admin_list_prospects(text, integer, integer)',
    'admin_get_prospect_interactions(uuid)',
    'admin_create_prospect(text, text, text, text, text, text, numeric, text)',
    'admin_update_prospect(uuid, text, text, text, text, text, text, numeric, text)',
    'admin_delete_prospect(uuid)',
    'admin_set_prospect_status(uuid, text, text)',
    'admin_add_prospect_interaction(uuid, text, text)',
    'admin_convert_prospect(uuid, uuid, numeric)',
    'admin_get_prospect_metrics(date, date)',
    'admin_get_stale_prospects()'
  ]
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM PUBLIC', fn);
    EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM anon', fn);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO authenticated', fn);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO service_role', fn);
  END LOOP;
END $$;
