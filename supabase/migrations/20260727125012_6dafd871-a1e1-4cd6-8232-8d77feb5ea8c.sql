DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule(jobname)
    FROM cron.job
    WHERE jobname ILIKE '%whatsapp%';
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
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