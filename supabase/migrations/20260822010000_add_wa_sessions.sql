-- Reintrodução da conexão de WhatsApp por tenant, agora via Evolution API
-- (self-hosted, mesma VPS do incidente anterior) com salvaguardas de
-- anti-banimento aplicadas na camada de aplicação (aquecimento, ritmo
-- humanizado, grafo de contatos restrito a clientes já cadastrados — ver
-- memória do projeto: project_whatsapp_ban_incident).
CREATE TABLE public.wa_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  instance_name TEXT NOT NULL UNIQUE,
  instance_token TEXT,
  status TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('disconnected', 'connecting', 'connected', 'failed')),
  phone_number TEXT,
  connected_at TIMESTAMP WITH TIME ZONE,
  warmup_started_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (tenant_id)
);

ALTER TABLE public.wa_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own WhatsApp session"
  ON public.wa_sessions
  FOR SELECT
  USING (auth.uid() = tenant_id);

CREATE OR REPLACE FUNCTION public.update_wa_sessions_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER wa_sessions_updated_at
  BEFORE UPDATE ON public.wa_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_wa_sessions_updated_at();
