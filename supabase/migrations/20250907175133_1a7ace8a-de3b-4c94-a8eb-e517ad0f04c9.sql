-- Ativar extensão de criptografia
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Adicionar coluna de expiração na tabela de sessões
ALTER TABLE public.whatsapp_sessions 
ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone DEFAULT (now() + interval '24 hours'),
ADD COLUMN IF NOT EXISTS ip_address inet,
ADD COLUMN IF NOT EXISTS user_agent text;

-- Criar funções de criptografia para tokens
CREATE OR REPLACE FUNCTION public.encrypt_token(token text)
RETURNS text AS $$
BEGIN
  IF token IS NULL OR token = '' THEN
    RETURN NULL;
  END IF;
  RETURN encode(pgp_sym_encrypt(token, current_setting('app.jwt_secret', true)), 'base64');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.decrypt_token(encrypted_token text)
RETURNS text AS $$
BEGIN
  IF encrypted_token IS NULL OR encrypted_token = '' THEN
    RETURN NULL;
  END IF;
  RETURN pgp_sym_decrypt(decode(encrypted_token, 'base64'), current_setting('app.jwt_secret', true));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar tabela de logs de auditoria para sessões WhatsApp
CREATE TABLE public.whatsapp_session_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  event text NOT NULL CHECK (event IN ('SESSION_CREATED', 'SESSION_CONNECTED', 'SESSION_DISCONNECTED', 'SESSION_EXPIRED', 'TOKEN_REFRESHED', 'QR_GENERATED', 'LOGIN_ATTEMPT', 'RATE_LIMITED')),
  ip_address inet,
  user_agent text,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS na tabela de logs
ALTER TABLE public.whatsapp_session_logs ENABLE ROW LEVEL SECURITY;

-- Política RLS para logs (usuários só veem seus próprios logs)
CREATE POLICY "Users can view their own session logs" 
ON public.whatsapp_session_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert session logs" 
ON public.whatsapp_session_logs 
FOR INSERT 
WITH CHECK (true); -- Permite inserção do sistema

-- Índices para performance nos logs
CREATE INDEX idx_whatsapp_session_logs_user_id ON public.whatsapp_session_logs(user_id);
CREATE INDEX idx_whatsapp_session_logs_session_id ON public.whatsapp_session_logs(session_id);
CREATE INDEX idx_whatsapp_session_logs_event ON public.whatsapp_session_logs(event);
CREATE INDEX idx_whatsapp_session_logs_created_at ON public.whatsapp_session_logs(created_at);

-- Função para limpar sessões expiradas automaticamente
CREATE OR REPLACE FUNCTION public.cleanup_expired_whatsapp_sessions()
RETURNS integer AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para garantir uma sessão única por usuário
CREATE OR REPLACE FUNCTION public.ensure_single_whatsapp_session()
RETURNS trigger AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para garantir sessão única
CREATE TRIGGER ensure_single_whatsapp_session_trigger
  BEFORE INSERT OR UPDATE ON public.whatsapp_sessions
  FOR EACH ROW EXECUTE FUNCTION public.ensure_single_whatsapp_session();

-- Função para inserir log de tentativa de login
CREATE OR REPLACE FUNCTION public.log_whatsapp_login_attempt(
  p_user_id uuid,
  p_session_id text,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_success boolean DEFAULT true,
  p_error_message text DEFAULT NULL
)
RETURNS void AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para inserir log de rate limiting
CREATE OR REPLACE FUNCTION public.log_whatsapp_rate_limit(
  p_user_id uuid,
  p_endpoint text,
  p_ip_address inet DEFAULT NULL,
  p_request_count integer DEFAULT NULL
)
RETURNS void AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar trigger de updated_at para incluir novas colunas
DROP TRIGGER IF EXISTS update_whatsapp_sessions_updated_at ON public.whatsapp_sessions;
CREATE TRIGGER update_whatsapp_sessions_updated_at
  BEFORE UPDATE ON public.whatsapp_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Índice adicional para expiração
CREATE INDEX idx_whatsapp_sessions_expires_at ON public.whatsapp_sessions(expires_at) WHERE status != 'expirado';

-- View para sessões ativas (não expiradas)
CREATE OR REPLACE VIEW public.active_whatsapp_sessions AS
SELECT * FROM public.whatsapp_sessions 
WHERE expires_at > now() AND status != 'expirado';

-- Política RLS para a view (herda da tabela principal)
ALTER VIEW public.active_whatsapp_sessions OWNER TO postgres;

-- Comentários para documentação
COMMENT ON TABLE public.whatsapp_sessions IS 'Armazena sessões WhatsApp com tokens criptografados e controle de expiração';
COMMENT ON TABLE public.whatsapp_session_logs IS 'Log de auditoria para eventos de sessões WhatsApp';
COMMENT ON FUNCTION public.encrypt_token(text) IS 'Criptografa tokens usando pgcrypto';
COMMENT ON FUNCTION public.decrypt_token(text) IS 'Descriptografa tokens usando pgcrypto';
COMMENT ON FUNCTION public.cleanup_expired_whatsapp_sessions() IS 'Remove sessões expiradas automaticamente';
COMMENT ON FUNCTION public.ensure_single_whatsapp_session() IS 'Garante que cada usuário tenha apenas uma sessão ativa';