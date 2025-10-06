
-- Fix whatsapp_sessions RLS policies to prevent 406 errors

-- Drop existing policies
DROP POLICY IF EXISTS "whatsapp_sessions_optimized" ON public.whatsapp_sessions;
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.whatsapp_sessions;
DROP POLICY IF EXISTS "Users can insert their own sessions" ON public.whatsapp_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.whatsapp_sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON public.whatsapp_sessions;

-- Create proper RLS policies that work with Supabase REST API
CREATE POLICY "whatsapp_sessions_select_policy" 
ON public.whatsapp_sessions
FOR SELECT 
TO authenticated
USING (
  auth.uid() IS NOT NULL AND 
  user_id = auth.uid()
);

CREATE POLICY "whatsapp_sessions_insert_policy" 
ON public.whatsapp_sessions
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  user_id = auth.uid()
);

CREATE POLICY "whatsapp_sessions_update_policy" 
ON public.whatsapp_sessions
FOR UPDATE 
TO authenticated
USING (
  auth.uid() IS NOT NULL AND 
  user_id = auth.uid()
)
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  user_id = auth.uid()
);

CREATE POLICY "whatsapp_sessions_delete_policy" 
ON public.whatsapp_sessions
FOR DELETE 
TO authenticated
USING (
  auth.uid() IS NOT NULL AND 
  user_id = auth.uid()
);

-- Add comment documenting the fix
COMMENT ON TABLE public.whatsapp_sessions IS 'WhatsApp sessions table with proper RLS policies to prevent 406 errors. Each user can only access their own sessions.';
