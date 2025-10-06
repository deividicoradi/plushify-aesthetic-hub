-- ========================================
-- SECURITY FIX: Add SECURITY INVOKER to clients_basic view
-- ========================================
-- Issue: The clients_basic view doesn't have security_invoker option set,
-- which means it defaults to SECURITY DEFINER behavior.
-- This bypasses RLS policies and creates a security vulnerability.
--
-- Fix: Recreate the view with explicit SECURITY INVOKER option
-- ========================================

-- Drop the existing view
DROP VIEW IF EXISTS public.clients_basic;

-- Recreate with SECURITY INVOKER option (enforces current user's RLS)
CREATE VIEW public.clients_basic
WITH (security_invoker = true) AS
SELECT 
  id,
  user_id,
  name,
  status,
  created_at
FROM public.clients
WHERE user_id = auth.uid();

-- Add comment explaining security model
COMMENT ON VIEW public.clients_basic IS 
'View with SECURITY INVOKER: enforces RLS policies of the querying user, not the view creator. Safe for multi-tenant access.';