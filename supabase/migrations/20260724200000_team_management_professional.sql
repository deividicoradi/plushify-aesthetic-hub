-- has_feature_access('team_management') liberava só o plano premium, mas o
-- plano Profissional já vende "até 2 usuários ativos" (plansData.ts /
-- PLAN_LIMITS.activeUsers=2) — sem essa liberação, ninguém no Profissional
-- conseguia sequer abrir a tela de Gestão de Equipe pra usar esse 2º
-- assento. Alinha o servidor com a regra de negócio real: Professional e
-- Premium liberam team_management (o limite de QUANTOS usuários continua
-- diferenciando os planos: 2 no Professional, 5 no Premium).

CREATE OR REPLACE FUNCTION public.has_feature_access(feature_name text) RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE user_plan plan_type;
BEGIN
  IF auth.uid() IS NULL THEN RETURN FALSE; END IF;
  user_plan := public.get_user_plan();
  CASE feature_name
    WHEN 'dashboard_basic' THEN RETURN user_plan IN ('trial','professional','premium');
    WHEN 'clients_limited' THEN RETURN user_plan = 'trial';
    WHEN 'appointments_limited' THEN RETURN user_plan = 'trial';
    WHEN 'inventory_basic' THEN RETURN user_plan = 'trial';
    WHEN 'clients_unlimited' THEN RETURN user_plan IN ('professional','premium');
    WHEN 'appointments_unlimited' THEN RETURN user_plan IN ('professional','premium');
    WHEN 'financial_management' THEN RETURN user_plan IN ('professional','premium');
    WHEN 'inventory_intermediate' THEN RETURN user_plan IN ('professional','premium');
    WHEN 'reports_basic' THEN RETURN user_plan IN ('professional','premium');
    WHEN 'cash_flow' THEN RETURN user_plan IN ('professional','premium');
    WHEN 'multiple_payment_methods' THEN RETURN user_plan IN ('professional','premium');
    WHEN 'support_priority' THEN RETURN user_plan IN ('professional','premium');
    WHEN 'team_management' THEN RETURN user_plan IN ('professional','premium');
    WHEN 'analytics_advanced' THEN RETURN user_plan = 'premium';
    WHEN 'reports_detailed' THEN RETURN user_plan = 'premium';
    WHEN 'reports_export' THEN RETURN user_plan = 'premium';
    WHEN 'inventory_advanced' THEN RETURN user_plan = 'premium';
    WHEN 'recurring_payments' THEN RETURN user_plan = 'premium';
    WHEN 'backup_automatic' THEN RETURN user_plan = 'premium';
    WHEN 'support_24_7' THEN RETURN user_plan = 'premium';
    WHEN 'executive_dashboard' THEN RETURN user_plan = 'premium';
    WHEN 'predictive_analytics' THEN RETURN user_plan = 'premium';
    ELSE RETURN FALSE;
  END CASE;
END;
$$;
