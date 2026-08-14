-- Correção do item 1 do relatório de bug bounty
-- (vazamento-schema-postgrest-supabase.md): o hint "did you mean" do
-- PostgREST revela nomes de tabela mesmo sem GRANT nenhum, porque ele lê
-- o cache de schema, não as permissões. A única forma de tirar uma tabela
-- do "mapa" que um atacante sem login consegue enumerar é ela não estar
-- em nenhum schema exposto pelo PostgREST (Project Settings → API →
-- "Exposed schemas", hoje só `public`).
--
-- Move as tabelas puramente administrativas do módulo Financeiro pra um
-- schema `internal`, fora da lista de exposed schemas. Nada no frontend
-- faz `.from('admin_finance_entries'/'admin_finance_notes')` diretamente
-- (confirmado via grep) — todo acesso já passa pelas RPCs admin_*, que
-- continuam em `public` (têm que continuar expostas, são chamadas via
-- /rest/v1/rpc/admin_*) só que agora apontando pro schema novo.

CREATE SCHEMA IF NOT EXISTS internal;
REVOKE ALL ON SCHEMA internal FROM PUBLIC;
GRANT USAGE ON SCHEMA internal TO service_role;

ALTER TABLE public.admin_finance_entries SET SCHEMA internal;
ALTER TABLE public.admin_finance_notes SET SCHEMA internal;

-- =====================================================
-- Realinha as funções pro novo schema
-- =====================================================

CREATE OR REPLACE FUNCTION public.mark_overdue_finance_entries()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE internal.admin_finance_entries
  SET status = 'overdue', updated_at = now()
  WHERE status = 'pending' AND due_date < CURRENT_DATE;
END;
$$;

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
  FROM internal.admin_finance_entries e
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

  INSERT INTO internal.admin_finance_entries
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

  UPDATE internal.admin_finance_entries
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

  UPDATE internal.admin_finance_entries
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

  UPDATE internal.admin_finance_entries SET status = 'cancelled' WHERE id = p_id;
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

  DELETE FROM internal.admin_finance_entries WHERE id = p_id;
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
    FROM internal.admin_finance_entries
  )
  SELECT t.total_paid, t.total_pending, t.total_overdue, e.category, SUM(e.amount)
  FROM totals t
  LEFT JOIN internal.admin_finance_entries e
    ON e.due_date BETWEEN p_from AND p_to AND e.status <> 'cancelled'
  GROUP BY t.total_paid, t.total_pending, t.total_overdue, e.category;
END;
$$;

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
  FROM internal.admin_finance_notes n
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

  INSERT INTO internal.admin_finance_notes (title, content, pinned, created_by)
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

  UPDATE internal.admin_finance_notes
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

  DELETE FROM internal.admin_finance_notes WHERE id = p_id;
END;
$$;
