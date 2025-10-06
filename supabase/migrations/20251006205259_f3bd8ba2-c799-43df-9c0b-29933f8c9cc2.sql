-- ========================================
-- CRITICAL SECURITY FIX - Clients Table Enhanced Protection
-- ========================================

-- 1. Convert existing permissive policies to restrictive for maximum security
-- This ensures multiple policies must ALL pass (AND logic instead of OR)

-- Drop existing policies
DROP POLICY IF EXISTS "clients_select_optimized" ON public.clients;
DROP POLICY IF EXISTS "clients_insert_optimized" ON public.clients;
DROP POLICY IF EXISTS "clients_update_optimized" ON public.clients;
DROP POLICY IF EXISTS "clients_delete_optimized" ON public.clients;

-- Create RESTRICTIVE policies for ironclad security
-- Users can ONLY access their own client data
CREATE POLICY "clients_select_restricted"
ON public.clients
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
);

CREATE POLICY "clients_insert_restricted"
ON public.clients
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
);

CREATE POLICY "clients_update_restricted"
ON public.clients
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
)
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
);

CREATE POLICY "clients_delete_restricted"
ON public.clients
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
);

-- 2. Add constraint to ensure user_id is never null (defense in depth)
ALTER TABLE public.clients 
  ALTER COLUMN user_id SET NOT NULL;

-- 3. Add check constraint to prevent empty/invalid user_id
ALTER TABLE public.clients
  DROP CONSTRAINT IF EXISTS clients_user_id_valid;
  
ALTER TABLE public.clients
  ADD CONSTRAINT clients_user_id_valid 
  CHECK (user_id IS NOT NULL AND user_id::text != '00000000-0000-0000-0000-000000000000');

-- 4. Create index for performance on RLS queries
CREATE INDEX IF NOT EXISTS idx_clients_user_id_security 
ON public.clients(user_id) 
WHERE user_id IS NOT NULL;

-- 5. Enhanced audit trigger for sensitive PII access
CREATE OR REPLACE FUNCTION public.audit_clients_pii_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Log all SELECT operations on sensitive PII fields
  IF TG_OP = 'SELECT' THEN
    PERFORM public.log_whatsapp_security_event(
      auth.uid(),
      'PII_ACCESS_CLIENTS',
      NULL,
      'MEDIUM',
      inet_client_addr(),
      NULL,
      NULL,
      jsonb_build_object(
        'client_id', NEW.id,
        'accessed_fields', ARRAY['email', 'phone', 'cpf', 'address'],
        'timestamp', now()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Note: We can't actually create a SELECT trigger, but the RPC function already logs access

-- 6. Create secure view for minimal client data (name + status only)
CREATE OR REPLACE VIEW public.clients_basic AS
SELECT 
  id,
  user_id,
  name,
  status,
  created_at
FROM public.clients
WHERE user_id = auth.uid();

-- Grant access to the view
GRANT SELECT ON public.clients_basic TO authenticated;

-- 7. Add comment documenting security measures
COMMENT ON TABLE public.clients IS 'Contains sensitive PII. Access restricted by RESTRICTIVE RLS policies. All access logged via get_clients_masked() RPC. Never query directly - use RPC functions.';

-- 8. Verify no anonymous access
REVOKE ALL ON public.clients FROM anon;
REVOKE ALL ON public.clients FROM public;

-- Only authenticated users with proper RLS
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;