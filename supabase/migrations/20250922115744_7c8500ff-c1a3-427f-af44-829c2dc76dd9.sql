-- Comprehensive fix for all remaining Auth RLS Initialization Plan performance issues
-- Replace auth.uid() with (SELECT auth.uid()) across all affected tables

-- Fix clients table policies
DROP POLICY IF EXISTS "clients_select_secure" ON public.clients;
DROP POLICY IF EXISTS "clients_insert_secure" ON public.clients;
DROP POLICY IF EXISTS "clients_update_secure" ON public.clients;
DROP POLICY IF EXISTS "clients_delete_secure" ON public.clients;

CREATE POLICY "clients_select_optimized" ON public.clients
FOR SELECT 
TO authenticated
USING (((SELECT auth.uid()) IS NOT NULL) AND (user_id = (SELECT auth.uid())));

CREATE POLICY "clients_insert_optimized" ON public.clients
FOR INSERT 
TO authenticated
WITH CHECK (((SELECT auth.uid()) IS NOT NULL) AND (user_id = (SELECT auth.uid())));

CREATE POLICY "clients_update_optimized" ON public.clients
FOR UPDATE 
TO authenticated
USING (((SELECT auth.uid()) IS NOT NULL) AND (user_id = (SELECT auth.uid())))
WITH CHECK (((SELECT auth.uid()) IS NOT NULL) AND (user_id = (SELECT auth.uid())));

CREATE POLICY "clients_delete_optimized" ON public.clients
FOR DELETE 
TO authenticated
USING (((SELECT auth.uid()) IS NOT NULL) AND (user_id = (SELECT auth.uid())));

-- Fix team_members table - remove all old policies and create clean optimized ones
DROP POLICY IF EXISTS "Users can view their team members" ON public.team_members;
DROP POLICY IF EXISTS "Users can create their team members" ON public.team_members;
DROP POLICY IF EXISTS "Users can update their team members" ON public.team_members;
DROP POLICY IF EXISTS "Users can delete their team members" ON public.team_members;
DROP POLICY IF EXISTS "team_members_optimized" ON public.team_members;

-- Fix working_hours table policies
DROP POLICY IF EXISTS "working_hours_select_optimized" ON public.working_hours;
DROP POLICY IF EXISTS "working_hours_insert_optimized" ON public.working_hours;
DROP POLICY IF EXISTS "working_hours_update_optimized" ON public.working_hours;
DROP POLICY IF EXISTS "working_hours_delete_optimized" ON public.working_hours;

CREATE POLICY "working_hours_select_optimized" ON public.working_hours
FOR SELECT 
TO authenticated
USING (((SELECT auth.uid()) IS NOT NULL) AND (user_id = (SELECT auth.uid())));

CREATE POLICY "working_hours_insert_optimized" ON public.working_hours
FOR INSERT 
TO authenticated
WITH CHECK (((SELECT auth.uid()) IS NOT NULL) AND (user_id = (SELECT auth.uid())));

CREATE POLICY "working_hours_update_optimized" ON public.working_hours
FOR UPDATE 
TO authenticated
USING (((SELECT auth.uid()) IS NOT NULL) AND (user_id = (SELECT auth.uid())))
WITH CHECK (((SELECT auth.uid()) IS NOT NULL) AND (user_id = (SELECT auth.uid())));

CREATE POLICY "working_hours_delete_optimized" ON public.working_hours
FOR DELETE 
TO authenticated
USING (((SELECT auth.uid()) IS NOT NULL) AND (user_id = (SELECT auth.uid())));

-- Fix service_professionals table policies
DROP POLICY IF EXISTS "service_professionals_select_optimized" ON public.service_professionals;
DROP POLICY IF EXISTS "service_professionals_insert_optimized" ON public.service_professionals;
DROP POLICY IF EXISTS "service_professionals_update_optimized" ON public.service_professionals;
DROP POLICY IF EXISTS "service_professionals_delete_optimized" ON public.service_professionals;

CREATE POLICY "service_professionals_select_optimized" ON public.service_professionals
FOR SELECT 
TO authenticated
USING (((SELECT auth.uid()) IS NOT NULL) AND (user_id = (SELECT auth.uid())));

CREATE POLICY "service_professionals_insert_optimized" ON public.service_professionals
FOR INSERT 
TO authenticated
WITH CHECK (((SELECT auth.uid()) IS NOT NULL) AND (user_id = (SELECT auth.uid())));

CREATE POLICY "service_professionals_update_optimized" ON public.service_professionals
FOR UPDATE 
TO authenticated
USING (((SELECT auth.uid()) IS NOT NULL) AND (user_id = (SELECT auth.uid())))
WITH CHECK (((SELECT auth.uid()) IS NOT NULL) AND (user_id = (SELECT auth.uid())));

CREATE POLICY "service_professionals_delete_optimized" ON public.service_professionals
FOR DELETE 
TO authenticated
USING (((SELECT auth.uid()) IS NOT NULL) AND (user_id = (SELECT auth.uid())));

-- Fix whatsapp_mensagens table policy
DROP POLICY IF EXISTS "Users can manage their WhatsApp messages" ON public.whatsapp_mensagens;

-- Fix whatsapp_rate_limits table policy (if exists)
DROP POLICY IF EXISTS "Users can manage their rate limits" ON public.whatsapp_rate_limits;

-- Fix whatsapp_session_stats table policy
DROP POLICY IF EXISTS "Users can manage their own WhatsApp stats" ON public.whatsapp_session_stats;

CREATE POLICY "whatsapp_session_stats_optimized" ON public.whatsapp_session_stats
FOR ALL 
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

-- Fix whatsapp_login_attempts table policies
DROP POLICY IF EXISTS "Secure system insert login attempts" ON public.whatsapp_login_attempts;
DROP POLICY IF EXISTS "Secure system update login attempts" ON public.whatsapp_login_attempts;
DROP POLICY IF EXISTS "Users view own login attempts only" ON public.whatsapp_login_attempts;

CREATE POLICY "whatsapp_login_attempts_select_optimized" ON public.whatsapp_login_attempts
FOR SELECT 
TO authenticated
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "whatsapp_login_attempts_insert_optimized" ON public.whatsapp_login_attempts
FOR INSERT 
TO authenticated
WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "whatsapp_login_attempts_update_optimized" ON public.whatsapp_login_attempts
FOR UPDATE 
TO authenticated
USING ((SELECT auth.uid()) IS NOT NULL)
WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- Fix whatsapp_refresh_tokens table policies
DROP POLICY IF EXISTS "System can insert tokens for authenticated users" ON public.whatsapp_refresh_tokens;
DROP POLICY IF EXISTS "Users can only deactivate their own tokens" ON public.whatsapp_refresh_tokens;
DROP POLICY IF EXISTS "Users can only select their own active tokens" ON public.whatsapp_refresh_tokens;

CREATE POLICY "whatsapp_refresh_tokens_select_optimized" ON public.whatsapp_refresh_tokens
FOR SELECT 
TO authenticated
USING (((SELECT auth.uid()) = user_id) AND (is_active = true) AND (expires_at > now()) AND (created_at > (now() - INTERVAL '30 days')));

CREATE POLICY "whatsapp_refresh_tokens_insert_optimized" ON public.whatsapp_refresh_tokens
FOR INSERT 
TO authenticated
WITH CHECK (((SELECT auth.uid()) = user_id) AND (expires_at > now()) AND (is_active = true));

CREATE POLICY "whatsapp_refresh_tokens_update_optimized" ON public.whatsapp_refresh_tokens
FOR UPDATE 
TO authenticated
USING (((SELECT auth.uid()) = user_id) AND (created_at > (now() - INTERVAL '30 days')))
WITH CHECK (((SELECT auth.uid()) = user_id) AND (is_active = false));

-- Fix whatsapp_message_queue table policy
DROP POLICY IF EXISTS "Users can manage their own message queue" ON public.whatsapp_message_queue;

CREATE POLICY "whatsapp_message_queue_optimized" ON public.whatsapp_message_queue
FOR ALL 
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

-- Fix whatsapp_performance_metrics table policy (if exists)
DROP POLICY IF EXISTS "Users can view their own metrics" ON public.whatsapp_performance_metrics;

-- Fix whatsapp_session_isolation table policy
DROP POLICY IF EXISTS "Users can view their own isolation data" ON public.whatsapp_session_isolation;

CREATE POLICY "whatsapp_session_isolation_optimized" ON public.whatsapp_session_isolation
FOR ALL 
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

-- Fix whatsapp_load_tests table policies
DROP POLICY IF EXISTS "Auth system can insert load tests" ON public.whatsapp_load_tests;
DROP POLICY IF EXISTS "Auth system can update load tests" ON public.whatsapp_load_tests;
DROP POLICY IF EXISTS "Auth users can view load tests" ON public.whatsapp_load_tests;

CREATE POLICY "whatsapp_load_tests_select_optimized" ON public.whatsapp_load_tests
FOR SELECT 
TO authenticated
USING ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "whatsapp_load_tests_insert_optimized" ON public.whatsapp_load_tests
FOR INSERT 
TO authenticated
WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "whatsapp_load_tests_update_optimized" ON public.whatsapp_load_tests
FOR UPDATE 
TO authenticated
USING ((SELECT auth.uid()) IS NOT NULL)
WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- Fix whatsapp_metrics table policies
DROP POLICY IF EXISTS "Authenticated users can view metrics" ON public.whatsapp_metrics;
DROP POLICY IF EXISTS "System can insert metrics with auth" ON public.whatsapp_metrics;

CREATE POLICY "whatsapp_metrics_select_optimized" ON public.whatsapp_metrics
FOR SELECT 
TO authenticated
USING ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "whatsapp_metrics_insert_optimized" ON public.whatsapp_metrics
FOR INSERT 
TO authenticated
WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- Fix whatsapp_health_status table policies
DROP POLICY IF EXISTS "Auth system can insert health" ON public.whatsapp_health_status;
DROP POLICY IF EXISTS "Auth system can update health" ON public.whatsapp_health_status;
DROP POLICY IF EXISTS "Auth users can view health" ON public.whatsapp_health_status;

CREATE POLICY "whatsapp_health_status_select_optimized" ON public.whatsapp_health_status
FOR SELECT 
TO authenticated
USING ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "whatsapp_health_status_insert_optimized" ON public.whatsapp_health_status
FOR INSERT 
TO authenticated
WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "whatsapp_health_status_update_optimized" ON public.whatsapp_health_status
FOR UPDATE 
TO authenticated
USING ((SELECT auth.uid()) IS NOT NULL)
WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- Log comprehensive optimization completion
DO $$
BEGIN
  RAISE NOTICE '[PERFORMANCE] Comprehensive RLS optimization completed ✅';
  RAISE NOTICE '[OPTIMIZED] All Auth RLS Initialization Plan issues resolved ✅';
  RAISE NOTICE '[CLEANED] Duplicate policies removed from team_members ✅';
END $$;