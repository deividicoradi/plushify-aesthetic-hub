-- Módulo Financeiro do Painel Administrativo: contas a pagar / despesas da
-- própria Plushify (não confundir com o "Financeiro" que cada salão-cliente
-- já tem, que é multi-tenant e isolado por auth.uid()). Aqui é o financeiro
-- INTERNO da empresa, dado sensível, visível só pra admin.
--
-- Mesmo padrão de segurança já usado no módulo Comercial (prospects): RLS
-- ligada mas SEM nenhuma policy direta — acesso zero via PostgREST mesmo
-- pra usuário autenticado comum. Só service_role tem GRANT; todo acesso
-- passa por função admin_* (SECURITY DEFINER) que checa has_role(auth.uid(),
-- 'admin') antes de qualquer leitura/escrita. Mesmo um bug de RLS não vaza
-- nada, porque a tabela está trancada na raiz.

-- =====================================================
-- Tabelas
-- =====================================================

CREATE TABLE public.admin_finance_entries (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  description text NOT NULL CHECK (length(trim(description)) > 0 AND length(description) <= 255),
  category text NOT NULL CHECK (category IN (
    'infraestrutura', 'marketing', 'folha_pro_labore', 'impostos',
    'taxas_gateway', 'juridico_contabilidade', 'ferramentas_software', 'outros'
  )),
  amount numeric(10,2) NOT NULL CHECK (amount >= 0),
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  recurrence text NOT NULL DEFAULT 'none' CHECK (recurrence IN ('none', 'monthly', 'yearly')),
  paid_at timestamptz,
  payment_method text CHECK (payment_method IS NULL OR length(payment_method) <= 100),
  attachment_url text,
  notes text CHECK (notes IS NULL OR length(notes) <= 2000),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_admin_finance_entries_status ON public.admin_finance_entries(status);
CREATE INDEX idx_admin_finance_entries_due_date ON public.admin_finance_entries(due_date);
CREATE INDEX idx_admin_finance_entries_category ON public.admin_finance_entries(category);

CREATE TABLE public.admin_finance_notes (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  title text NOT NULL CHECK (length(trim(title)) > 0 AND length(title) <= 255),
  content text CHECK (content IS NULL OR length(content) <= 5000),
  pinned boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_admin_finance_notes_pinned ON public.admin_finance_notes(pinned DESC, updated_at DESC);

-- =====================================================
-- RLS: trancado na raiz, mesmo padrão de prospects
-- =====================================================

ALTER TABLE public.admin_finance_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_finance_notes ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.admin_finance_entries FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.admin_finance_notes FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.admin_finance_entries TO service_role;
GRANT ALL ON public.admin_finance_notes TO service_role;

CREATE OR REPLACE FUNCTION public.touch_admin_finance_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_admin_finance_entries_updated_at
BEFORE UPDATE ON public.admin_finance_entries
FOR EACH ROW EXECUTE FUNCTION public.touch_admin_finance_updated_at();

CREATE TRIGGER trg_admin_finance_notes_updated_at
BEFORE UPDATE ON public.admin_finance_notes
FOR EACH ROW EXECUTE FUNCTION public.touch_admin_finance_updated_at();

-- Marca automaticamente como vencida quem passou do due_date sem ser paga/cancelada.
CREATE OR REPLACE FUNCTION public.mark_overdue_finance_entries()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.admin_finance_entries
  SET status = 'overdue', updated_at = now()
  WHERE status = 'pending' AND due_date < CURRENT_DATE;
END;
$$;

-- =====================================================
-- RPCs admin_* — contas a pagar / despesas
-- =====================================================

CREATE OR REPLACE FUNCTION public.admin_list_finance_entries(
  p_status text DEFAULT NULL,
  p_category text DEFAULT NULL,
  p_from date DEFAULT NULL,
  p_to date DEFAULT NULL,
  p_limit integer DEFAULT 200,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  id uuid, description text, category text, amount numeric, due_date date,
  status text, recurrence text, paid_at timestamptz, payment_method text,
  attachment_url text, notes text, created_at timestamptz, updated_at timestamptz,
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

  PERFORM public.mark_overdue_finance_entries();

  RETURN QUERY
  SELECT e.id, e.description, e.category, e.amount, e.due_date, e.status,
         e.recurrence, e.paid_at, e.payment_method, e.attachment_url, e.notes,
         e.created_at, e.updated_at, count(*) OVER ()::bigint AS total_count
  FROM public.admin_finance_entries e
  WHERE (p_status IS NULL OR e.status = p_status)
    AND (p_category IS NULL OR e.category = p_category)
    AND (p_from IS NULL OR e.due_date >= p_from)
    AND (p_to IS NULL OR e.due_date <= p_to)
  ORDER BY e.due_date ASC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_create_finance_entry(
  p_description text,
  p_category text,
  p_amount numeric,
  p_due_date date,
  p_recurrence text DEFAULT 'none',
  p_notes text DEFAULT NULL,
  p_attachment_url text DEFAULT NULL
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

  INSERT INTO public.admin_finance_entries
    (description, category, amount, due_date, recurrence, notes, attachment_url, created_by)
  VALUES
    (p_description, p_category, p_amount, p_due_date, p_recurrence, p_notes, p_attachment_url, auth.uid())
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_finance_entry(
  p_id uuid,
  p_description text,
  p_category text,
  p_amount numeric,
  p_due_date date,
  p_recurrence text DEFAULT 'none',
  p_notes text DEFAULT NULL,
  p_attachment_url text DEFAULT NULL
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

  UPDATE public.admin_finance_entries
  SET description = p_description, category = p_category, amount = p_amount,
      due_date = p_due_date, recurrence = p_recurrence, notes = p_notes,
      attachment_url = p_attachment_url
  WHERE id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_mark_finance_entry_paid(
  p_id uuid,
  p_payment_method text DEFAULT NULL
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

  UPDATE public.admin_finance_entries
  SET status = 'paid', paid_at = now(), payment_method = p_payment_method
  WHERE id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_cancel_finance_entry(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;

  UPDATE public.admin_finance_entries SET status = 'cancelled' WHERE id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_finance_entry(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;

  DELETE FROM public.admin_finance_entries WHERE id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_finance_summary(
  p_from date DEFAULT date_trunc('month', CURRENT_DATE)::date,
  p_to date DEFAULT (date_trunc('month', CURRENT_DATE) + interval '1 month' - interval '1 day')::date
)
RETURNS TABLE(
  total_paid numeric, total_pending numeric, total_overdue numeric,
  category text, category_total numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;

  PERFORM public.mark_overdue_finance_entries();

  RETURN QUERY
  WITH totals AS (
    SELECT
      COALESCE(SUM(amount) FILTER (WHERE status = 'paid' AND due_date BETWEEN p_from AND p_to), 0) AS total_paid,
      COALESCE(SUM(amount) FILTER (WHERE status = 'pending' AND due_date BETWEEN p_from AND p_to), 0) AS total_pending,
      COALESCE(SUM(amount) FILTER (WHERE status = 'overdue' AND due_date BETWEEN p_from AND p_to), 0) AS total_overdue
    FROM public.admin_finance_entries
  )
  SELECT t.total_paid, t.total_pending, t.total_overdue, e.category, SUM(e.amount)
  FROM totals t
  LEFT JOIN public.admin_finance_entries e
    ON e.due_date BETWEEN p_from AND p_to AND e.status <> 'cancelled'
  GROUP BY t.total_paid, t.total_pending, t.total_overdue, e.category;
END;
$$;

-- =====================================================
-- RPCs admin_* — anotações
-- =====================================================

CREATE OR REPLACE FUNCTION public.admin_list_finance_notes()
RETURNS TABLE(id uuid, title text, content text, pinned boolean, created_at timestamptz, updated_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;

  RETURN QUERY
  SELECT n.id, n.title, n.content, n.pinned, n.created_at, n.updated_at
  FROM public.admin_finance_notes n
  ORDER BY n.pinned DESC, n.updated_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_create_finance_note(
  p_title text,
  p_content text DEFAULT NULL,
  p_pinned boolean DEFAULT false
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

  INSERT INTO public.admin_finance_notes (title, content, pinned, created_by)
  VALUES (p_title, p_content, p_pinned, auth.uid())
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_finance_note(
  p_id uuid,
  p_title text,
  p_content text DEFAULT NULL,
  p_pinned boolean DEFAULT false
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

  UPDATE public.admin_finance_notes
  SET title = p_title, content = p_content, pinned = p_pinned
  WHERE id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_finance_note(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;

  DELETE FROM public.admin_finance_notes WHERE id = p_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_finance_entries(text, text, date, date, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_create_finance_entry(text, text, numeric, date, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_finance_entry(uuid, text, text, numeric, date, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_mark_finance_entry_paid(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_cancel_finance_entry(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_finance_entry(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_finance_summary(date, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_finance_notes() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_create_finance_note(text, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_finance_note(uuid, text, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_finance_note(uuid) TO authenticated;

-- =====================================================
-- Storage: anexos de comprovante/nota fiscal — privado (não público como
-- fotos de serviço/perfil, é documento interno). Só admin lê/escreve, via
-- policy checando has_role diretamente (não precisa de RPC pra Storage).
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'admin-finance-attachments', 'admin-finance-attachments', false,
  10485760,
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "Admin acessa anexos financeiros"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'admin-finance-attachments' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'admin-finance-attachments' AND public.has_role(auth.uid(), 'admin'));
