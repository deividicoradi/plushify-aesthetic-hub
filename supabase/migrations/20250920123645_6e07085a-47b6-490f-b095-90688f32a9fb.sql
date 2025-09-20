-- Fix remaining multiple permissive policies on whatsapp_sessions table

-- Remove ALL existing policies on whatsapp_sessions
DROP POLICY IF EXISTS "Deny anonymous access to sessions" ON public.whatsapp_sessions;
DROP POLICY IF EXISTS "Users can manage their own WhatsApp sessions" ON public.whatsapp_sessions;
DROP POLICY IF EXISTS "whatsapp_sessions_consolidated" ON public.whatsapp_sessions;
DROP POLICY IF EXISTS "whatsapp_sessions_select" ON public.whatsapp_sessions;
DROP POLICY IF EXISTS "whatsapp_sessions_insert" ON public.whatsapp_sessions;
DROP POLICY IF EXISTS "whatsapp_sessions_update" ON public.whatsapp_sessions;
DROP POLICY IF EXISTS "whatsapp_sessions_delete" ON public.whatsapp_sessions;

-- Create single consolidated policy for whatsapp_sessions
CREATE POLICY "whatsapp_sessions_unified" ON public.whatsapp_sessions
FOR ALL 
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

-- Log the fix
DO $$
BEGIN
  RAISE NOTICE '[FIX] whatsapp_sessions multiple permissive policies resolved ✅';
END $$;