-- Migration: Security enhancements - Rate limiting, Audit logging, Token rotation, Monitoring

-- 1. Rate Limiting Table
CREATE TABLE IF NOT EXISTS public.wa_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_request_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wa_rate_limits_tenant_endpoint ON public.wa_rate_limits(tenant_id, endpoint, window_start);
CREATE INDEX idx_wa_rate_limits_window ON public.wa_rate_limits(window_start);

-- 2. WhatsApp Audit Logs Table
CREATE TABLE IF NOT EXISTS public.wa_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  action TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  request_data JSONB,
  response_status INTEGER,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wa_audit_logs_tenant ON public.wa_audit_logs(tenant_id, created_at DESC);
CREATE INDEX idx_wa_audit_logs_action ON public.wa_audit_logs(action, created_at DESC);
CREATE INDEX idx_wa_audit_logs_success ON public.wa_audit_logs(success, created_at DESC);

-- 3. Token Refresh Table
CREATE TABLE IF NOT EXISTS public.wa_token_refresh (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  account_id UUID NOT NULL REFERENCES public.wa_accounts(id) ON DELETE CASCADE,
  old_token_hash TEXT,
  new_token_hash TEXT,
  refresh_reason TEXT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  executed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wa_token_refresh_tenant ON public.wa_token_refresh(tenant_id, status);
CREATE INDEX idx_wa_token_refresh_scheduled ON public.wa_token_refresh(scheduled_at) WHERE status = 'pending';

-- 4. Security Alerts Table
CREATE TABLE IF NOT EXISTS public.wa_security_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  tenant_id UUID,
  endpoint TEXT,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wa_security_alerts_type ON public.wa_security_alerts(alert_type, created_at DESC);
CREATE INDEX idx_wa_security_alerts_severity ON public.wa_security_alerts(severity, resolved);
CREATE INDEX idx_wa_security_alerts_tenant ON public.wa_security_alerts(tenant_id, created_at DESC);

-- 5. Function to check rate limit
CREATE OR REPLACE FUNCTION public.check_wa_rate_limit(
  p_tenant_id UUID,
  p_endpoint TEXT,
  p_max_requests INTEGER DEFAULT 60,
  p_window_minutes INTEGER DEFAULT 1,
  p_ip_address INET DEFAULT NULL
)
RETURNS TABLE(allowed BOOLEAN, remaining INTEGER, reset_at TIMESTAMP WITH TIME ZONE)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start TIMESTAMP WITH TIME ZONE;
  v_current_count INTEGER;
  v_reset_at TIMESTAMP WITH TIME ZONE;
BEGIN
  v_window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Clean old rate limit records
  DELETE FROM public.wa_rate_limits 
  WHERE window_start < v_window_start;
  
  -- Get current count in window
  SELECT COALESCE(SUM(request_count), 0)
  INTO v_current_count
  FROM public.wa_rate_limits
  WHERE tenant_id = p_tenant_id
    AND endpoint = p_endpoint
    AND window_start >= v_window_start;
  
  -- Check if limit exceeded
  IF v_current_count >= p_max_requests THEN
    SELECT MAX(window_start) + (p_window_minutes || ' minutes')::INTERVAL
    INTO v_reset_at
    FROM public.wa_rate_limits
    WHERE tenant_id = p_tenant_id AND endpoint = p_endpoint;
    
    RETURN QUERY SELECT false, 0, v_reset_at;
  ELSE
    -- Record this request
    INSERT INTO public.wa_rate_limits (tenant_id, endpoint, window_start, ip_address)
    VALUES (p_tenant_id, p_endpoint, NOW(), p_ip_address);
    
    v_reset_at := NOW() + (p_window_minutes || ' minutes')::INTERVAL;
    RETURN QUERY SELECT true, (p_max_requests - v_current_count - 1), v_reset_at;
  END IF;
END;
$$;

-- 6. Function to log audit event
CREATE OR REPLACE FUNCTION public.log_wa_audit(
  p_tenant_id UUID,
  p_action TEXT,
  p_endpoint TEXT,
  p_request_data JSONB DEFAULT NULL,
  p_response_status INTEGER DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_success BOOLEAN DEFAULT true,
  p_error_message TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_audit_id UUID;
BEGIN
  INSERT INTO public.wa_audit_logs (
    tenant_id, action, endpoint, request_data, response_status,
    ip_address, user_agent, success, error_message, metadata
  ) VALUES (
    p_tenant_id, p_action, p_endpoint, p_request_data, p_response_status,
    p_ip_address, p_user_agent, p_success, p_error_message, p_metadata
  ) RETURNING id INTO v_audit_id;
  
  RETURN v_audit_id;
END;
$$;

-- 7. Function to create security alert
CREATE OR REPLACE FUNCTION public.create_wa_security_alert(
  p_alert_type TEXT,
  p_severity TEXT,
  p_description TEXT,
  p_tenant_id UUID DEFAULT NULL,
  p_endpoint TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_alert_id UUID;
BEGIN
  INSERT INTO public.wa_security_alerts (
    alert_type, severity, description, tenant_id, endpoint, metadata
  ) VALUES (
    p_alert_type, p_severity, p_description, p_tenant_id, p_endpoint, p_metadata
  ) RETURNING id INTO v_alert_id;
  
  RETURN v_alert_id;
END;
$$;

-- 8. Function to schedule token rotation
CREATE OR REPLACE FUNCTION public.schedule_wa_token_rotation(
  p_tenant_id UUID,
  p_account_id UUID,
  p_reason TEXT DEFAULT 'scheduled_rotation',
  p_scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rotation_id UUID;
  v_scheduled_time TIMESTAMP WITH TIME ZONE;
BEGIN
  v_scheduled_time := COALESCE(p_scheduled_at, NOW() + INTERVAL '24 hours');
  
  INSERT INTO public.wa_token_refresh (
    tenant_id, account_id, refresh_reason, scheduled_at, status
  ) VALUES (
    p_tenant_id, p_account_id, p_reason, v_scheduled_time, 'pending'
  ) RETURNING id INTO v_rotation_id;
  
  RETURN v_rotation_id;
END;
$$;

-- 9. Cleanup function for old logs
CREATE OR REPLACE FUNCTION public.cleanup_wa_logs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted_count INTEGER := 0;
BEGIN
  -- Delete audit logs older than 90 days
  DELETE FROM public.wa_audit_logs 
  WHERE created_at < NOW() - INTERVAL '90 days';
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  -- Delete resolved alerts older than 30 days
  DELETE FROM public.wa_security_alerts 
  WHERE resolved = true AND resolved_at < NOW() - INTERVAL '30 days';
  
  -- Delete old rate limit records
  DELETE FROM public.wa_rate_limits 
  WHERE window_start < NOW() - INTERVAL '1 hour';
  
  RETURN v_deleted_count;
END;
$$;

-- 10. RLS Policies
ALTER TABLE public.wa_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wa_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wa_token_refresh ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wa_security_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY wa_rate_limits_select ON public.wa_rate_limits FOR SELECT USING (tenant_id = auth.uid());
CREATE POLICY wa_audit_logs_select ON public.wa_audit_logs FOR SELECT USING (tenant_id = auth.uid());
CREATE POLICY wa_token_refresh_select ON public.wa_token_refresh FOR SELECT USING (tenant_id = auth.uid());
CREATE POLICY wa_security_alerts_select ON public.wa_security_alerts FOR SELECT USING (tenant_id = auth.uid() OR tenant_id IS NULL);

-- 11. Grant permissions
GRANT EXECUTE ON FUNCTION public.check_wa_rate_limit(UUID, TEXT, INTEGER, INTEGER, INET) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_wa_audit(UUID, TEXT, TEXT, JSONB, INTEGER, INET, TEXT, BOOLEAN, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_wa_security_alert(TEXT, TEXT, TEXT, UUID, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.schedule_wa_token_rotation(UUID, UUID, TEXT, TIMESTAMP WITH TIME ZONE) TO authenticated;