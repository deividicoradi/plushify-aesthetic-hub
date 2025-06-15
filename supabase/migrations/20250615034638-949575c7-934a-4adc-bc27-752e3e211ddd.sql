
-- Primeiro, criar o enum para tipos de plano
DO $$ BEGIN
    CREATE TYPE public.plan_type AS ENUM ('trial', 'professional', 'premium');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Criar tabela de assinaturas dos usuários
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_type plan_type NOT NULL DEFAULT 'trial',
  status TEXT NOT NULL DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Habilitar RLS na tabela user_subscriptions
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS restritivas para user_subscriptions
CREATE POLICY "Strict user subscription select" 
  ON public.user_subscriptions 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Strict user subscription insert" 
  ON public.user_subscriptions 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Strict user subscription update" 
  ON public.user_subscriptions 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Strict user subscription delete" 
  ON public.user_subscriptions 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Função para verificar o plano do usuário
CREATE OR REPLACE FUNCTION public.get_user_plan(user_uuid UUID DEFAULT auth.uid())
RETURNS plan_type
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
    RETURN 'trial'::plan_type;
  END IF;
  
  -- Verificar se o usuário está tentando acessar dados de outro usuário
  IF user_uuid != auth.uid() THEN
    RAISE EXCEPTION 'Acesso negado: usuário não autorizado';
  END IF;
  
  -- Buscar o plano do usuário
  SELECT 
    CASE 
      WHEN trial_ends_at IS NOT NULL AND trial_ends_at > now() THEN 'trial'::plan_type
      WHEN expires_at IS NULL OR expires_at > now() THEN plan_type
      ELSE 'trial'::plan_type
    END
  INTO user_plan
  FROM public.user_subscriptions
  WHERE user_id = user_uuid AND status = 'active'
  LIMIT 1;
  
  -- Se não encontrar assinatura, retornar trial
  IF user_plan IS NULL THEN
    RETURN 'trial'::plan_type;
  END IF;
  
  RETURN user_plan;
END;
$$;

-- Função para verificar acesso a funcionalidades
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
  
  -- Definir acesso às funcionalidades por plano
  CASE feature_name
    WHEN 'dashboard_basic' THEN
      RETURN user_plan IN ('trial', 'professional', 'premium');
    WHEN 'clients_unlimited' THEN
      RETURN user_plan IN ('professional', 'premium');
    WHEN 'clients_limited' THEN
      RETURN user_plan = 'trial';
    WHEN 'appointments_unlimited' THEN
      RETURN user_plan IN ('professional', 'premium');
    WHEN 'appointments_limited' THEN
      RETURN user_plan = 'trial';
    WHEN 'financial_management' THEN
      RETURN user_plan IN ('professional', 'premium');
    WHEN 'inventory_advanced' THEN
      RETURN user_plan IN ('professional', 'premium');
    WHEN 'inventory_basic' THEN
      RETURN user_plan = 'trial';
    WHEN 'reports_detailed' THEN
      RETURN user_plan IN ('professional', 'premium');
    WHEN 'analytics_advanced' THEN
      RETURN user_plan = 'premium';
    WHEN 'team_management' THEN
      RETURN user_plan = 'premium';
    WHEN 'backup_automatic' THEN
      RETURN user_plan = 'premium';
    WHEN 'support_priority' THEN
      RETURN user_plan IN ('professional', 'premium');
    WHEN 'support_24_7' THEN
      RETURN user_plan = 'premium';
    ELSE
      RETURN FALSE;
  END CASE;
END;
$$;
