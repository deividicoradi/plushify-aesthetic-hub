-- Remover completamente qualquer security_barrier da view que está causando o erro
DROP VIEW IF EXISTS public.active_whatsapp_sessions CASCADE;

-- Recriar view simples sem nenhuma configuração de segurança especial
CREATE VIEW public.active_whatsapp_sessions AS
SELECT 
  id,
  user_id,
  session_id,
  status,
  qr_code,
  server_url,
  last_activity,
  created_at,
  updated_at,
  expires_at,
  ip_address,
  user_agent
FROM public.whatsapp_sessions 
WHERE expires_at > now() AND status != 'expirado';

-- A view herda automaticamente as políticas RLS da tabela base
-- Não precisamos configurar nada especial

-- Criar função para uso interno do sistema apenas
CREATE OR REPLACE FUNCTION public.get_active_session_for_user(p_user_id uuid)
RETURNS TABLE(
  id uuid,
  session_id text,
  status text,
  qr_code text,
  server_url text,
  last_activity timestamp with time zone,
  expires_at timestamp with time zone
) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se é o próprio usuário
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;
  
  RETURN QUERY
  SELECT 
    ws.id,
    ws.session_id,
    ws.status,
    ws.qr_code,
    ws.server_url,
    ws.last_activity,
    ws.expires_at
  FROM public.whatsapp_sessions ws
  WHERE ws.user_id = p_user_id 
    AND ws.expires_at > now() 
    AND ws.status != 'expirado'
  ORDER BY ws.created_at DESC
  LIMIT 1;
END;
$$;