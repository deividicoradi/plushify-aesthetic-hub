-- 1. Criar tabela whatsapp_messages para persistir histórico de mensagens
CREATE TABLE public.whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('sent', 'received')),
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'failed', 'read')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  contact_phone TEXT,
  contact_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policy - usuários só acessam suas próprias mensagens
CREATE POLICY "Users can manage their own WhatsApp messages" 
ON public.whatsapp_messages
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. Criar tabela whatsapp_session_stats para estatísticas
CREATE TABLE public.whatsapp_session_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  total_contacts INTEGER NOT NULL DEFAULT 0,
  messages_sent INTEGER NOT NULL DEFAULT 0,
  messages_received INTEGER NOT NULL DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.whatsapp_session_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policy para stats
CREATE POLICY "Users can manage their own WhatsApp stats" 
ON public.whatsapp_session_stats
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. Função para atualizar estatísticas automaticamente
CREATE OR REPLACE FUNCTION public.update_whatsapp_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir ou atualizar estatísticas
  INSERT INTO public.whatsapp_session_stats (
    user_id,
    total_contacts,
    messages_sent,
    messages_received,
    last_activity
  )
  VALUES (
    NEW.user_id,
    CASE WHEN NEW.direction = 'sent' THEN 1 ELSE 0 END,
    CASE WHEN NEW.direction = 'sent' THEN 1 ELSE 0 END,
    CASE WHEN NEW.direction = 'received' THEN 1 ELSE 0 END,
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    messages_sent = whatsapp_session_stats.messages_sent + 
      CASE WHEN NEW.direction = 'sent' THEN 1 ELSE 0 END,
    messages_received = whatsapp_session_stats.messages_received + 
      CASE WHEN NEW.direction = 'received' THEN 1 ELSE 0 END,
    last_activity = now(),
    updated_at = now();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para atualizar stats automaticamente
CREATE TRIGGER update_whatsapp_stats_trigger
  AFTER INSERT ON public.whatsapp_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_whatsapp_stats();

-- 4. Função para obter estatísticas do usuário
CREATE OR REPLACE FUNCTION public.get_whatsapp_stats(p_user_id UUID)
RETURNS TABLE(
  total_contacts INTEGER,
  messages_sent INTEGER,
  messages_received INTEGER,
  last_activity TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  -- Verificar se é o próprio usuário
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;
  
  RETURN QUERY
  SELECT 
    COALESCE(s.total_contacts, 0)::INTEGER,
    COALESCE(s.messages_sent, 0)::INTEGER,
    COALESCE(s.messages_received, 0)::INTEGER,
    s.last_activity
  FROM public.whatsapp_session_stats s
  WHERE s.user_id = p_user_id;
  
  -- Se não encontrou stats, retornar zeros
  IF NOT FOUND THEN
    RETURN QUERY SELECT 0::INTEGER, 0::INTEGER, 0::INTEGER, NULL::TIMESTAMP WITH TIME ZONE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. Função para limpar sessões expiradas (atualizar a existente)
CREATE OR REPLACE FUNCTION public.cleanup_expired_whatsapp_sessions()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER := 0;
  session_record RECORD;
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
  
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. Índices para performance
CREATE INDEX idx_whatsapp_messages_user_timestamp ON public.whatsapp_messages(user_id, timestamp DESC);
CREATE INDEX idx_whatsapp_messages_status ON public.whatsapp_messages(status);
CREATE INDEX idx_whatsapp_messages_direction ON public.whatsapp_messages(direction);
CREATE INDEX idx_whatsapp_session_stats_user ON public.whatsapp_session_stats(user_id);

-- 7. Trigger para updated_at automático
CREATE TRIGGER update_whatsapp_messages_updated_at
  BEFORE UPDATE ON public.whatsapp_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_whatsapp_stats_updated_at
  BEFORE UPDATE ON public.whatsapp_session_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();