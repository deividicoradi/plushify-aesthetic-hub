-- Corrigir view com SECURITY DEFINER removendo ela
DROP VIEW IF EXISTS public.active_whatsapp_sessions;

-- Criar view simples sem SECURITY DEFINER  
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
WHERE expires_at > now() 
  AND status IN ('conectado', 'pareando', 'conectando');

-- Função segura para atualizar contatos nas estatísticas  
CREATE OR REPLACE FUNCTION public.update_whatsapp_contact_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar contagem de contatos únicos
  UPDATE public.whatsapp_session_stats 
  SET total_contacts = (
    SELECT COUNT(DISTINCT telefone) 
    FROM public.whatsapp_contatos 
    WHERE user_id = NEW.user_id
  ),
  updated_at = now()
  WHERE user_id = NEW.user_id;
  
  -- Inserir se não existir
  INSERT INTO public.whatsapp_session_stats (user_id, total_contacts)
  VALUES (NEW.user_id, 1)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para atualizar stats de contatos
CREATE TRIGGER update_contact_stats_trigger
  AFTER INSERT OR UPDATE ON public.whatsapp_contatos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_whatsapp_contact_stats();