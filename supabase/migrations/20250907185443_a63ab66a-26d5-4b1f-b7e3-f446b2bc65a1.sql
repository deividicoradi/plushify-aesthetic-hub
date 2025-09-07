-- Sistema de Monitoramento e Observabilidade WhatsApp

-- Tabela para métricas em tempo real
CREATE TABLE IF NOT EXISTS public.whatsapp_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_type TEXT NOT NULL DEFAULT 'gauge', -- gauge, counter, histogram
  labels JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela para logs centralizados
CREATE TABLE IF NOT EXISTS public.whatsapp_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  session_id TEXT,
  level TEXT NOT NULL DEFAULT 'info', -- info, warn, error, debug
  event_type TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela para alertas e notificações
CREATE TABLE IF NOT EXISTS public.whatsapp_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, critical
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela para status de saúde do sistema
CREATE TABLE IF NOT EXISTS public.whatsapp_health_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'healthy', -- healthy, degraded, unhealthy
  last_check TIMESTAMP WITH TIME ZONE DEFAULT now(),
  response_time NUMERIC DEFAULT 0,
  error_rate NUMERIC DEFAULT 0,
  uptime_percentage NUMERIC DEFAULT 100,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_metrics_name_time ON public.whatsapp_metrics(metric_name, timestamp);
CREATE INDEX IF NOT EXISTS idx_whatsapp_metrics_timestamp ON public.whatsapp_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_level_time ON public.whatsapp_logs(level, timestamp);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_event_type ON public.whatsapp_logs(event_type, timestamp);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_user_id ON public.whatsapp_logs(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_whatsapp_alerts_severity ON public.whatsapp_alerts(severity, created_at);
CREATE INDEX IF NOT EXISTS idx_whatsapp_health_status_service ON public.whatsapp_health_status(service_name, last_check);

-- RLS Policies
ALTER TABLE public.whatsapp_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "System can insert metrics" ON public.whatsapp_metrics
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all metrics" ON public.whatsapp_metrics
  FOR SELECT USING (true); -- Will be restricted by application logic

ALTER TABLE public.whatsapp_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "System can insert logs" ON public.whatsapp_logs
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all logs" ON public.whatsapp_logs
  FOR SELECT USING (true); -- Will be restricted by application logic

ALTER TABLE public.whatsapp_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "System can manage alerts" ON public.whatsapp_alerts
  FOR ALL USING (true);

ALTER TABLE public.whatsapp_health_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "System can manage health status" ON public.whatsapp_health_status
  FOR ALL USING (true);

-- Funções para coleta de métricas
CREATE OR REPLACE FUNCTION public.record_whatsapp_metric(
  p_metric_name TEXT,
  p_metric_value NUMERIC,
  p_metric_type TEXT DEFAULT 'gauge',
  p_labels JSONB DEFAULT '{}'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  metric_id UUID;
BEGIN
  INSERT INTO public.whatsapp_metrics (
    metric_name, metric_value, metric_type, labels
  ) VALUES (
    p_metric_name, p_metric_value, p_metric_type, p_labels
  ) RETURNING id INTO metric_id;
  
  RETURN metric_id;
END;
$$;

-- Função para logging centralizado
CREATE OR REPLACE FUNCTION public.log_whatsapp_event(
  p_user_id UUID DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_level TEXT DEFAULT 'info',
  p_event_type TEXT DEFAULT 'general',
  p_message TEXT DEFAULT '',
  p_metadata JSONB DEFAULT '{}',
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.whatsapp_logs (
    user_id, session_id, level, event_type, message, 
    metadata, ip_address, user_agent
  ) VALUES (
    p_user_id, p_session_id, p_level, p_event_type, p_message,
    p_metadata, p_ip_address, p_user_agent
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Função para criar alertas
CREATE OR REPLACE FUNCTION public.create_whatsapp_alert(
  p_alert_type TEXT,
  p_severity TEXT DEFAULT 'medium',
  p_title TEXT DEFAULT '',
  p_description TEXT DEFAULT '',
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  alert_id UUID;
BEGIN
  INSERT INTO public.whatsapp_alerts (
    alert_type, severity, title, description, metadata
  ) VALUES (
    p_alert_type, p_severity, p_title, p_description, p_metadata
  ) RETURNING id INTO alert_id;
  
  RETURN alert_id;
END;
$$;

-- Função para atualizar status de saúde
CREATE OR REPLACE FUNCTION public.update_whatsapp_health(
  p_service_name TEXT,
  p_status TEXT DEFAULT 'healthy',
  p_response_time NUMERIC DEFAULT 0,
  p_error_rate NUMERIC DEFAULT 0,
  p_metadata JSONB DEFAULT '{}'
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.whatsapp_health_status (
    service_name, status, response_time, error_rate, metadata, last_check
  ) VALUES (
    p_service_name, p_status, p_response_time, p_error_rate, p_metadata, now()
  )
  ON CONFLICT (service_name) DO UPDATE SET
    status = EXCLUDED.status,
    response_time = EXCLUDED.response_time,
    error_rate = EXCLUDED.error_rate,
    metadata = EXCLUDED.metadata,
    last_check = now(),
    updated_at = now();
END;
$$;

-- Função para métricas agregadas
CREATE OR REPLACE FUNCTION public.get_whatsapp_metrics_aggregated(
  p_metric_name TEXT,
  p_start_time TIMESTAMP WITH TIME ZONE DEFAULT now() - INTERVAL '1 hour',
  p_end_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  p_interval_minutes INTEGER DEFAULT 5
) RETURNS TABLE(
  time_bucket TIMESTAMP WITH TIME ZONE,
  avg_value NUMERIC,
  min_value NUMERIC,
  max_value NUMERIC,
  count_values BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    date_trunc('minute', m.timestamp) + 
    (EXTRACT(minute FROM m.timestamp)::INTEGER / p_interval_minutes) * 
    (p_interval_minutes || ' minutes')::INTERVAL as time_bucket,
    AVG(m.metric_value) as avg_value,
    MIN(m.metric_value) as min_value,
    MAX(m.metric_value) as max_value,
    COUNT(*) as count_values
  FROM public.whatsapp_metrics m
  WHERE m.metric_name = p_metric_name
    AND m.timestamp >= p_start_time
    AND m.timestamp <= p_end_time
  GROUP BY time_bucket
  ORDER BY time_bucket;
END;
$$;

-- Triggers para limpeza automática
CREATE OR REPLACE FUNCTION public.cleanup_old_monitoring_data()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  cleaned_count INTEGER := 0;
BEGIN
  -- Limpar métricas antigas (manter 30 dias)
  DELETE FROM public.whatsapp_metrics 
  WHERE timestamp < now() - INTERVAL '30 days';
  GET DIAGNOSTICS cleaned_count = ROW_COUNT;
  
  -- Limpar logs antigos (manter 90 dias para logs info/debug, 180 dias para warn/error)
  DELETE FROM public.whatsapp_logs 
  WHERE timestamp < now() - INTERVAL '90 days'
    AND level IN ('info', 'debug');
    
  DELETE FROM public.whatsapp_logs 
  WHERE timestamp < now() - INTERVAL '180 days'
    AND level IN ('warn', 'error');
  
  -- Limpar alertas resolvidos antigos (manter 30 dias)
  DELETE FROM public.whatsapp_alerts 
  WHERE resolved = true 
    AND resolved_at < now() - INTERVAL '30 days';
  
  RETURN cleaned_count;
END;
$$;