-- Fila de pendências operacionais pro painel admin: até aqui, falha de
-- envio de e-mail (DLQ, bounce, erro) só era descoberta lendo log de
-- produção manualmente comigo (aconteceu 2x nesta mesma sprint: bug de
-- idempotency_key e depois domain_not_verified). Expor isso direto no
-- painel evita depender de log pra saber que algo quebrou.
CREATE OR REPLACE FUNCTION public.admin_get_pending_issues(p_limit integer DEFAULT 100)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_failed_emails jsonb;
  v_failed_count integer;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;

  SELECT COALESCE(jsonb_agg(t), '[]'::jsonb) INTO v_failed_emails
  FROM (
    SELECT id, message_id, template_name, recipient_email, status, error_message, created_at
    FROM public.email_send_log
    WHERE status IN ('failed', 'dlq', 'bounced', 'complained')
      AND created_at > now() - interval '30 days'
    ORDER BY created_at DESC
    LIMIT p_limit
  ) t;

  SELECT count(*) INTO v_failed_count
  FROM public.email_send_log
  WHERE status IN ('failed', 'dlq', 'bounced', 'complained')
    AND created_at > now() - interval '30 days';

  RETURN jsonb_build_object(
    'failed_emails', v_failed_emails,
    'failed_emails_count', v_failed_count
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_get_pending_issues(integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_get_pending_issues(integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_get_pending_issues(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_pending_issues(integer) TO service_role;
