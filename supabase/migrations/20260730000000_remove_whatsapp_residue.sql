-- Remove todo o resíduo da tentativa antiga (e abandonada) de integração
-- direta com WhatsApp (pareamento por QR code, sessões, fila de mensagens,
-- monitoramento de saúde, testes de carga, tentativas de login etc.).
-- Confirmado por auditoria que NENHUM código do frontend (src/) ou edge
-- function ativa depende de qualquer uma dessas tabelas/funções — o único
-- uso de "WhatsApp" que continua no app são links `wa.me/...` simples
-- (lembrete de agendamento, reengajamento de cliente, suporte, contato
-- comercial), que não têm nenhuma dependência de banco e continuam intactos.
--
-- Não edita/remove as ~81 migrations históricas que criaram esse esquema
-- (romperia o histórico) — só remove o que restou vivo no banco hoje.

-- Desagenda qualquer cron job residual (caso tenha sido criado fora das
-- migrations, direto pelo dashboard) — só executa se a extensão existir.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule(jobname)
    FROM cron.job
    WHERE jobname ILIKE '%whatsapp%';
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL; -- nunca bloqueia a migration por causa disso
END $$;

DROP VIEW IF EXISTS public.active_whatsapp_sessions CASCADE;

DROP TABLE IF EXISTS
  public.whatsapp_sessoes,
  public.whatsapp_contatos,
  public.whatsapp_mensagens,
  public.whatsapp_mensagens_temp,
  public.whatsapp_sessions,
  public.whatsapp_rate_limits,
  public.whatsapp_session_logs,
  public.whatsapp_login_attempts,
  public.whatsapp_refresh_tokens,
  public.whatsapp_session_stats,
  public.whatsapp_messages,
  public.whatsapp_load_tests,
  public.whatsapp_message_queue,
  public.whatsapp_session_isolation,
  public.whatsapp_performance_metrics,
  public.whatsapp_alerts,
  public.whatsapp_health_status,
  public.whatsapp_metrics,
  public.whatsapp_logs,
  public.whatsapp_security_logs
CASCADE;

-- DROP FUNCTION IF EXISTS name() só casa a assinatura exata (sem args); como
-- não temos certeza da assinatura de cada uma das 24 funções remanescentes
-- (algumas podem receber parâmetros), removemos por OID via pg_proc em vez
-- de tentar adivinhar cada assinatura — isso garante que todas as
-- sobrecargas de cada nome sejam removidas independente dos parâmetros.
DO $$
DECLARE
  fn record;
BEGIN
  FOR fn IN
    SELECT p.oid::regprocedure AS signature
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'audit_whatsapp_contatos_changes',
        'block_whatsapp_legacy_modifications',
        'cleanup_expired_whatsapp_data',
        'cleanup_expired_whatsapp_sessions',
        'cleanup_old_whatsapp_data',
        'create_whatsapp_alert',
        'create_whatsapp_refresh_token',
        'delete_whatsapp_messages_secure',
        'enqueue_whatsapp_message',
        'ensure_single_whatsapp_session',
        'get_whatsapp_contatos_secure',
        'get_whatsapp_messages_secure',
        'get_whatsapp_metrics_aggregated',
        'get_whatsapp_security_alerts',
        'get_whatsapp_stats',
        'get_whatsapp_token',
        'log_whatsapp_event',
        'log_whatsapp_login_attempt',
        'log_whatsapp_rate_limit',
        'log_whatsapp_security_event',
        'record_whatsapp_metric',
        'refresh_whatsapp_token',
        'store_whatsapp_token',
        'update_whatsapp_contact_stats',
        'update_whatsapp_health',
        'update_whatsapp_stats',
        'whatsapp_security_audit'
      )
  LOOP
    EXECUTE format('DROP FUNCTION IF EXISTS %s CASCADE', fn.signature);
  END LOOP;
END $$;
