-- Módulo de Suporte: cliente relata problema/melhoria dentro do app, vira
-- um "Evento" numerado sequencialmente (Evento 1, 2, 3...), visível pro
-- admin num módulo próprio com fluxo de estágio (aberto -> em análise ->
-- em correção -> concluído -> finalizado) e histórico completo de cada
-- mudança. Cliente acompanha o próprio chamado e recebe e-mail quando o
-- status muda (reaproveita a mesma fila de e-mail transacional usada no
-- aviso de login/confirmação de upgrade).

CREATE SEQUENCE IF NOT EXISTS public.support_event_number_seq START 1;

CREATE TABLE IF NOT EXISTS public.support_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_number integer NOT NULL DEFAULT nextval('public.support_event_number_seq') UNIQUE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('melhoria', 'correcao', 'pequena_melhoria', 'pequena_correcao')),
  status text NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto', 'em_analise', 'em_correcao', 'concluido', 'fechado')),
  admin_response text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_events_user ON public.support_events(user_id);
CREATE INDEX IF NOT EXISTS idx_support_events_status ON public.support_events(status);
CREATE INDEX IF NOT EXISTS idx_support_events_created ON public.support_events(created_at DESC);

ALTER TABLE public.support_events ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.support_events FROM PUBLIC;
REVOKE ALL ON public.support_events FROM anon;

-- Cliente só vê/cria os próprios chamados. Update/status é só via RPC
-- SECURITY DEFINER do admin (roda como dono, ignora RLS) — não há policy
-- de UPDATE aqui, então nem o próprio cliente edita depois de aberto.
DO $$ BEGIN
  CREATE POLICY "Cliente vê os próprios chamados"
    ON public.support_events FOR SELECT TO authenticated
    USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Cliente abre chamado pra si mesmo"
    ON public.support_events FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

GRANT SELECT, INSERT ON public.support_events TO authenticated;
GRANT ALL ON public.support_events TO service_role;

CREATE TABLE IF NOT EXISTS public.support_event_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.support_events(id) ON DELETE CASCADE,
  old_status text,
  new_status text NOT NULL,
  note text,
  changed_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_event_history_event ON public.support_event_history(event_id, created_at);

ALTER TABLE public.support_event_history ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.support_event_history FROM PUBLIC;
REVOKE ALL ON public.support_event_history FROM anon;

-- Histórico só é lido via RPC (admin) — cliente vê o status atual na
-- própria linha de support_events, não precisa do histórico bruto.
GRANT ALL ON public.support_event_history TO service_role;

-- Cliente abre um chamado. Retorna o número sequencial (Evento N) pra
-- confirmação imediata na tela.
CREATE OR REPLACE FUNCTION public.submit_support_event(
  p_title text,
  p_description text,
  p_event_type text
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

  INSERT INTO public.support_events (user_id, title, description, event_type)
  VALUES (auth.uid(), btrim(p_title), btrim(p_description), p_event_type)
  RETURNING event_number INTO v_event_number;

  INSERT INTO public.support_event_history (event_id, old_status, new_status, changed_by)
  SELECT id, NULL, 'aberto', auth.uid() FROM public.support_events WHERE event_number = v_event_number;

  RETURN v_event_number;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.submit_support_event(text, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.submit_support_event(text, text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.submit_support_event(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_support_event(text, text, text) TO service_role;

-- Cliente acompanha os próprios chamados.
CREATE OR REPLACE FUNCTION public.get_my_support_events()
RETURNS TABLE(
  id uuid,
  event_number integer,
  title text,
  description text,
  event_type text,
  status text,
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
  SELECT e.id, e.event_number, e.title, e.description, e.event_type, e.status, e.admin_response, e.created_at, e.updated_at
  FROM public.support_events e
  WHERE e.user_id = auth.uid()
  ORDER BY e.created_at DESC;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_my_support_events() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_my_support_events() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_my_support_events() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_support_events() TO service_role;

-- Admin lista todos os chamados, com filtro opcional por status.
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
  SELECT e.id, e.event_number, u.email::text, e.title, e.description, e.event_type, e.status, e.admin_response,
         e.created_at, e.updated_at, count(*) OVER ()::bigint AS total_count
  FROM public.support_events e
  JOIN auth.users u ON u.id = e.user_id
  WHERE p_status IS NULL OR e.status = p_status
  ORDER BY e.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_list_support_events(text, integer, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_list_support_events(text, integer, integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_list_support_events(text, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_support_events(text, integer, integer) TO service_role;

-- Detalhe de um chamado + histórico completo, pro modal do admin.
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

-- Admin muda o estágio (e opcionalmente escreve uma resposta visível pro
-- cliente). Registra no histórico e avisa o cliente por e-mail quando o
-- status realmente muda — mesmo padrão de fila usado por notify_login.
CREATE OR REPLACE FUNCTION public.admin_update_support_event_status(
  p_event_id uuid,
  p_new_status text,
  p_note text DEFAULT NULL,
  p_admin_response text DEFAULT NULL
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

  SELECT status, user_id, event_number INTO v_old_status, v_user_id, v_event_number
  FROM public.support_events WHERE id = p_event_id;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Chamado não encontrado';
  END IF;

  UPDATE public.support_events
  SET status = p_new_status,
      admin_response = COALESCE(p_admin_response, admin_response),
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
      -- Nunca deixa uma falha no aviso por e-mail impedir a mudança de
      -- status em si (já commitada acima).
      RAISE WARNING 'admin_update_support_event_status: falha ao notificar cliente: %', SQLERRM;
    END;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_update_support_event_status(uuid, text, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_update_support_event_status(uuid, text, text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_update_support_event_status(uuid, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_support_event_status(uuid, text, text, text) TO service_role;
