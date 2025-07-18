-- Função para obter os limites do plano do usuário
CREATE OR REPLACE FUNCTION public.get_plan_limits(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE(
  active_users_limit INTEGER,
  plan_name TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
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

-- Função para verificar se o usuário pode adicionar mais membros da equipe
CREATE OR REPLACE FUNCTION public.can_add_team_member(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_active_users INTEGER;
  user_limit INTEGER;
  user_plan plan_type;
BEGIN
  -- Verificar se o usuário está autenticado
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar se o usuário está tentando acessar dados de outro usuário
  IF user_uuid != auth.uid() THEN
    RAISE EXCEPTION 'Acesso negado: usuário não autorizado';
  END IF;
  
  -- Obter o plano do usuário
  user_plan := public.get_user_plan(user_uuid);
  
  -- Definir limite baseado no plano
  CASE user_plan
    WHEN 'trial' THEN
      user_limit := 1;
    WHEN 'professional' THEN
      user_limit := 2;
    WHEN 'premium' THEN
      user_limit := 5;
    ELSE
      user_limit := 1;
  END CASE;
  
  -- Contar usuários ativos atuais
  SELECT COUNT(*)
  INTO current_active_users
  FROM public.team_members
  WHERE user_id = user_uuid AND status = 'active';
  
  -- Verificar se pode adicionar mais
  RETURN current_active_users < user_limit;
END;
$$;

-- Função para obter estatísticas de uso de usuários
CREATE OR REPLACE FUNCTION public.get_user_usage_stats(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE(
  current_active_users INTEGER,
  max_users_allowed INTEGER,
  can_add_more BOOLEAN,
  plan_name TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
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

-- Atualizar a função has_feature_access para incluir verificação de limite de usuários
CREATE OR REPLACE FUNCTION public.has_feature_access(feature_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_plan plan_type;
BEGIN
  -- Verificar se o usuário está autenticado
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Obter o plano do usuário
  user_plan := public.get_user_plan();
  
  -- Definir acesso às funcionalidades por plano - MAIS RESTRITIVO
  CASE feature_name
    -- Funcionalidades básicas (Trial)
    WHEN 'dashboard_basic' THEN
      RETURN user_plan IN ('trial', 'professional', 'premium');
    WHEN 'clients_limited' THEN
      RETURN user_plan = 'trial';
    WHEN 'appointments_limited' THEN
      RETURN user_plan = 'trial';
    WHEN 'inventory_basic' THEN
      RETURN user_plan = 'trial';
    
    -- Funcionalidades Professional
    WHEN 'clients_unlimited' THEN
      RETURN user_plan IN ('professional', 'premium');
    WHEN 'appointments_unlimited' THEN
      RETURN user_plan IN ('professional', 'premium');
    WHEN 'financial_management' THEN
      RETURN user_plan IN ('professional', 'premium');
    WHEN 'inventory_intermediate' THEN
      RETURN user_plan IN ('professional', 'premium');
    WHEN 'reports_basic' THEN
      RETURN user_plan IN ('professional', 'premium');
    WHEN 'cash_flow' THEN
      RETURN user_plan IN ('professional', 'premium');
    WHEN 'multiple_payment_methods' THEN
      RETURN user_plan IN ('professional', 'premium');
    WHEN 'support_priority' THEN
      RETURN user_plan IN ('professional', 'premium');
    
    -- Funcionalidades APENAS Premium/Enterprise
    WHEN 'analytics_advanced' THEN
      RETURN user_plan = 'premium';
    WHEN 'reports_detailed' THEN
      RETURN user_plan = 'premium';
    WHEN 'reports_export' THEN
      RETURN user_plan = 'premium';
    WHEN 'inventory_advanced' THEN
      RETURN user_plan = 'premium';
    WHEN 'recurring_payments' THEN
      RETURN user_plan = 'premium';
    WHEN 'team_management' THEN
      RETURN user_plan = 'premium';
    WHEN 'backup_automatic' THEN
      RETURN user_plan = 'premium';
    WHEN 'support_24_7' THEN
      RETURN user_plan = 'premium';
    WHEN 'executive_dashboard' THEN
      RETURN user_plan = 'premium';
    WHEN 'predictive_analytics' THEN
      RETURN user_plan = 'premium';
    
    -- Verificação específica para adição de usuários
    WHEN 'can_add_team_member' THEN
      RETURN public.can_add_team_member();
    
    -- Qualquer funcionalidade não mapeada = NEGADO
    ELSE
      RETURN FALSE;
  END CASE;
END;
$$;