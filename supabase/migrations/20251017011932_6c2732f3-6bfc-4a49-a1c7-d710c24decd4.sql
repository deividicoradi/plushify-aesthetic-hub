-- =====================================================
-- FASE 1: CONGELAR E RENOMEAR TABELAS LEGADAS
-- =====================================================

-- Função de bloqueio para triggers
CREATE OR REPLACE FUNCTION public.block_whatsapp_legacy_modifications()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION 'whatsapp_legacy_readonly: Esta tabela foi congelada. Use as novas tabelas wa_*';
END;
$$;

-- Congelar whatsapp_sessions
ALTER TABLE IF EXISTS public.whatsapp_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "block_legacy_modifications" ON public.whatsapp_sessions;
CREATE POLICY "block_legacy_modifications" ON public.whatsapp_sessions FOR ALL USING (false) WITH CHECK (false);
CREATE TRIGGER block_modifications_trigger BEFORE INSERT OR UPDATE OR DELETE ON public.whatsapp_sessions FOR EACH ROW EXECUTE FUNCTION public.block_whatsapp_legacy_modifications();
ALTER TABLE IF EXISTS public.whatsapp_sessions RENAME TO whatsapp_sessions_legacy;

-- Congelar whatsapp_sessoes  
ALTER TABLE IF EXISTS public.whatsapp_sessoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "block_legacy_modifications" ON public.whatsapp_sessoes;
CREATE POLICY "block_legacy_modifications" ON public.whatsapp_sessoes FOR ALL USING (false) WITH CHECK (false);
CREATE TRIGGER block_modifications_trigger BEFORE INSERT OR UPDATE OR DELETE ON public.whatsapp_sessoes FOR EACH ROW EXECUTE FUNCTION public.block_whatsapp_legacy_modifications();
ALTER TABLE IF EXISTS public.whatsapp_sessoes RENAME TO whatsapp_sessoes_legacy;

-- Congelar whatsapp_session_logs
ALTER TABLE IF EXISTS public.whatsapp_session_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "block_legacy_modifications" ON public.whatsapp_session_logs;
CREATE POLICY "block_legacy_modifications" ON public.whatsapp_session_logs FOR ALL USING (false) WITH CHECK (false);
CREATE TRIGGER block_modifications_trigger BEFORE INSERT OR UPDATE OR DELETE ON public.whatsapp_session_logs FOR EACH ROW EXECUTE FUNCTION public.block_whatsapp_legacy_modifications();
ALTER TABLE IF EXISTS public.whatsapp_session_logs RENAME TO whatsapp_session_logs_legacy;

-- Congelar whatsapp_session_stats
ALTER TABLE IF EXISTS public.whatsapp_session_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "block_legacy_modifications" ON public.whatsapp_session_stats;
CREATE POLICY "block_legacy_modifications" ON public.whatsapp_session_stats FOR ALL USING (false) WITH CHECK (false);
CREATE TRIGGER block_modifications_trigger BEFORE INSERT OR UPDATE OR DELETE ON public.whatsapp_session_stats FOR EACH ROW EXECUTE FUNCTION public.block_whatsapp_legacy_modifications();
ALTER TABLE IF EXISTS public.whatsapp_session_stats RENAME TO whatsapp_session_stats_legacy;

-- Congelar whatsapp_session_isolation
ALTER TABLE IF EXISTS public.whatsapp_session_isolation ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "block_legacy_modifications" ON public.whatsapp_session_isolation;
CREATE POLICY "block_legacy_modifications" ON public.whatsapp_session_isolation FOR ALL USING (false) WITH CHECK (false);
CREATE TRIGGER block_modifications_trigger BEFORE INSERT OR UPDATE OR DELETE ON public.whatsapp_session_isolation FOR EACH ROW EXECUTE FUNCTION public.block_whatsapp_legacy_modifications();
ALTER TABLE IF EXISTS public.whatsapp_session_isolation RENAME TO whatsapp_session_isolation_legacy;

-- Congelar whatsapp_login_attempts
ALTER TABLE IF EXISTS public.whatsapp_login_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "block_legacy_modifications" ON public.whatsapp_login_attempts;
CREATE POLICY "block_legacy_modifications" ON public.whatsapp_login_attempts FOR ALL USING (false) WITH CHECK (false);
CREATE TRIGGER block_modifications_trigger BEFORE INSERT OR UPDATE OR DELETE ON public.whatsapp_login_attempts FOR EACH ROW EXECUTE FUNCTION public.block_whatsapp_legacy_modifications();
ALTER TABLE IF EXISTS public.whatsapp_login_attempts RENAME TO whatsapp_login_attempts_legacy;

-- Congelar whatsapp_refresh_tokens
ALTER TABLE IF EXISTS public.whatsapp_refresh_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "block_legacy_modifications" ON public.whatsapp_refresh_tokens;
CREATE POLICY "block_legacy_modifications" ON public.whatsapp_refresh_tokens FOR ALL USING (false) WITH CHECK (false);
CREATE TRIGGER block_modifications_trigger BEFORE INSERT OR UPDATE OR DELETE ON public.whatsapp_refresh_tokens FOR EACH ROW EXECUTE FUNCTION public.block_whatsapp_legacy_modifications();
ALTER TABLE IF EXISTS public.whatsapp_refresh_tokens RENAME TO whatsapp_refresh_tokens_legacy;

-- Congelar whatsapp_mensagens
ALTER TABLE IF EXISTS public.whatsapp_mensagens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "block_legacy_modifications" ON public.whatsapp_mensagens;
CREATE POLICY "block_legacy_modifications" ON public.whatsapp_mensagens FOR ALL USING (false) WITH CHECK (false);
CREATE TRIGGER block_modifications_trigger BEFORE INSERT OR UPDATE OR DELETE ON public.whatsapp_mensagens FOR EACH ROW EXECUTE FUNCTION public.block_whatsapp_legacy_modifications();
ALTER TABLE IF EXISTS public.whatsapp_mensagens RENAME TO whatsapp_mensagens_legacy;

-- Congelar whatsapp_mensagens_temp
ALTER TABLE IF EXISTS public.whatsapp_mensagens_temp ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "block_legacy_modifications" ON public.whatsapp_mensagens_temp;
CREATE POLICY "block_legacy_modifications" ON public.whatsapp_mensagens_temp FOR ALL USING (false) WITH CHECK (false);
CREATE TRIGGER block_modifications_trigger BEFORE INSERT OR UPDATE OR DELETE ON public.whatsapp_mensagens_temp FOR EACH ROW EXECUTE FUNCTION public.block_whatsapp_legacy_modifications();
ALTER TABLE IF EXISTS public.whatsapp_mensagens_temp RENAME TO whatsapp_mensagens_temp_legacy;

-- Congelar whatsapp_messages
ALTER TABLE IF EXISTS public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "block_legacy_modifications" ON public.whatsapp_messages;
CREATE POLICY "block_legacy_modifications" ON public.whatsapp_messages FOR ALL USING (false) WITH CHECK (false);
CREATE TRIGGER block_modifications_trigger BEFORE INSERT OR UPDATE OR DELETE ON public.whatsapp_messages FOR EACH ROW EXECUTE FUNCTION public.block_whatsapp_legacy_modifications();
ALTER TABLE IF EXISTS public.whatsapp_messages RENAME TO whatsapp_messages_legacy;

-- Congelar whatsapp_message_queue
ALTER TABLE IF EXISTS public.whatsapp_message_queue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "block_legacy_modifications" ON public.whatsapp_message_queue;
CREATE POLICY "block_legacy_modifications" ON public.whatsapp_message_queue FOR ALL USING (false) WITH CHECK (false);
CREATE TRIGGER block_modifications_trigger BEFORE INSERT OR UPDATE OR DELETE ON public.whatsapp_message_queue FOR EACH ROW EXECUTE FUNCTION public.block_whatsapp_legacy_modifications();
ALTER TABLE IF EXISTS public.whatsapp_message_queue RENAME TO whatsapp_message_queue_legacy;

-- Congelar whatsapp_contatos
ALTER TABLE IF EXISTS public.whatsapp_contatos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "block_legacy_modifications" ON public.whatsapp_contatos;
CREATE POLICY "block_legacy_modifications" ON public.whatsapp_contatos FOR ALL USING (false) WITH CHECK (false);
CREATE TRIGGER block_modifications_trigger BEFORE INSERT OR UPDATE OR DELETE ON public.whatsapp_contatos FOR EACH ROW EXECUTE FUNCTION public.block_whatsapp_legacy_modifications();
ALTER TABLE IF EXISTS public.whatsapp_contatos RENAME TO whatsapp_contatos_legacy;

-- Congelar whatsapp_metrics
ALTER TABLE IF EXISTS public.whatsapp_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "block_legacy_modifications" ON public.whatsapp_metrics;
CREATE POLICY "block_legacy_modifications" ON public.whatsapp_metrics FOR ALL USING (false) WITH CHECK (false);
CREATE TRIGGER block_modifications_trigger BEFORE INSERT OR UPDATE OR DELETE ON public.whatsapp_metrics FOR EACH ROW EXECUTE FUNCTION public.block_whatsapp_legacy_modifications();
ALTER TABLE IF EXISTS public.whatsapp_metrics RENAME TO whatsapp_metrics_legacy;

-- Congelar whatsapp_performance_metrics
ALTER TABLE IF EXISTS public.whatsapp_performance_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "block_legacy_modifications" ON public.whatsapp_performance_metrics;
CREATE POLICY "block_legacy_modifications" ON public.whatsapp_performance_metrics FOR ALL USING (false) WITH CHECK (false);
CREATE TRIGGER block_modifications_trigger BEFORE INSERT OR UPDATE OR DELETE ON public.whatsapp_performance_metrics FOR EACH ROW EXECUTE FUNCTION public.block_whatsapp_legacy_modifications();
ALTER TABLE IF EXISTS public.whatsapp_performance_metrics RENAME TO whatsapp_performance_metrics_legacy;

-- Congelar whatsapp_logs
ALTER TABLE IF EXISTS public.whatsapp_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "block_legacy_modifications" ON public.whatsapp_logs;
CREATE POLICY "block_legacy_modifications" ON public.whatsapp_logs FOR ALL USING (false) WITH CHECK (false);
CREATE TRIGGER block_modifications_trigger BEFORE INSERT OR UPDATE OR DELETE ON public.whatsapp_logs FOR EACH ROW EXECUTE FUNCTION public.block_whatsapp_legacy_modifications();
ALTER TABLE IF EXISTS public.whatsapp_logs RENAME TO whatsapp_logs_legacy;

-- Congelar whatsapp_alerts
ALTER TABLE IF EXISTS public.whatsapp_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "block_legacy_modifications" ON public.whatsapp_alerts;
CREATE POLICY "block_legacy_modifications" ON public.whatsapp_alerts FOR ALL USING (false) WITH CHECK (false);
CREATE TRIGGER block_modifications_trigger BEFORE INSERT OR UPDATE OR DELETE ON public.whatsapp_alerts FOR EACH ROW EXECUTE FUNCTION public.block_whatsapp_legacy_modifications();
ALTER TABLE IF EXISTS public.whatsapp_alerts RENAME TO whatsapp_alerts_legacy;

-- Congelar whatsapp_health_status
ALTER TABLE IF EXISTS public.whatsapp_health_status ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "block_legacy_modifications" ON public.whatsapp_health_status;
CREATE POLICY "block_legacy_modifications" ON public.whatsapp_health_status FOR ALL USING (false) WITH CHECK (false);
CREATE TRIGGER block_modifications_trigger BEFORE INSERT OR UPDATE OR DELETE ON public.whatsapp_health_status FOR EACH ROW EXECUTE FUNCTION public.block_whatsapp_legacy_modifications();
ALTER TABLE IF EXISTS public.whatsapp_health_status RENAME TO whatsapp_health_status_legacy;

-- Congelar whatsapp_rate_limits
ALTER TABLE IF EXISTS public.whatsapp_rate_limits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "block_legacy_modifications" ON public.whatsapp_rate_limits;
CREATE POLICY "block_legacy_modifications" ON public.whatsapp_rate_limits FOR ALL USING (false) WITH CHECK (false);
CREATE TRIGGER block_modifications_trigger BEFORE INSERT OR UPDATE OR DELETE ON public.whatsapp_rate_limits FOR EACH ROW EXECUTE FUNCTION public.block_whatsapp_legacy_modifications();
ALTER TABLE IF EXISTS public.whatsapp_rate_limits RENAME TO whatsapp_rate_limits_legacy;

-- Congelar whatsapp_load_tests
ALTER TABLE IF EXISTS public.whatsapp_load_tests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "block_legacy_modifications" ON public.whatsapp_load_tests;
CREATE POLICY "block_legacy_modifications" ON public.whatsapp_load_tests FOR ALL USING (false) WITH CHECK (false);
CREATE TRIGGER block_modifications_trigger BEFORE INSERT OR UPDATE OR DELETE ON public.whatsapp_load_tests FOR EACH ROW EXECUTE FUNCTION public.block_whatsapp_legacy_modifications();
ALTER TABLE IF EXISTS public.whatsapp_load_tests RENAME TO whatsapp_load_tests_legacy;

-- Congelar whatsapp_security_logs
ALTER TABLE IF EXISTS public.whatsapp_security_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "block_legacy_modifications" ON public.whatsapp_security_logs;
CREATE POLICY "block_legacy_modifications" ON public.whatsapp_security_logs FOR ALL USING (false) WITH CHECK (false);
CREATE TRIGGER block_modifications_trigger BEFORE INSERT OR UPDATE OR DELETE ON public.whatsapp_security_logs FOR EACH ROW EXECUTE FUNCTION public.block_whatsapp_legacy_modifications();
ALTER TABLE IF EXISTS public.whatsapp_security_logs RENAME TO whatsapp_security_logs_legacy;

-- Renomear view (sem trigger pois é view)
ALTER VIEW IF EXISTS public.active_whatsapp_sessions RENAME TO active_whatsapp_sessions_legacy;