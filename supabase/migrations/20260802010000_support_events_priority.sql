-- Prioridade do chamado de suporte: cliente sinaliza a urgência ao abrir
-- (urgente/atenção/normal), admin também pode reclassificar durante a
-- triagem. Usado só pra exibir um selo colorido nas telas — não afeta
-- ordenação nem SLA automaticamente.

ALTER TABLE public.support_events
  ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'normal'
  CHECK (priority IN ('urgente', 'atencao', 'normal'));

CREATE INDEX IF NOT EXISTS idx_support_events_priority ON public.support_events(priority);

-- submit_support_event ganha p_priority (default 'normal', compatível com
-- chamadas antigas). Assinatura muda: dropa a versão anterior explicitamente
-- pra evitar overload duplicado.
DROP FUNCTION IF EXISTS public.submit_support_event(text, text, text);

CREATE OR REPLACE FUNCTION public.submit_support_event(
  p_title text,
  p_description text,
  p_event_type text,
  p_priority text DEFAULT 'normal'
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_number integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;

  IF p_title IS NULL OR btrim(p_title) = '' THEN
    RAISE EXCEPTION 'Título é obrigatório';
  END IF;

  IF p_description IS NULL OR btrim(p_description) = '' THEN
    RAISE EXCEPTION 'Descrição é obrigatória';
  END IF;

  IF p_event_type NOT IN ('melhoria', 'correcao', 'pequena_melhoria', 'pequena_correcao') THEN
    RAISE EXCEPTION 'Tipo de evento inválido';
  END IF;

  IF p_priority NOT IN ('urgente', 'atencao', 'normal') THEN
    RAISE EXCEPTION 'Prioridade inválida';
  END IF;

  INSERT INTO public.support_events (user_id, title, description, event_type, priority)
  VALUES (auth.uid(), btrim(p_title), btrim(p_description), p_event_type, p_priority)
  RETURNING event_number INTO v_event_number;

  INSERT INTO public.support_event_history (event_id, old_status, new_status, changed_by)
  SELECT id, NULL, 'aberto', auth.uid() FROM public.support_events WHERE event_number = v_event_number;

  RETURN v_event_number;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.submit_support_event(text, text, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.submit_support_event(text, text, text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.submit_support_event(text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_support_event(text, text, text, text) TO service_role;

-- get_my_support_events passa a retornar priority (muda o tipo de retorno,
-- CREATE OR REPLACE não permite — precisa dropar antes).
DROP FUNCTION IF EXISTS public.get_my_support_events();

CREATE OR REPLACE FUNCTION public.get_my_support_events()
RETURNS TABLE(
  id uuid,
  event_number integer,
  title text,
  description text,
  event_type text,
  status text,
  priority text,
  admin_response text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;

  RETURN QUERY
  SELECT e.id, e.event_number, e.title, e.description, e.event_type, e.status, e.priority, e.admin_response, e.created_at, e.updated_at
  FROM public.support_events e
  WHERE e.user_id = auth.uid()
  ORDER BY e.created_at DESC;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_my_support_events() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_my_support_events() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_my_support_events() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_support_events() TO service_role;

-- admin_list_support_events passa a retornar priority (muda o tipo de
-- retorno, precisa dropar antes).
DROP FUNCTION IF EXISTS public.admin_list_support_events(text, integer, integer);

CREATE OR REPLACE FUNCTION public.admin_list_support_events(
  p_status text DEFAULT NULL,
  p_limit integer DEFAULT 100,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  event_number integer,
  user_email text,
  title text,
  description text,
  event_type text,
  status text,
  priority text,
  admin_response text,
  created_at timestamptz,
  updated_at timestamptz,
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

  RETURN QUERY
  SELECT e.id, e.event_number, u.email::text, e.title, e.description, e.event_type, e.status, e.priority, e.admin_response,
         e.created_at, e.updated_at, count(*) OVER ()::bigint AS total_count
  FROM public.support_events e
  JOIN auth.users u ON u.id = e.user_id
  WHERE p_status IS NULL OR e.status = p_status
  ORDER BY
    CASE e.priority WHEN 'urgente' THEN 0 WHEN 'atencao' THEN 1 ELSE 2 END,
    e.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_list_support_events(text, integer, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_list_support_events(text, integer, integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_list_support_events(text, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_support_events(text, integer, integer) TO service_role;

-- admin_get_support_event_detail passa a retornar priority.
CREATE OR REPLACE FUNCTION public.admin_get_support_event_detail(p_event_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event jsonb;
  v_history jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;

  SELECT jsonb_build_object(
    'id', e.id,
    'event_number', e.event_number,
    'user_email', u.email,
    'title', e.title,
    'description', e.description,
    'event_type', e.event_type,
    'status', e.status,
    'priority', e.priority,
    'admin_response', e.admin_response,
    'created_at', e.created_at,
    'updated_at', e.updated_at
  ) INTO v_event
  FROM public.support_events e
  JOIN auth.users u ON u.id = e.user_id
  WHERE e.id = p_event_id;

  IF v_event IS NULL THEN
    RAISE EXCEPTION 'Chamado não encontrado';
  END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'old_status', h.old_status,
    'new_status', h.new_status,
    'note', h.note,
    'changed_by_email', au.email,
    'created_at', h.created_at
  ) ORDER BY h.created_at ASC), '[]'::jsonb) INTO v_history
  FROM public.support_event_history h
  LEFT JOIN auth.users au ON au.id = h.changed_by
  WHERE h.event_id = p_event_id;

  RETURN v_event || jsonb_build_object('history', v_history);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_get_support_event_detail(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_get_support_event_detail(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_get_support_event_detail(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_support_event_detail(uuid) TO service_role;

-- admin_update_support_event_status ganha p_priority opcional, pra
-- reclassificar a urgência junto com a mudança de estágio (sem exigir
-- outra chamada). Assinatura muda: dropa a versão anterior.
DROP FUNCTION IF EXISTS public.admin_update_support_event_status(uuid, text, text, text);

CREATE OR REPLACE FUNCTION public.admin_update_support_event_status(
  p_event_id uuid,
  p_new_status text,
  p_note text DEFAULT NULL,
  p_admin_response text DEFAULT NULL,
  p_priority text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
DECLARE
  v_old_status text;
  v_user_id uuid;
  v_email text;
  v_event_number integer;
  v_unsub_token text;
  v_message_id text;
  v_status_labels jsonb := '{
    "aberto": "Aberto",
    "em_analise": "Em análise",
    "em_correcao": "Em correção",
    "concluido": "Concluído",
    "fechado": "Finalizado"
  }'::jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;

  IF p_new_status NOT IN ('aberto', 'em_analise', 'em_correcao', 'concluido', 'fechado') THEN
    RAISE EXCEPTION 'Status inválido';
  END IF;

  IF p_priority IS NOT NULL AND p_priority NOT IN ('urgente', 'atencao', 'normal') THEN
    RAISE EXCEPTION 'Prioridade inválida';
  END IF;

  SELECT status, user_id, event_number INTO v_old_status, v_user_id, v_event_number
  FROM public.support_events WHERE id = p_event_id;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Chamado não encontrado';
  END IF;

  UPDATE public.support_events
  SET status = p_new_status,
      admin_response = COALESCE(p_admin_response, admin_response),
      priority = COALESCE(p_priority, priority),
      updated_at = now()
  WHERE id = p_event_id;

  INSERT INTO public.support_event_history (event_id, old_status, new_status, note, changed_by)
  VALUES (p_event_id, v_old_status, p_new_status, p_note, auth.uid());

  IF v_old_status IS DISTINCT FROM p_new_status THEN
    BEGIN
      SELECT email::text INTO v_email FROM auth.users WHERE id = v_user_id;

      IF v_email IS NOT NULL THEN
        SELECT token INTO v_unsub_token FROM public.email_unsubscribe_tokens WHERE email = v_email;
        IF v_unsub_token IS NULL THEN
          v_unsub_token := encode(gen_random_bytes(24), 'hex');
          INSERT INTO public.email_unsubscribe_tokens (token, email)
          VALUES (v_unsub_token, v_email)
          ON CONFLICT (email) DO UPDATE SET token = EXCLUDED.token
          RETURNING token INTO v_unsub_token;
        END IF;

        v_message_id := 'support-' || p_event_id::text || '-' || extract(epoch FROM now())::bigint::text;

        PERFORM public.enqueue_email('transactional_emails', jsonb_build_object(
          'to', v_email,
          'from', 'Plushify <naoresponda@notify.plushify.com.br>',
          'sender_domain', 'notify.plushify.com.br',
          'subject', 'Atualização no seu chamado #' || v_event_number || ' — ' || (v_status_labels ->> p_new_status),
          'html',
            '<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">' ||
            '<h2>Chamado #' || v_event_number || ' atualizado</h2>' ||
            '<p>Novo status: <strong>' || (v_status_labels ->> p_new_status) || '</strong></p>' ||
            CASE WHEN p_admin_response IS NOT NULL AND btrim(p_admin_response) <> ''
              THEN '<p style="padding:12px; background:#f5f5f5; border-radius:8px;">' || p_admin_response || '</p>'
              ELSE ''
            END ||
            '<p style="color:#999; font-size:12px; margin-top:24px;">Acompanhe em Central de Ajuda → Meus Chamados. Dúvidas? Fale com plushify.suporte@gmail.com</p>' ||
            '</div>',
          'text', 'Chamado #' || v_event_number || ' atualizado para: ' || (v_status_labels ->> p_new_status) ||
            CASE WHEN p_admin_response IS NOT NULL AND btrim(p_admin_response) <> '' THEN E'\n\n' || p_admin_response ELSE '' END,
          'purpose', 'transactional',
          'label', 'support_status_update',
          'message_id', v_message_id,
          'idempotency_key', v_message_id,
          'unsubscribe_token', v_unsub_token,
          'queued_at', now()
        ));
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'admin_update_support_event_status: falha ao notificar cliente: %', SQLERRM;
    END;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_update_support_event_status(uuid, text, text, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_update_support_event_status(uuid, text, text, text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_update_support_event_status(uuid, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_support_event_status(uuid, text, text, text, text) TO service_role;
