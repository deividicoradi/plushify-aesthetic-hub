-- Adicionar feature de WhatsApp ao sistema de controle de acesso
-- Atualizar a função has_feature_access para incluir WhatsApp como feature premium

CREATE OR REPLACE FUNCTION public.has_feature_access(feature_name text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    
    -- Funcionalidades APENAS Premium
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
    
    -- WhatsApp Business - APENAS Premium
    WHEN 'whatsapp_business' THEN
      RETURN user_plan = 'premium';
    
    -- Verificação específica para adição de usuários
    WHEN 'can_add_team_member' THEN
      RETURN public.can_add_team_member();
    
    -- Qualquer funcionalidade não mapeada = NEGADO
    ELSE
      RETURN FALSE;
  END CASE;
END;
$function$;