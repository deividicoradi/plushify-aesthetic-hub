-- Criar função para iniciar trial automaticamente após cadastro
CREATE OR REPLACE FUNCTION public.auto_start_trial_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Criar assinatura trial automaticamente para novos usuários
  PERFORM public.start_subscription(
    p_user_id := NEW.id,
    p_plan_code := 'trial',
    p_billing_interval := 'month',
    p_trial_days := 3,
    p_stripe_subscription_id := NULL,
    p_stripe_customer_id := NULL,
    p_current_period_end := NULL
  );
  
  RETURN NEW;
END;
$$;

-- Criar trigger para executar após inserção de novo usuário
DROP TRIGGER IF EXISTS on_auth_user_created_start_trial ON auth.users;
CREATE TRIGGER on_auth_user_created_start_trial
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_start_trial_on_signup();