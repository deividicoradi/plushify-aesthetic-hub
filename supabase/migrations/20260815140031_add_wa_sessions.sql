-- Multi-tenant WhatsApp connections via self-hosted OpenWA gateway.
-- One session per tenant; the OpenWA session name is derived from tenant_id
-- (session_name) so the edge function never has to store or trust a client-supplied name.
CREATE TABLE public.wa_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_name TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('disconnected', 'connecting', 'connected', 'failed')),
  phone_number TEXT,
  connected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (tenant_id)
);

ALTER TABLE public.wa_sessions ENABLE ROW LEVEL SECURITY;

-- Tenants may read their own session row; all writes go through the
-- whatsapp-proxy edge function (service role), which is the only thing
-- that talks to the OpenWA API and knows the shared master API key.
CREATE POLICY "Users can view their own WhatsApp session"
  ON public.wa_sessions FOR SELECT USING (auth.uid() = tenant_id);

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
