-- ================================
-- CAMADA DE SEGURANÇA AVANÇADA WHATSAPP
-- ================================

-- 1. Tabela de logs de segurança para auditoria
CREATE TABLE IF NOT EXISTS public.whatsapp_security_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id TEXT,
  event_type TEXT NOT NULL, -- 'FAILED_LOGIN', 'SUSPICIOUS_IP', 'TOKEN_REFRESH', 'SESSION_EXPIRED', etc.
  severity TEXT NOT NULL DEFAULT 'LOW', -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  ip_address INET,
  user_agent TEXT,
  location_data JSONB, -- Para geolocalização
  details JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMP WITH TIME ZONE
);

-- 2. Tabela para controle de tentativas de login
CREATE TABLE IF NOT EXISTS public.whatsapp_login_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  ip_address INET NOT NULL,
  success BOOLEAN NOT NULL DEFAULT FALSE,
  attempt_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_agent TEXT,
  failure_reason TEXT,
  blocked_until TIMESTAMP WITH TIME ZONE
);

-- 3. Tabela para refresh tokens seguros
CREATE TABLE IF NOT EXISTS public.whatsapp_refresh_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  refresh_token_hash TEXT NOT NULL, -- Hash do refresh token
  encrypted_refresh_token TEXT NOT NULL, -- Token criptografado
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  user_agent TEXT
);

-- 4. Índices para performance e segurança
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON public.whatsapp_security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON public.whatsapp_security_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_logs_severity ON public.whatsapp_security_logs(severity);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON public.whatsapp_security_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_login_attempts_user_id ON public.whatsapp_login_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON public.whatsapp_login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_time ON public.whatsapp_login_attempts(attempt_time);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON public.whatsapp_refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_session_id ON public.whatsapp_refresh_tokens(session_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON public.whatsapp_refresh_tokens(refresh_token_hash);

-- 5. RLS (Row Level Security) para todas as tabelas
ALTER TABLE public.whatsapp_security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_refresh_tokens ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para logs de segurança
CREATE POLICY "Users can view their own security logs" 
ON public.whatsapp_security_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert security logs" 
ON public.whatsapp_security_logs 
FOR INSERT 
WITH CHECK (true); -- Permitir inserção do sistema

-- Políticas RLS para tentativas de login
CREATE POLICY "Users can view their own login attempts" 
ON public.whatsapp_login_attempts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can manage login attempts" 
ON public.whatsapp_login_attempts 
FOR ALL 
USING (true); -- Sistema precisa gerenciar tentativas

-- Políticas RLS para refresh tokens
CREATE POLICY "Users can view their own refresh tokens" 
ON public.whatsapp_refresh_tokens 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can manage refresh tokens" 
ON public.whatsapp_refresh_tokens 
FOR ALL 
USING (auth.uid() = user_id OR auth.uid() IS NULL); -- Sistema e usuário

-- 6. Função para registrar eventos de segurança
CREATE OR REPLACE FUNCTION public.log_whatsapp_security_event(
  p_user_id UUID,
  p_session_id TEXT DEFAULT NULL,
  p_event_type TEXT,
  p_severity TEXT DEFAULT 'LOW',
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_location_data JSONB DEFAULT NULL,
  p_details JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.whatsapp_security_logs (
    user_id, session_id, event_type, severity, 
    ip_address, user_agent, location_data, details
  ) VALUES (
    p_user_id, p_session_id, p_event_type, p_severity,
    p_ip_address, p_user_agent, p_location_data, p_details
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. Função para verificar tentativas de login suspeitas
CREATE OR REPLACE FUNCTION public.check_suspicious_login_attempts(
  p_user_id UUID,
  p_ip_address INET,
  p_max_attempts INTEGER DEFAULT 5,
  p_time_window_minutes INTEGER DEFAULT 15
) RETURNS TABLE(
  is_blocked BOOLEAN,
  attempts_count INTEGER,
  blocked_until TIMESTAMP WITH TIME ZONE,
  severity TEXT
) AS $$
DECLARE
  v_attempts_count INTEGER;
  v_blocked_until TIMESTAMP WITH TIME ZONE;
  v_is_blocked BOOLEAN := FALSE;
  v_severity TEXT := 'LOW';
BEGIN
  -- Contar tentativas falhadas no período
  SELECT COUNT(*)
  INTO v_attempts_count
  FROM public.whatsapp_login_attempts
  WHERE user_id = p_user_id 
    AND ip_address = p_ip_address
    AND success = FALSE
    AND attempt_time > (now() - (p_time_window_minutes || ' minutes')::INTERVAL);
  
  -- Verificar se está bloqueado
  SELECT MAX(blocked_until)
  INTO v_blocked_until
  FROM public.whatsapp_login_attempts
  WHERE user_id = p_user_id 
    AND ip_address = p_ip_address
    AND blocked_until > now();
  
  v_is_blocked := (v_blocked_until IS NOT NULL);
  
  -- Determinar severidade
  IF v_attempts_count >= p_max_attempts THEN
    v_severity := 'HIGH';
    IF NOT v_is_blocked THEN
      -- Bloquear por 1 hora
      v_blocked_until := now() + INTERVAL '1 hour';
      
      UPDATE public.whatsapp_login_attempts 
      SET blocked_until = v_blocked_until
      WHERE user_id = p_user_id 
        AND ip_address = p_ip_address
        AND success = FALSE
        AND attempt_time > (now() - (p_time_window_minutes || ' minutes')::INTERVAL);
        
      v_is_blocked := TRUE;
    END IF;
  ELSIF v_attempts_count >= 3 THEN
    v_severity := 'MEDIUM';
  END IF;
  
  RETURN QUERY SELECT 
    v_is_blocked,
    v_attempts_count,
    v_blocked_until,
    v_severity;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 8. Função para limpeza automática de sessões expiradas
CREATE OR REPLACE FUNCTION public.cleanup_expired_whatsapp_data()
RETURNS TABLE(
  expired_sessions INTEGER,
  cleaned_tokens INTEGER,
  old_logs INTEGER
) AS $$
DECLARE
  v_expired_sessions INTEGER := 0;
  v_cleaned_tokens INTEGER := 0;
  v_old_logs INTEGER := 0;
BEGIN
  -- Limpar sessões expiradas (mais de 24h sem atividade)
  UPDATE public.whatsapp_sessions 
  SET status = 'expirado',
      updated_at = now()
  WHERE status NOT IN ('expirado', 'desconectado')
    AND (last_activity < now() - INTERVAL '24 hours' 
         OR expires_at < now());
  
  GET DIAGNOSTICS v_expired_sessions = ROW_COUNT;
  
  -- Revogar refresh tokens expirados
  UPDATE public.whatsapp_refresh_tokens
  SET is_active = FALSE,
      revoked_at = now()
  WHERE is_active = TRUE
    AND (expires_at < now() OR last_used_at < now() - INTERVAL '7 days');
  
  GET DIAGNOSTICS v_cleaned_tokens = ROW_COUNT;
  
  -- Limpar logs antigos (manter apenas 90 dias)
  DELETE FROM public.whatsapp_security_logs 
  WHERE created_at < now() - INTERVAL '90 days';
  
  GET DIAGNOSTICS v_old_logs = ROW_COUNT;
  
  -- Limpar tentativas de login antigas (manter apenas 30 dias)
  DELETE FROM public.whatsapp_login_attempts 
  WHERE attempt_time < now() - INTERVAL '30 days';
  
  -- Registrar limpeza nos logs
  PERFORM public.log_whatsapp_security_event(
    '00000000-0000-0000-0000-000000000000'::UUID,
    NULL,
    'CLEANUP_EXECUTED',
    'LOW',
    NULL,
    'system',
    NULL,
    jsonb_build_object(
      'expired_sessions', v_expired_sessions,
      'cleaned_tokens', v_cleaned_tokens,
      'old_logs', v_old_logs
    )
  );
  
  RETURN QUERY SELECT v_expired_sessions, v_cleaned_tokens, v_old_logs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 9. Função para criar refresh token seguro
CREATE OR REPLACE FUNCTION public.create_whatsapp_refresh_token(
  p_user_id UUID,
  p_session_id TEXT,
  p_refresh_token TEXT,
  p_expires_at TIMESTAMP WITH TIME ZONE,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  token_id UUID;
  token_hash TEXT;
  encrypted_token TEXT;
BEGIN
  -- Gerar hash do token
  token_hash := encode(digest(p_refresh_token, 'sha256'), 'hex');
  
  -- Criptografar o token
  encrypted_token := public.encrypt_token(p_refresh_token);
  
  -- Revogar tokens antigos para esta sessão
  UPDATE public.whatsapp_refresh_tokens
  SET is_active = FALSE,
      revoked_at = now()
  WHERE user_id = p_user_id 
    AND session_id = p_session_id 
    AND is_active = TRUE;
  
  -- Inserir novo token
  INSERT INTO public.whatsapp_refresh_tokens (
    user_id, session_id, refresh_token_hash, 
    encrypted_refresh_token, expires_at, 
    ip_address, user_agent
  ) VALUES (
    p_user_id, p_session_id, token_hash,
    encrypted_token, p_expires_at,
    p_ip_address, p_user_agent
  ) RETURNING id INTO token_id;
  
  RETURN token_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 10. Função para validar e renovar refresh token
CREATE OR REPLACE FUNCTION public.refresh_whatsapp_token(
  p_refresh_token TEXT,
  p_user_id UUID
) RETURNS TABLE(
  is_valid BOOLEAN,
  session_id TEXT,
  new_access_token TEXT,
  new_refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_token_hash TEXT;
  v_token_record RECORD;
  v_new_access_token TEXT;
  v_new_refresh_token TEXT;
  v_new_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Gerar hash do token fornecido
  v_token_hash := encode(digest(p_refresh_token, 'sha256'), 'hex');
  
  -- Buscar token válido
  SELECT rt.session_id, rt.expires_at, rt.id
  INTO v_token_record
  FROM public.whatsapp_refresh_tokens rt
  WHERE rt.refresh_token_hash = v_token_hash
    AND rt.user_id = p_user_id
    AND rt.is_active = TRUE
    AND rt.expires_at > now();
  
  IF NOT FOUND THEN
    -- Log tentativa de refresh inválida
    PERFORM public.log_whatsapp_security_event(
      p_user_id,
      NULL,
      'INVALID_REFRESH_TOKEN',
      'HIGH',
      NULL,
      NULL,
      NULL,
      jsonb_build_object('token_hash', v_token_hash)
    );
    
    RETURN QUERY SELECT FALSE, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::TIMESTAMP WITH TIME ZONE;
    RETURN;
  END IF;
  
  -- Gerar novos tokens (simulação - na prática integrar com JWT)
  v_new_access_token := 'new_access_' || gen_random_uuid()::text;
  v_new_refresh_token := 'new_refresh_' || gen_random_uuid()::text;
  v_new_expires_at := now() + INTERVAL '7 days';
  
  -- Atualizar último uso do token atual
  UPDATE public.whatsapp_refresh_tokens
  SET last_used_at = now()
  WHERE id = v_token_record.id;
  
  -- Criar novo refresh token
  PERFORM public.create_whatsapp_refresh_token(
    p_user_id,
    v_token_record.session_id,
    v_new_refresh_token,
    v_new_expires_at
  );
  
  -- Log refresh bem-sucedido
  PERFORM public.log_whatsapp_security_event(
    p_user_id,
    v_token_record.session_id,
    'TOKEN_REFRESHED',
    'LOW',
    NULL,
    NULL,
    NULL,
    jsonb_build_object('session_id', v_token_record.session_id)
  );
  
  RETURN QUERY SELECT 
    TRUE,
    v_token_record.session_id,
    v_new_access_token,
    v_new_refresh_token,
    v_new_expires_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;