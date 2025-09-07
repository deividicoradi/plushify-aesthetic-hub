-- Fix Security Definer View vulnerability

-- First, check if the active_whatsapp_sessions view has any security definer issues
-- Drop and recreate the view without security definer (which is not applicable to views anyway)
-- The real issue might be that this view allows access to data across users

-- Drop the existing view
DROP VIEW IF EXISTS public.active_whatsapp_sessions;

-- Recreate the view with proper RLS-aware access control
-- This view should only show sessions for the authenticated user
CREATE VIEW public.active_whatsapp_sessions 
WITH (security_invoker=true) AS 
SELECT 
  ws.id,
  ws.user_id,
  ws.session_id,
  ws.status,
  ws.qr_code,
  ws.server_url,
  ws.last_activity,
  ws.created_at,
  ws.updated_at,
  ws.expires_at,
  ws.ip_address,
  ws.user_agent
FROM public.whatsapp_sessions ws
WHERE ws.expires_at > now() 
  AND ws.status = ANY (ARRAY['conectado'::text, 'pareando'::text, 'conectando'::text])
  AND ws.user_id = auth.uid(); -- Critical: Only show sessions for authenticated user

-- Enable RLS on the view (though views inherit RLS from base tables)
-- Ensure the base table has proper RLS
ALTER TABLE public.whatsapp_sessions ENABLE ROW LEVEL SECURITY;

-- Create/update RLS policy for whatsapp_sessions to ensure proper access control
DROP POLICY IF EXISTS "Users can only access their own sessions" ON public.whatsapp_sessions;
CREATE POLICY "Users can only access their own sessions"
ON public.whatsapp_sessions
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Deny anonymous access to whatsapp_sessions
DROP POLICY IF EXISTS "Deny anonymous access to sessions" ON public.whatsapp_sessions;
CREATE POLICY "Deny anonymous access to sessions"
ON public.whatsapp_sessions
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Convert problematic SECURITY DEFINER functions to SECURITY INVOKER where appropriate
-- Focus on functions that could expose data across users

-- Fix get_dashboard_summary to be more secure
CREATE OR REPLACE FUNCTION public.get_dashboard_summary(target_user_id uuid)
RETURNS TABLE(total_clients bigint, total_payments numeric, pending_payments bigint, total_expenses numeric, active_services bigint)
LANGUAGE plpgsql
STABLE SECURITY INVOKER  -- Changed from DEFINER to INVOKER
SET search_path = public
AS $$
BEGIN
  -- Only allow users to get their own dashboard summary
  IF target_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: Cannot access other users data';
  END IF;
  
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.clients WHERE user_id = target_user_id AND status = 'Ativo') as total_clients,
    (SELECT COALESCE(SUM(amount), 0) FROM public.payments WHERE user_id = target_user_id AND status = 'pago') as total_payments,
    (SELECT COUNT(*) FROM public.payments WHERE user_id = target_user_id AND status = 'pendente') as pending_payments,
    (SELECT COALESCE(SUM(amount), 0) FROM public.expenses WHERE user_id = target_user_id) as total_expenses,
    (SELECT COUNT(*) FROM public.services WHERE user_id = target_user_id AND active = true) as active_services;
END;
$$;

-- Fix get_plan_limits to be more secure  
CREATE OR REPLACE FUNCTION public.get_plan_limits(user_uuid uuid DEFAULT auth.uid())
RETURNS TABLE(active_users_limit integer, plan_name text)
LANGUAGE plpgsql
STABLE SECURITY INVOKER  -- Changed from DEFINER to INVOKER
SET search_path = public
AS $$
DECLARE
  user_plan plan_type;
BEGIN
  -- Verificar se o usuário está autenticado
  IF auth.uid() IS NULL THEN
    RETURN QUERY SELECT 1, 'trial'::TEXT;
    RETURN;
  END IF;
  
  -- Verificar se o usuário está tentando acessar dados de outro usuário
  IF user_uuid != auth.uid() THEN
    RAISE EXCEPTION 'Acesso negado: usuário não autorizado';
  END IF;
  
  -- Obter o plano do usuário
  user_plan := public.get_user_plan(user_uuid);
  
  -- Retornar limites baseados no plano
  CASE user_plan
    WHEN 'trial' THEN
      RETURN QUERY SELECT 1, 'Trial'::TEXT;
    WHEN 'professional' THEN
      RETURN QUERY SELECT 2, 'Professional'::TEXT;
    WHEN 'premium' THEN
      RETURN QUERY SELECT 5, 'Premium'::TEXT;
    ELSE
      RETURN QUERY SELECT 1, 'Trial'::TEXT;
  END CASE;
END;
$$;

-- Fix get_user_usage_stats to be more secure
CREATE OR REPLACE FUNCTION public.get_user_usage_stats(user_uuid uuid DEFAULT auth.uid())
RETURNS TABLE(current_active_users integer, max_users_allowed integer, can_add_more boolean, plan_name text)
LANGUAGE plpgsql
STABLE SECURITY INVOKER  -- Changed from DEFINER to INVOKER
SET search_path = public
AS $$
DECLARE
  active_count INTEGER;
  user_limit INTEGER;
  plan_info RECORD;
BEGIN
  -- Verificar se o usuário está autenticado
  IF auth.uid() IS NULL THEN
    RETURN QUERY SELECT 0, 1, FALSE, 'trial'::TEXT;
    RETURN;
  END IF;
  
  -- Verificar se o usuário está tentando acessar dados de outro usuário
  IF user_uuid != auth.uid() THEN
    RAISE EXCEPTION 'Acesso negado: usuário não autorizado';
  END IF;
  
  -- Obter informações do plano
  SELECT * INTO plan_info FROM public.get_plan_limits(user_uuid);
  user_limit := plan_info.active_users_limit;
  
  -- Contar usuários ativos atuais
  SELECT COUNT(*)
  INTO active_count
  FROM public.team_members
  WHERE user_id = user_uuid AND status = 'active';
  
  -- Retornar estatísticas
  RETURN QUERY SELECT 
    active_count,
    user_limit,
    active_count < user_limit,
    plan_info.plan_name;
END;
$$;