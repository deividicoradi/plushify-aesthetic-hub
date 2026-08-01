-- Falhas do webhook de pagamento (AbacatePay) só existiam nos logs de
-- produção do abacate-webhook — exatamente como as falhas de e-mail antes
-- de admin_get_pending_issues. É a categoria de bug mais perigosa possível
-- aqui: um pagamento pode ser aprovado na AbacatePay e a ativação do plano
-- falhar silenciosamente do nosso lado (RPC start_subscription/
-- cancel_subscription falhando, ou o payload chegando sem conseguirmos
-- identificar o usuário) — foi exatamente essa classe de bug (ON CONFLICT
-- de start_subscription) que causou a contagem errada de planos investigada
-- nesta mesma sprint. Sem isso no painel, só se descobre lendo log manual.

CREATE TABLE IF NOT EXISTS public.webhook_failures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL, -- 'abacate_webhook' hoje; deixa espaço pra outras fontes no futuro
  event_type text,
  external_id text,
  error_message text NOT NULL,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhook_failures_created ON public.webhook_failures(created_at DESC);

ALTER TABLE public.webhook_failures ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.webhook_failures FROM PUBLIC;
REVOKE ALL ON public.webhook_failures FROM anon;

-- Mesmo padrão de email_send_log: só o edge function (service_role) escreve;
-- leitura pro admin acontece via RPC SECURITY DEFINER abaixo, não policy direta.
DO $$ BEGIN
  CREATE POLICY "Service role can insert webhook failures"
    ON public.webhook_failures FOR INSERT
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can read webhook failures"
    ON public.webhook_failures FOR SELECT
    USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

GRANT ALL ON public.webhook_failures TO service_role;

-- Mesma assinatura de admin_get_pending_issues (p_limit integer DEFAULT 100,
-- RETURNS jsonb) — CREATE OR REPLACE preserva os grants já existentes.
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

  SELECT COALESCE(jsonb_agg(t), '[]'::jsonb) INTO v_webhook_failures
  FROM (
    SELECT id, source, event_type, external_id, error_message, created_at
    FROM public.webhook_failures
    WHERE created_at > now() - interval '30 days'
    ORDER BY created_at DESC
    LIMIT p_limit
  ) t;

  SELECT count(*) INTO v_webhook_failures_count
  FROM public.webhook_failures
  WHERE created_at > now() - interval '30 days';

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
