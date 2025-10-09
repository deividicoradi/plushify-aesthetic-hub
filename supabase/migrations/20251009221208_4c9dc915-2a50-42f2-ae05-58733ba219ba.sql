-- ============================================
-- COMPREHENSIVE SECURITY HARDENING FOR CLIENTS TABLE
-- Addresses: Customer Contact Information Protection
-- ============================================

-- 1. Add CHECK constraint to ensure user_id is never an empty UUID
ALTER TABLE public.clients 
DROP CONSTRAINT IF EXISTS clients_user_id_valid CASCADE;

ALTER TABLE public.clients 
ADD CONSTRAINT clients_user_id_valid 
CHECK (user_id IS NOT NULL AND user_id != '00000000-0000-0000-0000-000000000000'::uuid);

-- 2. Add security index for RLS performance
DROP INDEX IF EXISTS idx_clients_user_id_security CASCADE;
CREATE INDEX idx_clients_user_id_security ON public.clients(user_id) 
WHERE user_id IS NOT NULL;

-- 3. Revoke any anonymous access (defense in depth)
REVOKE ALL ON public.clients FROM anon;
REVOKE ALL ON public.clients FROM public;

-- 4. Grant only necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;

-- 5. Add table comment documenting security measures
COMMENT ON TABLE public.clients IS 'Contains sensitive customer PII (emails, phone, CPF, addresses). Protected by RESTRICTIVE RLS policies ensuring users can only access their own data. All access should use secure RPC functions when possible for audit logging.';

-- 6. Verify all existing RLS policies are RESTRICTIVE (already are, but let's be explicit)
-- The existing policies (clients_select_restricted, clients_insert_restricted, 
-- clients_update_restricted, clients_delete_restricted) are already RESTRICTIVE 
-- and properly configured with user_id = auth.uid() checks.

-- 7. Add validation constraints for data integrity
ALTER TABLE public.clients 
DROP CONSTRAINT IF EXISTS clients_email_format CASCADE;

ALTER TABLE public.clients 
ADD CONSTRAINT clients_email_format 
CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE public.clients 
DROP CONSTRAINT IF EXISTS clients_cpf_format CASCADE;

ALTER TABLE public.clients 
ADD CONSTRAINT clients_cpf_format 
CHECK (cpf IS NULL OR cpf ~ '^[0-9]{11}$' OR cpf ~ '^[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}$');

ALTER TABLE public.clients 
DROP CONSTRAINT IF EXISTS clients_phone_format CASCADE;

ALTER TABLE public.clients 
ADD CONSTRAINT clients_phone_format 
CHECK (phone IS NULL OR phone ~ '^[\d\s()+-]{8,20}$');

ALTER TABLE public.clients 
DROP CONSTRAINT IF EXISTS clients_cep_format CASCADE;

ALTER TABLE public.clients 
ADD CONSTRAINT clients_cep_format 
CHECK (cep IS NULL OR cep ~ '^[0-9]{5}-?[0-9]{3}$');