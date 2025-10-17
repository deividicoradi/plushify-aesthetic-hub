-- =====================================================
-- FASE 2: CRIAR NOVAS TABELAS PARA WHATSAPP CLOUD API
-- =====================================================

-- Tabela de contas WhatsApp Business API
CREATE TABLE IF NOT EXISTS public.wa_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  waba_id TEXT NOT NULL,
  phone_number_id TEXT NOT NULL,
  display_name TEXT,
  token_encrypted TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, phone_number_id)
);

-- Tabela de contatos
CREATE TABLE IF NOT EXISTS public.wa_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wa_id TEXT NOT NULL,
  name TEXT,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  last_interaction TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, wa_id)
);

-- Tabela de threads (conversas)
CREATE TABLE IF NOT EXISTS public.wa_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.wa_contacts(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, contact_id)
);

-- Tabela de mensagens
CREATE TABLE IF NOT EXISTS public.wa_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  thread_id UUID NOT NULL REFERENCES public.wa_threads(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('in', 'out')),
  wa_message_id TEXT,
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'image', 'video', 'audio', 'document', 'location', 'sticker')),
  text_body TEXT,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('queued', 'sent', 'delivered', 'read', 'failed')),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  raw_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, wa_message_id)
);

-- Tabela de eventos recebidos (webhook)
CREATE TABLE IF NOT EXISTS public.wa_incoming_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number_id TEXT NOT NULL,
  payload JSONB NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_wa_accounts_tenant ON public.wa_accounts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_wa_contacts_tenant_wa_id ON public.wa_contacts(tenant_id, wa_id);
CREATE INDEX IF NOT EXISTS idx_wa_contacts_client ON public.wa_contacts(client_id);
CREATE INDEX IF NOT EXISTS idx_wa_threads_tenant_last_message ON public.wa_threads(tenant_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_wa_threads_contact ON public.wa_threads(contact_id);
CREATE INDEX IF NOT EXISTS idx_wa_messages_thread_timestamp ON public.wa_messages(thread_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_wa_messages_tenant ON public.wa_messages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_wa_messages_wa_id ON public.wa_messages(tenant_id, wa_message_id);
CREATE INDEX IF NOT EXISTS idx_wa_incoming_events_phone_received ON public.wa_incoming_events(phone_number_id, received_at DESC);

-- =====================================================
-- HABILITAR ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.wa_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wa_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wa_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wa_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wa_incoming_events ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS - wa_accounts
-- =====================================================

CREATE POLICY "wa_accounts_select" ON public.wa_accounts
  FOR SELECT USING (tenant_id = auth.uid());

CREATE POLICY "wa_accounts_insert" ON public.wa_accounts
  FOR INSERT WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "wa_accounts_update" ON public.wa_accounts
  FOR UPDATE USING (tenant_id = auth.uid());

CREATE POLICY "wa_accounts_delete" ON public.wa_accounts
  FOR DELETE USING (tenant_id = auth.uid());

-- =====================================================
-- POLÍTICAS RLS - wa_contacts
-- =====================================================

CREATE POLICY "wa_contacts_select" ON public.wa_contacts
  FOR SELECT USING (tenant_id = auth.uid());

CREATE POLICY "wa_contacts_insert" ON public.wa_contacts
  FOR INSERT WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "wa_contacts_update" ON public.wa_contacts
  FOR UPDATE USING (tenant_id = auth.uid());

CREATE POLICY "wa_contacts_delete" ON public.wa_contacts
  FOR DELETE USING (tenant_id = auth.uid());

-- =====================================================
-- POLÍTICAS RLS - wa_threads
-- =====================================================

CREATE POLICY "wa_threads_select" ON public.wa_threads
  FOR SELECT USING (tenant_id = auth.uid());

CREATE POLICY "wa_threads_insert" ON public.wa_threads
  FOR INSERT WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "wa_threads_update" ON public.wa_threads
  FOR UPDATE USING (tenant_id = auth.uid());

CREATE POLICY "wa_threads_delete" ON public.wa_threads
  FOR DELETE USING (tenant_id = auth.uid());

-- =====================================================
-- POLÍTICAS RLS - wa_messages
-- =====================================================

CREATE POLICY "wa_messages_select" ON public.wa_messages
  FOR SELECT USING (tenant_id = auth.uid());

CREATE POLICY "wa_messages_insert" ON public.wa_messages
  FOR INSERT WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "wa_messages_update" ON public.wa_messages
  FOR UPDATE USING (tenant_id = auth.uid());

CREATE POLICY "wa_messages_delete" ON public.wa_messages
  FOR DELETE USING (tenant_id = auth.uid());

-- =====================================================
-- POLÍTICAS RLS - wa_incoming_events (apenas sistema)
-- =====================================================

CREATE POLICY "wa_incoming_events_system_only" ON public.wa_incoming_events
  FOR ALL USING (false) WITH CHECK (false);

-- =====================================================
-- TRIGGER PARA UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_wa_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER wa_accounts_updated_at BEFORE UPDATE ON public.wa_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_wa_updated_at();

CREATE TRIGGER wa_contacts_updated_at BEFORE UPDATE ON public.wa_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_wa_updated_at();

CREATE TRIGGER wa_threads_updated_at BEFORE UPDATE ON public.wa_threads
  FOR EACH ROW EXECUTE FUNCTION public.update_wa_updated_at();

CREATE TRIGGER wa_messages_updated_at BEFORE UPDATE ON public.wa_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_wa_updated_at();