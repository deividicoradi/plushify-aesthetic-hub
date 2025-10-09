-- ============================================
-- COMPREHENSIVE SECURITY HARDENING FOR WHATSAPP_CONTATOS TABLE
-- Addresses: WhatsApp Contact Database Protection
-- ============================================

-- 1. Add CHECK constraint to ensure user_id is never an empty UUID
ALTER TABLE public.whatsapp_contatos 
DROP CONSTRAINT IF EXISTS whatsapp_contatos_user_id_valid CASCADE;

ALTER TABLE public.whatsapp_contatos 
ADD CONSTRAINT whatsapp_contatos_user_id_valid 
CHECK (user_id IS NOT NULL AND user_id != '00000000-0000-0000-0000-000000000000'::uuid);

-- 2. Add security index for RLS performance
DROP INDEX IF EXISTS idx_whatsapp_contatos_user_id_security CASCADE;
CREATE INDEX idx_whatsapp_contatos_user_id_security ON public.whatsapp_contatos(user_id) 
WHERE user_id IS NOT NULL;

-- 3. Revoke any anonymous access (defense in depth)
REVOKE ALL ON public.whatsapp_contatos FROM anon;
REVOKE ALL ON public.whatsapp_contatos FROM public;

-- 4. Grant only necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_contatos TO authenticated;

-- 5. Add table comment documenting security measures
COMMENT ON TABLE public.whatsapp_contatos IS 'Contains sensitive WhatsApp contact data (phone numbers, names). Protected by RESTRICTIVE RLS policies ensuring users can only access their own contacts. This prevents contact harvesting by unauthorized users.';

-- 6. Add validation constraints for data integrity
ALTER TABLE public.whatsapp_contatos 
DROP CONSTRAINT IF EXISTS whatsapp_contatos_telefone_not_empty CASCADE;

ALTER TABLE public.whatsapp_contatos 
ADD CONSTRAINT whatsapp_contatos_telefone_not_empty 
CHECK (telefone IS NOT NULL AND length(trim(telefone)) > 0);

ALTER TABLE public.whatsapp_contatos 
DROP CONSTRAINT IF EXISTS whatsapp_contatos_telefone_format CASCADE;

ALTER TABLE public.whatsapp_contatos 
ADD CONSTRAINT whatsapp_contatos_telefone_format 
CHECK (telefone ~ '^[\d\s()+-@]{8,20}$');

ALTER TABLE public.whatsapp_contatos 
DROP CONSTRAINT IF EXISTS whatsapp_contatos_nome_not_empty CASCADE;

ALTER TABLE public.whatsapp_contatos 
ADD CONSTRAINT whatsapp_contatos_nome_not_empty 
CHECK (nome IS NOT NULL AND length(trim(nome)) > 0);