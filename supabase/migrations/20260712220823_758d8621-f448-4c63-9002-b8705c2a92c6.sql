
-- =====================================================================
-- FIX 1: user_subscriptions — bloquear escalonamento de plano pelo cliente
-- =====================================================================
-- A política atual permitia INSERT/UPDATE/DELETE com user_id = auth.uid(),
-- o que deixava qualquer usuário autenticado inserir plan_type='premium'
-- diretamente via PostgREST. Restringir para SELECT apenas.
-- Escritas continuam funcionando via SECURITY DEFINER RPC (start_subscription)
-- e via edge functions com service_role (stripe-webhook, start-trial).

DROP POLICY IF EXISTS "user_subscriptions_owner" ON public.user_subscriptions;

CREATE POLICY "user_subscriptions_select_own"
  ON public.user_subscriptions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Defesa em profundidade: revogar privilégios de escrita concedidos por
-- default privileges. RLS já bloqueia, mas removemos o grant subjacente.
REVOKE INSERT, UPDATE, DELETE ON public.user_subscriptions FROM authenticated;
REVOKE INSERT, UPDATE, DELETE, SELECT ON public.user_subscriptions FROM anon;

-- =====================================================================
-- FIX 2: Enforcement de limites do plano Trial no servidor
-- =====================================================================
-- Frontend em usePlanLimits.ts bloqueia visualmente, mas nada impedia
-- INSERT direto via cliente Supabase. Adicionar triggers BEFORE INSERT.

CREATE OR REPLACE FUNCTION public.enforce_trial_quota()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan plan_type;
  v_count integer;
  v_limit integer;
  v_label text;
BEGIN
  -- Só valida quando existe usuário autenticado (inserts via service_role
  -- em edge functions/webhooks não têm auth.uid() → passam direto).
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- Só aplica ao dono do registro. Se o INSERT vem com outro user_id,
  -- a política RLS WITH CHECK já bloqueia; aqui só valida o próprio.
  IF NEW.user_id IS DISTINCT FROM auth.uid() THEN
    RETURN NEW;
  END IF;

  v_plan := public.get_user_plan(NEW.user_id);

  -- Somente Trial tem limites rígidos. Profissional/Premium ilimitado aqui.
  IF v_plan <> 'trial'::plan_type THEN
    RETURN NEW;
  END IF;

  IF TG_TABLE_NAME = 'clients' THEN
    v_limit := 5;  v_label := 'clientes';
    SELECT count(*) INTO v_count FROM public.clients WHERE user_id = NEW.user_id;
  ELSIF TG_TABLE_NAME = 'appointments' THEN
    v_limit := 3;  v_label := 'agendamentos';
    SELECT count(*) INTO v_count FROM public.appointments WHERE user_id = NEW.user_id;
  ELSIF TG_TABLE_NAME = 'services' THEN
    v_limit := 2;  v_label := 'serviços';
    SELECT count(*) INTO v_count FROM public.services WHERE user_id = NEW.user_id;
  ELSIF TG_TABLE_NAME = 'products' THEN
    v_limit := 10; v_label := 'produtos';
    SELECT count(*) INTO v_count FROM public.products WHERE user_id = NEW.user_id;
  ELSE
    RETURN NEW;
  END IF;

  IF v_count >= v_limit THEN
    RAISE EXCEPTION 'Limite do plano Teste Grátis atingido: máximo de % %. Faça upgrade para continuar.',
      v_limit, v_label
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_trial_quota_clients ON public.clients;
CREATE TRIGGER trg_enforce_trial_quota_clients
  BEFORE INSERT ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.enforce_trial_quota();

DROP TRIGGER IF EXISTS trg_enforce_trial_quota_appointments ON public.appointments;
CREATE TRIGGER trg_enforce_trial_quota_appointments
  BEFORE INSERT ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.enforce_trial_quota();

DROP TRIGGER IF EXISTS trg_enforce_trial_quota_services ON public.services;
CREATE TRIGGER trg_enforce_trial_quota_services
  BEFORE INSERT ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.enforce_trial_quota();

DROP TRIGGER IF EXISTS trg_enforce_trial_quota_products ON public.products;
CREATE TRIGGER trg_enforce_trial_quota_products
  BEFORE INSERT ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.enforce_trial_quota();
