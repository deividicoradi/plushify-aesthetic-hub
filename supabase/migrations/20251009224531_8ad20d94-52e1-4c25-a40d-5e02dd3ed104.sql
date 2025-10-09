-- Adicionar políticas RLS para whatsapp_logs
-- Permite que usuários autenticados vejam seus próprios logs
CREATE POLICY "whatsapp_logs_select_own"
ON public.whatsapp_logs
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Permite que o sistema insira logs
CREATE POLICY "whatsapp_logs_insert_system"
ON public.whatsapp_logs
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Corrigir políticas muito restritivas em outras tabelas
-- Garantir que clients permite todas as operações para o dono
DROP POLICY IF EXISTS "clients_select_optimized" ON public.clients;
DROP POLICY IF EXISTS "clients_insert_optimized" ON public.clients;
DROP POLICY IF EXISTS "clients_update_optimized" ON public.clients;
DROP POLICY IF EXISTS "clients_delete_optimized" ON public.clients;

CREATE POLICY "clients_full_access"
ON public.clients
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Garantir que products permite todas as operações
DROP POLICY IF EXISTS "products_select_optimized" ON public.products;
DROP POLICY IF EXISTS "products_insert_optimized" ON public.products;
DROP POLICY IF EXISTS "products_update_optimized" ON public.products;
DROP POLICY IF EXISTS "products_delete_optimized" ON public.products;

CREATE POLICY "products_full_access"
ON public.products
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Garantir que notifications permite todas as operações
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_delete_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_system" ON public.notifications;

CREATE POLICY "notifications_full_access"
ON public.notifications
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Garantir team_members acesso completo
DROP POLICY IF EXISTS "team_members_select_own" ON public.team_members;
DROP POLICY IF EXISTS "team_members_insert_with_limit" ON public.team_members;
DROP POLICY IF EXISTS "team_members_update_own" ON public.team_members;
DROP POLICY IF EXISTS "team_members_delete_own" ON public.team_members;

CREATE POLICY "team_members_full_access"
ON public.team_members
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Garantir cash_closures acesso completo
DROP POLICY IF EXISTS "cash_closures_select_optimized" ON public.cash_closures;
DROP POLICY IF EXISTS "cash_closures_insert_optimized" ON public.cash_closures;
DROP POLICY IF EXISTS "cash_closures_update_optimized" ON public.cash_closures;
DROP POLICY IF EXISTS "cash_closures_delete_optimized" ON public.cash_closures;

CREATE POLICY "cash_closures_full_access"
ON public.cash_closures
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Garantir whatsapp_login_attempts acesso completo
DROP POLICY IF EXISTS "whatsapp_login_attempts_insert_optimized" ON public.whatsapp_login_attempts;
DROP POLICY IF EXISTS "whatsapp_login_attempts_select_optimized" ON public.whatsapp_login_attempts;
DROP POLICY IF EXISTS "whatsapp_login_attempts_update_optimized" ON public.whatsapp_login_attempts;

CREATE POLICY "whatsapp_login_attempts_full_access"
ON public.whatsapp_login_attempts
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Garantir whatsapp_sessions acesso completo
DROP POLICY IF EXISTS "whatsapp_sessions_optimized" ON public.whatsapp_sessions;

CREATE POLICY "whatsapp_sessions_full_access"
ON public.whatsapp_sessions
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Garantir whatsapp_message_queue acesso completo
DROP POLICY IF EXISTS "whatsapp_message_queue_optimized" ON public.whatsapp_message_queue;

CREATE POLICY "whatsapp_message_queue_full_access"
ON public.whatsapp_message_queue
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Garantir whatsapp_performance_metrics acesso completo
DROP POLICY IF EXISTS "whatsapp_performance_metrics_insert_optimized" ON public.whatsapp_performance_metrics;
DROP POLICY IF EXISTS "whatsapp_performance_metrics_select_optimized" ON public.whatsapp_performance_metrics;

CREATE POLICY "whatsapp_performance_metrics_full_access"
ON public.whatsapp_performance_metrics
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Garantir whatsapp_rate_limits acesso completo
DROP POLICY IF EXISTS "whatsapp_rate_limits_insert_optimized" ON public.whatsapp_rate_limits;
DROP POLICY IF EXISTS "whatsapp_rate_limits_select_optimized" ON public.whatsapp_rate_limits;
DROP POLICY IF EXISTS "whatsapp_rate_limits_update_optimized" ON public.whatsapp_rate_limits;

CREATE POLICY "whatsapp_rate_limits_full_access"
ON public.whatsapp_rate_limits
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Garantir whatsapp_session_logs acesso completo
DROP POLICY IF EXISTS "whatsapp_session_logs_insert_optimized" ON public.whatsapp_session_logs;
DROP POLICY IF EXISTS "whatsapp_session_logs_select_optimized" ON public.whatsapp_session_logs;

CREATE POLICY "whatsapp_session_logs_full_access"
ON public.whatsapp_session_logs
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());