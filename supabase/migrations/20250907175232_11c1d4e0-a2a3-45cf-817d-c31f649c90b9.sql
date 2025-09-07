-- Corrigir problemas de segurança identificados pelo linter

-- 1. Corrigir search_path nas funções para segurança
CREATE OR REPLACE FUNCTION public.encrypt_token(token text)
RETURNS text 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF token IS NULL OR token = '' THEN
    RETURN NULL;
  END IF;
  RETURN encode(pgp_sym_encrypt(token, current_setting('app.jwt_secret', true)), 'base64');
END;
$$;

CREATE OR REPLACE FUNCTION public.decrypt_token(encrypted_token text)
RETURNS text 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF encrypted_token IS NULL OR encrypted_token = '' THEN
    RETURN NULL;
  END IF;
  RETURN pgp_sym_decrypt(decode(encrypted_token, 'base64'), current_setting('app.jwt_secret', true));
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_whatsapp_sessions()
RETURNS integer 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expired_count integer := 0;
  session_record record;
BEGIN
  -- Buscar e log sessões expiradas
  FOR session_record IN 
    SELECT user_id, session_id 
    FROM public.whatsapp_sessions 
    WHERE expires_at < now() AND status != 'expirado'
  LOOP
    -- Log da expiração
    INSERT INTO public.whatsapp_session_logs (user_id, session_id, event, metadata)
    VALUES (session_record.user_id, session_record.session_id, 'SESSION_EXPIRED', 
            jsonb_build_object('expired_at', now()));
            
    expired_count := expired_count + 1;
  END LOOP;
  
  -- Marcar sessões como expiradas
  UPDATE public.whatsapp_sessions 
  SET status = 'expirado', 
      updated_at = now()
  WHERE expires_at < now() AND status != 'expirado';
  
  -- Log da limpeza
  IF expired_count > 0 THEN
    INSERT INTO public.whatsapp_session_logs (
      user_id, session_id, event, metadata
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid,
      'system',
      'SESSION_EXPIRED',
      jsonb_build_object('expired_sessions_count', expired_count, 'cleanup_time', now())
    );
  END IF;
  
  RETURN expired_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_single_whatsapp_session()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Se é uma nova sessão ou mudança de status para conectado/pareando
  IF (TG_OP = 'INSERT') OR 
     (TG_OP = 'UPDATE' AND NEW.status IN ('conectado', 'pareando') AND OLD.status != NEW.status) THEN
    
    -- Desativar outras sessões do mesmo usuário
    UPDATE public.whatsapp_sessions 
    SET status = 'desconectado',
        updated_at = now()
    WHERE user_id = NEW.user_id 
      AND id != NEW.id 
      AND status IN ('conectado', 'pareando');
      
    -- Log da criação/ativação da sessão
    INSERT INTO public.whatsapp_session_logs (user_id, session_id, event, ip_address, user_agent, metadata)
    VALUES (
      NEW.user_id, 
      NEW.session_id, 
      CASE 
        WHEN TG_OP = 'INSERT' THEN 'SESSION_CREATED'
        WHEN NEW.status = 'conectado' THEN 'SESSION_CONNECTED'
        ELSE 'SESSION_CONNECTED'
      END,
      NEW.ip_address,
      NEW.user_agent,
      jsonb_build_object('session_id', NEW.session_id, 'status', NEW.status)
    );
  END IF;
  
  -- Log de desconexão
  IF TG_OP = 'UPDATE' AND NEW.status = 'desconectado' AND OLD.status != 'desconectado' THEN
    INSERT INTO public.whatsapp_session_logs (user_id, session_id, event, metadata)
    VALUES (NEW.user_id, NEW.session_id, 'SESSION_DISCONNECTED',
            jsonb_build_object('previous_status', OLD.status));
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_whatsapp_login_attempt(
  p_user_id uuid,
  p_session_id text,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_success boolean DEFAULT true,
  p_error_message text DEFAULT NULL
)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.whatsapp_session_logs (
    user_id, session_id, event, ip_address, user_agent, metadata
  ) VALUES (
    p_user_id,
    p_session_id,
    'LOGIN_ATTEMPT',
    p_ip_address,
    p_user_agent,
    jsonb_build_object(
      'success', p_success,
      'error_message', p_error_message,
      'timestamp', now()
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.log_whatsapp_rate_limit(
  p_user_id uuid,
  p_endpoint text,
  p_ip_address inet DEFAULT NULL,
  p_request_count integer DEFAULT NULL
)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.whatsapp_session_logs (
    user_id, session_id, event, ip_address, metadata
  ) VALUES (
    p_user_id,
    'rate_limit',
    'RATE_LIMITED',
    p_ip_address,
    jsonb_build_object(
      'endpoint', p_endpoint,
      'request_count', p_request_count,
      'timestamp', now()
    )
  );
END;
$$;

-- 2. Remover a view SECURITY DEFINER que causou o erro
DROP VIEW IF EXISTS public.active_whatsapp_sessions;

-- Recriar como view simples (sem SECURITY DEFINER)
CREATE VIEW public.active_whatsapp_sessions AS
SELECT 
  id,
  user_id,
  session_id,
  status,
  qr_code,
  -- Não expor tokens criptografados na view por segurança
  server_url,
  last_activity,
  created_at,
  updated_at,
  expires_at,
  ip_address,
  user_agent
FROM public.whatsapp_sessions 
WHERE expires_at > now() AND status != 'expirado';

-- 3. Aplicar RLS na view
ALTER VIEW public.active_whatsapp_sessions SET (security_barrier = true);

-- 4. Função segura para descriptografar token quando necessário
CREATE OR REPLACE FUNCTION public.get_decrypted_access_token(session_id text)
RETURNS text 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  encrypted_token text;
  session_user_id uuid;
BEGIN
  -- Verificar se o usuário pode acessar esta sessão
  SELECT ws.access_token, ws.user_id 
  INTO encrypted_token, session_user_id
  FROM public.whatsapp_sessions ws
  WHERE ws.session_id = get_decrypted_access_token.session_id
    AND ws.user_id = auth.uid()
    AND ws.expires_at > now();
  
  -- Se não encontrou ou não tem permissão, retornar null
  IF encrypted_token IS NULL OR session_user_id != auth.uid() THEN
    RETURN NULL;
  END IF;
  
  -- Retornar token descriptografado
  RETURN public.decrypt_token(encrypted_token);
END;
$$;

-- 5. Função segura para descriptografar refresh token
CREATE OR REPLACE FUNCTION public.get_decrypted_refresh_token(session_id text)
RETURNS text 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  encrypted_token text;
  session_user_id uuid;
BEGIN
  -- Verificar se o usuário pode acessar esta sessão
  SELECT ws.refresh_token, ws.user_id 
  INTO encrypted_token, session_user_id
  FROM public.whatsapp_sessions ws
  WHERE ws.session_id = get_decrypted_refresh_token.session_id
    AND ws.user_id = auth.uid()
    AND ws.expires_at > now();
  
  -- Se não encontrou ou não tem permissão, retornar null
  IF encrypted_token IS NULL OR session_user_id != auth.uid() THEN
    RETURN NULL;
  END IF;
  
  -- Retornar token descriptografado
  RETURN public.decrypt_token(encrypted_token);
END;
$$;