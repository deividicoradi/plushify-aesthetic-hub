-- Módulo Comercial: prospecção de clientes (CRM leve).
-- Segue o mesmo padrão de RLS "own data" já usado em clients/payments:
-- policies diretas comparando user_id com (select auth.uid()), sem
-- SECURITY DEFINER (não é dado cross-user como as tabelas do admin).

CREATE TABLE public.prospects (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (length(trim(name)) > 0 AND length(name) <= 255),
  email text CHECK (email IS NULL OR public.validate_email(email)),
  phone text CHECK (phone IS NULL OR public.validate_phone(phone)),
  origin text CHECK (origin IS NULL OR origin IN ('instagram','facebook','whatsapp','indicacao','google','evento','porta','outro')),
  contact_channel text CHECK (contact_channel IS NULL OR contact_channel IN ('whatsapp','instagram','telefone','presencial','email','outro')),
  service_interest text CHECK (service_interest IS NULL OR length(service_interest) <= 255),
  estimated_value numeric CHECK (estimated_value IS NULL OR estimated_value >= 0),
  status text NOT NULL DEFAULT 'novo' CHECK (status IN ('novo','contatado','interessado','negociando','convertido','perdido')),
  loss_reason text CHECK (loss_reason IS NULL OR length(loss_reason) <= 500),
  next_action_note text CHECK (next_action_note IS NULL OR length(next_action_note) <= 500),
  next_action_date date,
  last_contact_at timestamptz,
  converted_client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  converted_at timestamptz,
  first_purchase_value numeric CHECK (first_purchase_value IS NULL OR first_purchase_value >= 0),
  notes text CHECK (notes IS NULL OR length(notes) <= 2000),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_prospects_user_id ON public.prospects(user_id);
CREATE INDEX idx_prospects_user_status ON public.prospects(user_id, status);
CREATE INDEX idx_prospects_last_contact ON public.prospects(user_id, last_contact_at);

CREATE TABLE public.prospect_interactions (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  prospect_id uuid NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel text NOT NULL CHECK (channel IN ('whatsapp','instagram','telefone','presencial','email','outro')),
  note text CHECK (note IS NULL OR length(note) <= 1000),
  occurred_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_prospect_interactions_prospect_id ON public.prospect_interactions(prospect_id);
CREATE INDEX idx_prospect_interactions_user_id ON public.prospect_interactions(user_id);

ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospect_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prospects_select_optimized" ON public.prospects
FOR SELECT USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "prospects_insert_optimized" ON public.prospects
FOR INSERT WITH CHECK ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "prospects_update_optimized" ON public.prospects
FOR UPDATE USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()))
WITH CHECK ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "prospects_delete_optimized" ON public.prospects
FOR DELETE USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

-- prospect_interactions: além de user_id = auth.uid(), garante que o
-- prospect_id referenciado também pertence ao mesmo usuário (evita
-- pendurar uma interação num prospect de outra conta caso o client
-- tente forjar prospect_id de terceiro no insert).
CREATE POLICY "prospect_interactions_select_optimized" ON public.prospect_interactions
FOR SELECT USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "prospect_interactions_insert_optimized" ON public.prospect_interactions
FOR INSERT WITH CHECK (
  (select auth.uid()) IS NOT NULL
  AND user_id = (select auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.prospects p
    WHERE p.id = prospect_id AND p.user_id = (select auth.uid())
  )
);

CREATE POLICY "prospect_interactions_delete_optimized" ON public.prospect_interactions
FOR DELETE USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

REVOKE ALL ON public.prospects FROM PUBLIC, anon;
REVOKE ALL ON public.prospect_interactions FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prospects TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.prospect_interactions TO authenticated;
GRANT ALL ON public.prospects TO service_role;
GRANT ALL ON public.prospect_interactions TO service_role;

-- updated_at automático
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

-- Registrar uma interação também atualiza last_contact_at do prospect
-- (evita o client ter que fazer 2 escritas coordenadas manualmente).
CREATE OR REPLACE FUNCTION public.touch_prospect_last_contact()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.prospects
  SET last_contact_at = NEW.occurred_at
  WHERE id = NEW.prospect_id AND user_id = NEW.user_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_prospect_interaction_touch
AFTER INSERT ON public.prospect_interactions
FOR EACH ROW EXECUTE FUNCTION public.touch_prospect_last_contact();

-- Converte um prospect em cliente real, vinculando os dois registros
-- atomicamente. SECURITY DEFINER só pra poder inserir em clients dentro
-- da mesma transação com consistência; ainda assim escopado ao dono.
CREATE OR REPLACE FUNCTION public.convert_prospect_to_client(
  p_prospect_id uuid,
  p_first_purchase_value numeric DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prospect public.prospects;
  v_client_id uuid;
BEGIN
  SELECT * INTO v_prospect
  FROM public.prospects
  WHERE id = p_prospect_id AND user_id = auth.uid()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prospect não encontrado ou não pertence a este usuário';
  END IF;

  IF v_prospect.converted_client_id IS NOT NULL THEN
    RETURN v_prospect.converted_client_id;
  END IF;

  INSERT INTO public.clients (user_id, name, email, phone, status)
  VALUES (auth.uid(), v_prospect.name, v_prospect.email, v_prospect.phone, 'Ativo')
  RETURNING id INTO v_client_id;

  UPDATE public.prospects
  SET status = 'convertido',
      converted_client_id = v_client_id,
      converted_at = now(),
      first_purchase_value = COALESCE(p_first_purchase_value, first_purchase_value)
  WHERE id = p_prospect_id;

  RETURN v_client_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.convert_prospect_to_client(uuid, numeric) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.convert_prospect_to_client(uuid, numeric) FROM anon;
GRANT EXECUTE ON FUNCTION public.convert_prospect_to_client(uuid, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.convert_prospect_to_client(uuid, numeric) TO service_role;

-- Métricas mensais (total prospectado, taxa de conversão, taxa de perda,
-- em aberto) para o filtro por mês pedido no módulo.
CREATE OR REPLACE FUNCTION public.get_prospect_metrics(
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
STABLE SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
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
  WHERE user_id = auth.uid()
    AND created_at::date BETWEEN p_start_date AND p_end_date;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_prospect_metrics(date, date) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_prospect_metrics(date, date) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_prospect_metrics(date, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_prospect_metrics(date, date) TO service_role;

-- Follow-up: prospects sem contato há 90+/180+ dias e ainda não
-- convertidos/perdidos (base pro alerta de "3/6 meses sem contato").
CREATE OR REPLACE FUNCTION public.get_stale_prospects()
RETURNS TABLE(
  id uuid,
  name text,
  phone text,
  status text,
  last_contact_at timestamptz,
  days_since_contact integer,
  urgency text
)
LANGUAGE plpgsql
STABLE SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id, p.name, p.phone, p.status, p.last_contact_at,
    EXTRACT(DAY FROM now() - COALESCE(p.last_contact_at, p.created_at))::integer AS days_since_contact,
    CASE
      WHEN now() - COALESCE(p.last_contact_at, p.created_at) >= INTERVAL '180 days' THEN 'critico'
      WHEN now() - COALESCE(p.last_contact_at, p.created_at) >= INTERVAL '90 days' THEN 'atencao'
    END AS urgency
  FROM public.prospects p
  WHERE p.user_id = auth.uid()
    AND p.status NOT IN ('convertido','perdido')
    AND now() - COALESCE(p.last_contact_at, p.created_at) >= INTERVAL '90 days'
  ORDER BY COALESCE(p.last_contact_at, p.created_at) ASC;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_stale_prospects() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_stale_prospects() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_stale_prospects() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_stale_prospects() TO service_role;
