-- =====================================================
-- MIGRAÇÃO DE DADOS: LEGACY PARA NOVAS TABELAS wa_*  
-- =====================================================

-- Função auxiliar para normalizar telefone (E.164: apenas dígitos)
CREATE OR REPLACE FUNCTION public.normalize_phone(phone TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  IF phone IS NULL THEN
    RETURN NULL;
  END IF;
  -- Remove tudo que não é dígito
  RETURN regexp_replace(phone, '[^0-9]', '', 'g');
END;
$$;

-- =====================================================
-- ETAPA 1: Migrar CONTATOS de whatsapp_contatos_legacy para wa_contacts
-- =====================================================

INSERT INTO public.wa_contacts (tenant_id, wa_id, name, client_id, last_interaction, created_at, updated_at)
SELECT 
  user_id AS tenant_id,
  public.normalize_phone(telefone) AS wa_id,
  nome AS name,
  cliente_id AS client_id,
  ultima_interacao AS last_interaction,
  COALESCE(criado_em, now()) AS created_at,
  COALESCE(atualizado_em, now()) AS updated_at
FROM public.whatsapp_contatos_legacy
WHERE public.normalize_phone(telefone) IS NOT NULL
  AND public.normalize_phone(telefone) != ''
ON CONFLICT (tenant_id, wa_id) DO UPDATE SET
  name = EXCLUDED.name,
  client_id = EXCLUDED.client_id,
  last_interaction = COALESCE(EXCLUDED.last_interaction, wa_contacts.last_interaction),
  updated_at = EXCLUDED.updated_at;

-- =====================================================
-- ETAPA 2: Criar THREADS para cada contato
-- =====================================================

INSERT INTO public.wa_threads (tenant_id, contact_id, created_at, updated_at)
SELECT 
  c.tenant_id,
  c.id AS contact_id,
  c.created_at,
  c.updated_at
FROM public.wa_contacts c
ON CONFLICT (tenant_id, contact_id) DO NOTHING;

-- =====================================================
-- ETAPA 3: Migrar MENSAGENS das tabelas legadas
-- =====================================================

-- 3.1) De whatsapp_mensagens_legacy (usa contato_id)
INSERT INTO public.wa_messages (
  tenant_id, 
  thread_id, 
  direction, 
  type, 
  text_body, 
  status, 
  timestamp, 
  created_at, 
  updated_at
)
SELECT 
  m.user_id AS tenant_id,
  t.id AS thread_id,
  CASE 
    WHEN LOWER(m.direcao) IN ('recebida', 'received', 'in') THEN 'in'
    ELSE 'out'
  END AS direction,
  COALESCE(m.tipo, 'text') AS type,
  m.conteudo AS text_body,
  CASE 
    WHEN LOWER(COALESCE(m.status, '')) = 'pending' THEN 'queued'
    WHEN LOWER(COALESCE(m.status, '')) IN ('sent', 'enviada') THEN 'sent'
    WHEN LOWER(COALESCE(m.status, '')) IN ('delivered', 'entregue') THEN 'delivered'
    WHEN LOWER(COALESCE(m.status, '')) IN ('read', 'lida') THEN 'read'
    WHEN LOWER(COALESCE(m.status, '')) IN ('failed', 'falha') THEN 'failed'
    ELSE 'sent'
  END AS status,
  COALESCE(m.horario, m.criado_em, now()) AS timestamp,
  COALESCE(m.criado_em, now()) AS created_at,
  COALESCE(m.criado_em, now()) AS updated_at
FROM public.whatsapp_mensagens_legacy m
INNER JOIN public.whatsapp_contatos_legacy cl ON cl.id = m.contato_id
INNER JOIN public.wa_contacts c ON (
  c.tenant_id = m.user_id 
  AND c.wa_id = public.normalize_phone(cl.telefone)
)
INNER JOIN public.wa_threads t ON (
  t.tenant_id = m.user_id 
  AND t.contact_id = c.id
)
WHERE m.conteudo IS NOT NULL;

-- 3.2) De whatsapp_mensagens_temp_legacy (também usa contato_id)
INSERT INTO public.wa_messages (
  tenant_id, 
  thread_id, 
  direction, 
  type, 
  text_body, 
  status, 
  timestamp, 
  created_at, 
  updated_at
)
SELECT 
  m.user_id AS tenant_id,
  t.id AS thread_id,
  CASE 
    WHEN LOWER(m.direcao) IN ('recebida', 'received', 'in') THEN 'in'
    ELSE 'out'
  END AS direction,
  COALESCE(m.tipo, 'text') AS type,
  m.conteudo AS text_body,
  CASE 
    WHEN LOWER(COALESCE(m.status, '')) = 'pending' THEN 'queued'
    WHEN LOWER(COALESCE(m.status, '')) IN ('sent', 'enviada') THEN 'sent'
    WHEN LOWER(COALESCE(m.status, '')) IN ('delivered', 'entregue') THEN 'delivered'
    WHEN LOWER(COALESCE(m.status, '')) IN ('read', 'lida') THEN 'read'
    WHEN LOWER(COALESCE(m.status, '')) IN ('failed', 'falha') THEN 'failed'
    ELSE 'sent'
  END AS status,
  COALESCE(m.horario, m.created_at, now()) AS timestamp,
  COALESCE(m.created_at, now()) AS created_at,
  COALESCE(m.created_at, now()) AS updated_at
FROM public.whatsapp_mensagens_temp_legacy m
INNER JOIN public.whatsapp_contatos_legacy cl ON cl.id = m.contato_id
INNER JOIN public.wa_contacts c ON (
  c.tenant_id = m.user_id 
  AND c.wa_id = public.normalize_phone(cl.telefone)
)
INNER JOIN public.wa_threads t ON (
  t.tenant_id = m.user_id 
  AND t.contact_id = c.id
)
WHERE m.conteudo IS NOT NULL;

-- 3.3) De whatsapp_messages_legacy (usa contact_phone)
INSERT INTO public.wa_messages (
  tenant_id, 
  thread_id, 
  direction, 
  type, 
  text_body, 
  status, 
  timestamp, 
  created_at, 
  updated_at
)
SELECT 
  m.user_id AS tenant_id,
  t.id AS thread_id,
  CASE 
    WHEN LOWER(m.direction) IN ('recebida', 'received', 'in') THEN 'in'
    ELSE 'out'
  END AS direction,
  'text' AS type,
  m.content AS text_body,
  CASE 
    WHEN LOWER(COALESCE(m.status, '')) = 'pending' THEN 'queued'
    WHEN LOWER(COALESCE(m.status, '')) IN ('sent', 'enviada') THEN 'sent'
    WHEN LOWER(COALESCE(m.status, '')) IN ('delivered', 'entregue') THEN 'delivered'
    WHEN LOWER(COALESCE(m.status, '')) IN ('read', 'lida') THEN 'read'
    WHEN LOWER(COALESCE(m.status, '')) IN ('failed', 'falha') THEN 'failed'
    ELSE 'sent'
  END AS status,
  COALESCE(m.timestamp, m.created_at, now()) AS timestamp,
  COALESCE(m.created_at, now()) AS created_at,
  COALESCE(m.updated_at, now()) AS updated_at
FROM public.whatsapp_messages_legacy m
INNER JOIN public.wa_contacts c ON (
  c.tenant_id = m.user_id 
  AND c.wa_id = public.normalize_phone(m.contact_phone)
)
INNER JOIN public.wa_threads t ON (
  t.tenant_id = m.user_id 
  AND t.contact_id = c.id
)
WHERE m.content IS NOT NULL
  AND m.contact_phone IS NOT NULL;

-- =====================================================
-- ETAPA 4: Atualizar last_message_at nas threads
-- =====================================================

UPDATE public.wa_threads t
SET last_message_at = (
  SELECT MAX(m.timestamp)
  FROM public.wa_messages m
  WHERE m.thread_id = t.id
)
WHERE EXISTS (
  SELECT 1 FROM public.wa_messages m WHERE m.thread_id = t.id
);