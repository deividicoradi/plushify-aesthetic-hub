-- ================================
-- FUNÇÕES DE SEGURANÇA AVANÇADA WHATSAPP
-- ================================

-- 1. Função para registrar eventos de segurança
CREATE OR REPLACE FUNCTION public.log_whatsapp_security_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_session_id TEXT DEFAULT NULL,
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

-- 2. Função para verificar tentativas de login suspeitas
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

-- 3. Função para limpeza automática de sessões expiradas
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
    'CLEANUP_EXECUTED',
    NULL,
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

-- 4. Função para criar refresh token seguro
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

-- 5. Função para validar e renovar refresh token
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
      'INVALID_REFRESH_TOKEN',
      NULL,
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
    'TOKEN_REFRESHED',
    v_token_record.session_id,
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

-- 6. Função para registrar tentativa de login
CREATE OR REPLACE FUNCTION public.log_whatsapp_login_attempt(
  p_user_id UUID,
  p_ip_address INET,
  p_success BOOLEAN,
  p_user_agent TEXT DEFAULT NULL,
  p_failure_reason TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  attempt_id UUID;
  security_check RECORD;
BEGIN
  -- Inserir tentativa de login
  INSERT INTO public.whatsapp_login_attempts (
    user_id, ip_address, success, user_agent, failure_reason
  ) VALUES (
    p_user_id, p_ip_address, p_success, p_user_agent, p_failure_reason
  ) RETURNING id INTO attempt_id;
  
  -- Se falhou, verificar se é suspeito
  IF NOT p_success THEN
    SELECT * INTO security_check 
    FROM public.check_suspicious_login_attempts(p_user_id, p_ip_address);
    
    -- Registrar evento de segurança baseado na severidade
    PERFORM public.log_whatsapp_security_event(
      p_user_id,
      CASE 
        WHEN security_check.severity = 'HIGH' THEN 'MULTIPLE_FAILED_LOGINS'
        WHEN security_check.severity = 'MEDIUM' THEN 'SUSPICIOUS_LOGIN_ACTIVITY'
        ELSE 'FAILED_LOGIN'
      END,
      NULL,
      security_check.severity,
      p_ip_address,
      p_user_agent,
      NULL,
      jsonb_build_object(
        'attempts_count', security_check.attempts_count,
        'is_blocked', security_check.is_blocked,
        'failure_reason', p_failure_reason
      )
    );
  END IF;
  
  RETURN attempt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. Função para verificar alertas de segurança
CREATE OR REPLACE FUNCTION public.get_whatsapp_security_alerts(
  p_user_id UUID,
  p_severity TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
) RETURNS TABLE(
  id UUID,
  event_type TEXT,
  severity TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  details JSONB,
  acknowledged BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sl.id,
    sl.event_type,
    sl.severity,
    sl.created_at,
    sl.details,
    sl.acknowledged
  FROM public.whatsapp_security_logs sl
  WHERE sl.user_id = p_user_id
    AND (p_severity IS NULL OR sl.severity = p_severity)
    AND sl.severity IN ('MEDIUM', 'HIGH', 'CRITICAL')
  ORDER BY sl.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;