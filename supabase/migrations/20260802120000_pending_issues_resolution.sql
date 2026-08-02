-- Pendências (falhas de webhook/e-mail) eram só uma lista estática — sem
-- jeito de marcar o que já foi investigado/corrigido, o admin tinha que
-- guardar de cabeça o que já olhou. Adiciona status de resolução nas duas
-- tabelas + RPCs pra marcar, e o resumo (cards no topo) passa a contar só
-- o que ainda está pendente, não o total histórico dos 30 dias.

ALTER TABLE public.webhook_failures
  ADD COLUMN IF NOT EXISTS resolved boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS resolved_at timestamptz,
  ADD COLUMN IF NOT EXISTS resolved_by uuid,
  ADD COLUMN IF NOT EXISTS resolution_note text;

ALTER TABLE public.email_send_log
  ADD COLUMN IF NOT EXISTS resolved boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS resolved_at timestamptz,
  ADD COLUMN IF NOT EXISTS resolved_by uuid,
  ADD COLUMN IF NOT EXISTS resolution_note text;

CREATE OR REPLACE FUNCTION public.admin_set_webhook_failure_resolved(
  p_id uuid,
  p_resolved boolean,
  p_note text DEFAULT NULL
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

  UPDATE public.webhook_failures
  SET resolved = p_resolved,
      resolved_at = CASE WHEN p_resolved THEN now() ELSE NULL END,
      resolved_by = CASE WHEN p_resolved THEN auth.uid() ELSE NULL END,
      resolution_note = COALESCE(p_note, resolution_note)
  WHERE id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Falha de webhook não encontrada';
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_set_webhook_failure_resolved(uuid, boolean, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_set_webhook_failure_resolved(uuid, boolean, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_set_webhook_failure_resolved(uuid, boolean, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_webhook_failure_resolved(uuid, boolean, text) TO service_role;

CREATE OR REPLACE FUNCTION public.admin_set_email_failure_resolved(
  p_id uuid,
  p_resolved boolean,
  p_note text DEFAULT NULL
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

  UPDATE public.email_send_log
  SET resolved = p_resolved,
      resolved_at = CASE WHEN p_resolved THEN now() ELSE NULL END,
      resolved_by = CASE WHEN p_resolved THEN auth.uid() ELSE NULL END,
      resolution_note = COALESCE(p_note, resolution_note)
  WHERE id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Falha de e-mail não encontrada';
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_set_email_failure_resolved(uuid, boolean, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_set_email_failure_resolved(uuid, boolean, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_set_email_failure_resolved(uuid, boolean, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_email_failure_resolved(uuid, boolean, text) TO service_role;

-- admin_get_pending_issues passa a incluir resolved/resolved_at/resolution_note
-- em cada linha, e os contadores dos cards passam a contar só o que ainda
-- está pendente (não o total histórico de 30 dias) — retorno continua
-- jsonb, CREATE OR REPLACE basta.
CREATE OR REPLACE FUNCTION public.admin_get_pending_issues(p_limit integer DEFAULT 100)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_failed_emails jsonb;
  v_failed_count integer;
  v_webhook_failures jsonb;
  v_webhook_failures_count integer;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;

  SELECT COALESCE(jsonb_agg(t), '[]'::jsonb) INTO v_failed_emails
  FROM (
    SELECT id, message_id, template_name, recipient_email, status, error_message,
           created_at, resolved, resolved_at, resolution_note
    FROM public.email_send_log
    WHERE status IN ('failed', 'dlq', 'bounced', 'complained')
      AND created_at > now() - interval '30 days'
    ORDER BY resolved ASC, created_at DESC
    LIMIT p_limit
  ) t;

  SELECT count(*) INTO v_failed_count
  FROM public.email_send_log
  WHERE status IN ('failed', 'dlq', 'bounced', 'complained')
    AND created_at > now() - interval '30 days'
    AND resolved IS NOT TRUE;

  SELECT COALESCE(jsonb_agg(t), '[]'::jsonb) INTO v_webhook_failures
  FROM (
    SELECT id, source, event_type, external_id, error_message, payload,
           created_at, resolved, resolved_at, resolution_note
    FROM public.webhook_failures
    WHERE created_at > now() - interval '30 days'
    ORDER BY resolved ASC, created_at DESC
    LIMIT p_limit
  ) t;

  SELECT count(*) INTO v_webhook_failures_count
  FROM public.webhook_failures
  WHERE created_at > now() - interval '30 days'
    AND resolved IS NOT TRUE;

  RETURN jsonb_build_object(
    'failed_emails', v_failed_emails,
    'failed_emails_count', v_failed_count,
    'webhook_failures', v_webhook_failures,
    'webhook_failures_count', v_webhook_failures_count
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_get_pending_issues(integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_get_pending_issues(integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_get_pending_issues(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_pending_issues(integer) TO service_role;
