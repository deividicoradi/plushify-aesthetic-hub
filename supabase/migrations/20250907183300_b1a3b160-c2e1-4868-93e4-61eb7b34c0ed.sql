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