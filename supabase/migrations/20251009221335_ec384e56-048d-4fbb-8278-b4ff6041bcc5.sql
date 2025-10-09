-- Fix: Re-grant permissions to authenticated users for clients table
-- The REVOKE was too aggressive. We want:
-- 1. RPC functions for SELECT (with audit logging)
-- 2. Direct table access for INSERT/UPDATE/DELETE (still protected by RLS)

-- Grant back permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;

-- Note: RLS policies are still active and RESTRICTIVE
-- This allows the application to function while maintaining security through RLS