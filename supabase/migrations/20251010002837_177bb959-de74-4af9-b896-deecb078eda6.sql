-- Recriar função de trial automático com robustez e idempotência
CREATE OR REPLACE FUNCTION public.auto_start_trial_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  v_existing_count integer;
BEGIN
  -- Bloco à prova de falhas: nunca abortar INSERT em auth.users
  BEGIN
    -- Obter email do usuário
    v_email := LOWER(COALESCE(NEW.email, ''));
    
    -- 1. Pular contas internas/semente e emails NULL
    IF v_email = '' OR 
       v_email IS NULL OR
       v_email LIKE '%@example.%' OR
       v_email LIKE '%@test.%' OR
       v_email = 'public@plushify.com.br' OR
       v_email LIKE '%+test@%' THEN
      RAISE NOTICE 'Trial auto-start: Skipping internal/seed account: %', v_email;
      RETURN NEW;
    END IF;
    
    -- 2. Verificar se já existe assinatura ativa/trial para este usuário
    SELECT COUNT(*) INTO v_existing_count
    FROM public.user_subscriptions
    WHERE user_id = NEW.id
      AND status IN ('active', 'trial_active', 'trial');
    
    IF v_existing_count > 0 THEN
      RAISE NOTICE 'Trial auto-start: User % already has active subscription, skipping', NEW.id;
      RETURN NEW;
    END IF;
    
    -- 3. Criar assinatura trial automaticamente (trial sempre mensal por 3 dias)
    PERFORM public.start_subscription(
      p_user_id := NEW.id,
      p_plan_code := 'trial',
      p_billing_interval := 'month',
      p_trial_days := 3,
      p_stripe_subscription_id := NULL,
      p_stripe_customer_id := NULL,
      p_current_period_end := NULL
    );
    
    RAISE NOTICE 'Trial auto-start: Successfully created trial subscription for user %', NEW.id;
    
  EXCEPTION
    WHEN OTHERS THEN
      -- Capturar qualquer erro e apenas logar, sem abortar o cadastro
      RAISE NOTICE 'Trial auto-start: Error creating trial for user % - % %', 
        NEW.id, SQLERRM, SQLSTATE;
  END;
  
  RETURN NEW;
END;
$$;

-- Recriar trigger com mesmo nome
DROP TRIGGER IF EXISTS on_auth_user_created_start_trial ON auth.users;
CREATE TRIGGER on_auth_user_created_start_trial
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_start_trial_on_signup();