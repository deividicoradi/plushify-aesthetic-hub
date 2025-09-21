-- Fix all Auth RLS Initialization Plan performance issues
-- Replace auth.uid() with (SELECT auth.uid()) for better performance across all affected tables

-- Fix team_members table
DROP POLICY IF EXISTS "team_members_select_optimized" ON public.team_members;
DROP POLICY IF EXISTS "team_members_insert_optimized" ON public.team_members;
DROP POLICY IF EXISTS "team_members_update_optimized" ON public.team_members;
DROP POLICY IF EXISTS "team_members_delete_optimized" ON public.team_members;

CREATE POLICY "team_members_select_optimized" ON public.team_members
FOR SELECT 
TO authenticated
USING (((SELECT auth.uid()) IS NOT NULL) AND (user_id = (SELECT auth.uid())));

CREATE POLICY "team_members_insert_optimized" ON public.team_members
FOR INSERT 
TO authenticated
WITH CHECK (((SELECT auth.uid()) IS NOT NULL) AND (user_id = (SELECT auth.uid())));

CREATE POLICY "team_members_update_optimized" ON public.team_members
FOR UPDATE 
TO authenticated
USING (((SELECT auth.uid()) IS NOT NULL) AND (user_id = (SELECT auth.uid())))
WITH CHECK (((SELECT auth.uid()) IS NOT NULL) AND (user_id = (SELECT auth.uid())));

CREATE POLICY "team_members_delete_optimized" ON public.team_members
FOR DELETE 
TO authenticated
USING (((SELECT auth.uid()) IS NOT NULL) AND (user_id = (SELECT auth.uid())));

-- Fix whatsapp_mensagens table (if it exists)
DROP POLICY IF EXISTS "whatsapp_mensagens_select_optimized" ON public.whatsapp_mensagens;
DROP POLICY IF EXISTS "whatsapp_mensagens_insert_optimized" ON public.whatsapp_mensagens;
DROP POLICY IF EXISTS "whatsapp_mensagens_update_optimized" ON public.whatsapp_mensagens;
DROP POLICY IF EXISTS "whatsapp_mensagens_delete_optimized" ON public.whatsapp_mensagens;
DROP POLICY IF EXISTS "whatsapp_mensagens_optimized" ON public.whatsapp_mensagens;

CREATE POLICY "whatsapp_mensagens_optimized" ON public.whatsapp_mensagens
FOR ALL 
TO authenticated
USING (((SELECT auth.uid()) IS NOT NULL) AND (user_id = (SELECT auth.uid())))
WITH CHECK (((SELECT auth.uid()) IS NOT NULL) AND (user_id = (SELECT auth.uid())));

-- Fix whatsapp_session_logs table
DROP POLICY IF EXISTS "Users can view their own session logs" ON public.whatsapp_session_logs;
DROP POLICY IF EXISTS "System can insert session logs" ON public.whatsapp_session_logs;

CREATE POLICY "whatsapp_session_logs_select_optimized" ON public.whatsapp_session_logs
FOR SELECT 
TO authenticated
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "whatsapp_session_logs_insert_optimized" ON public.whatsapp_session_logs
FOR INSERT 
TO authenticated
WITH CHECK (true); -- System can insert logs

-- Fix whatsapp_alerts table
DROP POLICY IF EXISTS "Auth users can view alerts" ON public.whatsapp_alerts;
DROP POLICY IF EXISTS "Auth system can insert alerts" ON public.whatsapp_alerts;
DROP POLICY IF EXISTS "Auth system can update alerts" ON public.whatsapp_alerts;

CREATE POLICY "whatsapp_alerts_select_optimized" ON public.whatsapp_alerts
FOR SELECT 
TO authenticated
USING ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "whatsapp_alerts_insert_optimized" ON public.whatsapp_alerts
FOR INSERT 
TO authenticated
WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "whatsapp_alerts_update_optimized" ON public.whatsapp_alerts
FOR UPDATE 
TO authenticated
USING ((SELECT auth.uid()) IS NOT NULL)
WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- Log the comprehensive optimization
DO $$
BEGIN
  RAISE NOTICE '[PERFORMANCE] All RLS policies optimized with SELECT auth.uid() for better performance ✅';
  RAISE NOTICE '[FIXED] team_members, whatsapp_mensagens, whatsapp_session_logs, whatsapp_alerts ✅';
END $$;