-- Sistema de Filas de Mensagens e Escalabilidade
CREATE TABLE IF NOT EXISTS public.whatsapp_message_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  contact_name TEXT,
  priority INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_message_queue_user_status ON public.whatsapp_message_queue(user_id, status);
CREATE INDEX IF NOT EXISTS idx_message_queue_scheduled_at ON public.whatsapp_message_queue(scheduled_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_message_queue_priority ON public.whatsapp_message_queue(priority DESC, created_at ASC) WHERE status = 'pending';

-- Sistema de Métricas em Tempo Real
CREATE TABLE IF NOT EXISTS public.whatsapp_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  metric_type TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT NOT NULL DEFAULT 'count',
  tags JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para métricas
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_time ON public.whatsapp_performance_metrics(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_type ON public.whatsapp_performance_metrics(metric_type, timestamp);

-- Sistema de Isolamento de Sessões
CREATE TABLE IF NOT EXISTS public.whatsapp_session_isolation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  instance_id TEXT NOT NULL,
  cpu_usage NUMERIC DEFAULT 0,
  memory_usage NUMERIC DEFAULT 0,
  connection_count INTEGER DEFAULT 0,
  last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT now(),
  health_status TEXT DEFAULT 'healthy',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Sistema de Load Testing
CREATE TABLE IF NOT EXISTS public.whatsapp_load_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_name TEXT NOT NULL,
  concurrent_users INTEGER NOT NULL,
  duration_seconds INTEGER NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  total_requests INTEGER DEFAULT 0,
  successful_requests INTEGER DEFAULT 0,
  failed_requests INTEGER DEFAULT 0,
  avg_response_time NUMERIC DEFAULT 0,
  max_response_time NUMERIC DEFAULT 0,
  cpu_peak NUMERIC DEFAULT 0,
  memory_peak NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending',
  results JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.whatsapp_message_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own message queue" ON public.whatsapp_message_queue
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.whatsapp_performance_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own metrics" ON public.whatsapp_performance_metrics
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert metrics" ON public.whatsapp_performance_metrics
  FOR INSERT WITH CHECK (true);

ALTER TABLE public.whatsapp_session_isolation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own isolation data" ON public.whatsapp_session_isolation
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.whatsapp_load_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage load tests" ON public.whatsapp_load_tests
  FOR ALL USING (true);

-- Funções para Processamento de Filas
CREATE OR REPLACE FUNCTION public.enqueue_whatsapp_message(
  p_user_id UUID,
  p_session_id TEXT,
  p_phone TEXT,
  p_message TEXT,
  p_contact_name TEXT DEFAULT NULL,
  p_priority INTEGER DEFAULT 0
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  queue_id UUID;
BEGIN
  INSERT INTO public.whatsapp_message_queue (
    user_id, session_id, phone, message, contact_name, priority
  ) VALUES (
    p_user_id, p_session_id, p_phone, p_message, p_contact_name, p_priority
  ) RETURNING id INTO queue_id;
  
  RETURN queue_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.process_message_queue(
  p_batch_size INTEGER DEFAULT 10
) RETURNS TABLE(
  id UUID,
  user_id UUID,
  session_id TEXT,
  phone TEXT,
  message TEXT,
  contact_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Marcar mensagens como processando
  UPDATE public.whatsapp_message_queue 
  SET status = 'processing', 
      processed_at = now(),
      updated_at = now()
  WHERE id IN (
    SELECT wmq.id FROM public.whatsapp_message_queue wmq
    WHERE wmq.status = 'pending' 
      AND wmq.scheduled_at <= now()
    ORDER BY wmq.priority DESC, wmq.created_at ASC
    LIMIT p_batch_size
    FOR UPDATE SKIP LOCKED
  );
  
  -- Retornar mensagens para processamento
  RETURN QUERY
  SELECT wmq.id, wmq.user_id, wmq.session_id, wmq.phone, wmq.message, wmq.contact_name
  FROM public.whatsapp_message_queue wmq
  WHERE wmq.status = 'processing'
    AND wmq.processed_at >= now() - INTERVAL '1 minute';
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_message_processing(
  p_queue_id UUID,
  p_success BOOLEAN,
  p_error_message TEXT DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF p_success THEN
    UPDATE public.whatsapp_message_queue 
    SET status = 'completed',
        updated_at = now()
    WHERE id = p_queue_id;
  ELSE
    UPDATE public.whatsapp_message_queue 
    SET status = CASE 
                  WHEN retry_count >= max_retries THEN 'failed'
                  ELSE 'pending'
                 END,
        retry_count = retry_count + 1,
        error_message = p_error_message,
        failed_at = CASE WHEN retry_count >= max_retries THEN now() ELSE NULL END,
        scheduled_at = CASE 
                        WHEN retry_count < max_retries THEN now() + (INTERVAL '1 minute' * (retry_count + 1))
                        ELSE scheduled_at
                       END,
        updated_at = now()
    WHERE id = p_queue_id;
  END IF;
END;
$$;

-- Função para métricas de performance
CREATE OR REPLACE FUNCTION public.record_performance_metric(
  p_user_id UUID,
  p_session_id TEXT,
  p_metric_type TEXT,
  p_metric_value NUMERIC,
  p_metric_unit TEXT DEFAULT 'count',
  p_tags JSONB DEFAULT '{}'
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.whatsapp_performance_metrics (
    user_id, session_id, metric_type, metric_value, metric_unit, tags
  ) VALUES (
    p_user_id, p_session_id, p_metric_type, p_metric_value, p_metric_unit, p_tags
  );
END;
$$;

-- Função para monitoramento de isolamento
CREATE OR REPLACE FUNCTION public.update_session_isolation(
  p_user_id UUID,
  p_instance_id TEXT,
  p_cpu_usage NUMERIC DEFAULT 0,
  p_memory_usage NUMERIC DEFAULT 0,
  p_connection_count INTEGER DEFAULT 0,
  p_health_status TEXT DEFAULT 'healthy'
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.whatsapp_session_isolation (
    user_id, instance_id, cpu_usage, memory_usage, 
    connection_count, health_status, last_heartbeat
  ) VALUES (
    p_user_id, p_instance_id, p_cpu_usage, p_memory_usage,
    p_connection_count, p_health_status, now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    instance_id = EXCLUDED.instance_id,
    cpu_usage = EXCLUDED.cpu_usage,
    memory_usage = EXCLUDED.memory_usage,
    connection_count = EXCLUDED.connection_count,
    health_status = EXCLUDED.health_status,
    last_heartbeat = now(),
    updated_at = now();
END;
$$;

-- Função para limpeza de dados antigos
CREATE OR REPLACE FUNCTION public.cleanup_old_whatsapp_data()
RETURNS TABLE(
  cleaned_messages INTEGER,
  cleaned_metrics INTEGER,
  cleaned_sessions INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_cleaned_messages INTEGER;
  v_cleaned_metrics INTEGER;
  v_cleaned_sessions INTEGER;
BEGIN
  -- Limpar mensagens processadas antigas (7 dias)
  DELETE FROM public.whatsapp_message_queue 
  WHERE status IN ('completed', 'failed') 
    AND updated_at < now() - INTERVAL '7 days';
  GET DIAGNOSTICS v_cleaned_messages = ROW_COUNT;
  
  -- Limpar métricas antigas (30 dias)
  DELETE FROM public.whatsapp_performance_metrics 
  WHERE timestamp < now() - INTERVAL '30 days';
  GET DIAGNOSTICS v_cleaned_metrics = ROW_COUNT;
  
  -- Marcar sessões inativas como expiradas
  UPDATE public.whatsapp_session_isolation 
  SET health_status = 'expired',
      updated_at = now()
  WHERE last_heartbeat < now() - INTERVAL '10 minutes'
    AND health_status != 'expired';
  GET DIAGNOSTICS v_cleaned_sessions = ROW_COUNT;
  
  RETURN QUERY SELECT v_cleaned_messages, v_cleaned_metrics, v_cleaned_sessions;
END;
$$;

-- Triggers para atualização automática
CREATE OR REPLACE FUNCTION public.update_queue_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_message_queue_timestamp
  BEFORE UPDATE ON public.whatsapp_message_queue
  FOR EACH ROW
  EXECUTE FUNCTION public.update_queue_timestamp();

CREATE TRIGGER update_isolation_timestamp
  BEFORE UPDATE ON public.whatsapp_session_isolation
  FOR EACH ROW
  EXECUTE FUNCTION public.update_queue_timestamp();