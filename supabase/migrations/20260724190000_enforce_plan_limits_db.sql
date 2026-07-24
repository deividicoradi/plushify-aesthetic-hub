-- Os limites de plano (clientes/agendamentos/produtos/serviços/equipe) só
-- eram checados no formulário do frontend (usePlanLimits.hasReachedLimit).
-- Não havia nenhum trigger/constraint no banco, então qualquer chamada
-- direta à API REST do Supabase (fora dos formulários) inserisse dados sem
-- respeitar o limite do plano do usuário — inclusive no trial.
--
-- Esta migration adiciona enforcement real no banco, como última linha de
-- defesa (o frontend continua bloqueando antes, para dar feedback imediato
-- ao usuário; isto aqui é o que garante que o limite vale de verdade).
--
-- Nota: a lógica de plano é reimplementada aqui (em vez de chamar
-- get_user_plan) porque get_user_plan() exige user_uuid = auth.uid(), o que
-- quebraria o fluxo de agendamento público (create_public_booking insere em
-- appointments em nome do profissional, com auth.uid() nulo/anônimo).

CREATE OR REPLACE FUNCTION public.enforce_plan_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan public.plan_type;
  v_limit integer;
  v_count integer;
BEGIN
  SELECT CASE
    WHEN trial_ends_at IS NOT NULL AND trial_ends_at > now() THEN 'trial'::public.plan_type
    WHEN expires_at IS NULL OR expires_at > now() THEN plan_type
    ELSE 'trial'::public.plan_type END
  INTO v_plan
  FROM public.user_subscriptions
  WHERE user_id = NEW.user_id AND status = 'active'
  LIMIT 1;

  v_plan := COALESCE(v_plan, 'trial'::public.plan_type);

  -- Limites espelham PLAN_LIMITS em src/hooks/usePlanLimits.ts.
  -- -1 = ilimitado (não checa).
  v_limit := CASE TG_TABLE_NAME
    WHEN 'clients' THEN CASE v_plan WHEN 'trial' THEN 5 ELSE -1 END
    WHEN 'appointments' THEN CASE v_plan WHEN 'trial' THEN 3 ELSE -1 END
    WHEN 'products' THEN CASE v_plan WHEN 'trial' THEN 10 WHEN 'professional' THEN 100 ELSE -1 END
    WHEN 'services' THEN CASE v_plan WHEN 'trial' THEN 2 WHEN 'professional' THEN 20 ELSE -1 END
    WHEN 'team_members' THEN CASE v_plan WHEN 'trial' THEN 1 WHEN 'professional' THEN 2 ELSE 5 END
    ELSE -1
  END;

  IF v_limit = -1 THEN
    RETURN NEW;
  END IF;

  IF TG_TABLE_NAME = 'team_members' THEN
    SELECT count(*) INTO v_count FROM public.team_members
      WHERE user_id = NEW.user_id AND status = 'active';
  ELSE
    EXECUTE format('SELECT count(*) FROM public.%I WHERE user_id = $1', TG_TABLE_NAME)
      INTO v_count USING NEW.user_id;
  END IF;

  IF v_count >= v_limit THEN
    RAISE EXCEPTION 'Limite do plano % atingido para %: máximo de % registros', v_plan, TG_TABLE_NAME, v_limit
      USING ERRCODE = 'P0001', HINT = 'Faça upgrade de plano para continuar.';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_plan_limit() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.enforce_plan_limit() TO service_role;

DROP TRIGGER IF EXISTS trg_enforce_plan_limit ON public.clients;
CREATE TRIGGER trg_enforce_plan_limit BEFORE INSERT ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.enforce_plan_limit();

DROP TRIGGER IF EXISTS trg_enforce_plan_limit ON public.appointments;
CREATE TRIGGER trg_enforce_plan_limit BEFORE INSERT ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.enforce_plan_limit();

DROP TRIGGER IF EXISTS trg_enforce_plan_limit ON public.products;
CREATE TRIGGER trg_enforce_plan_limit BEFORE INSERT ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.enforce_plan_limit();

DROP TRIGGER IF EXISTS trg_enforce_plan_limit ON public.services;
CREATE TRIGGER trg_enforce_plan_limit BEFORE INSERT ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.enforce_plan_limit();

DROP TRIGGER IF EXISTS trg_enforce_plan_limit ON public.team_members;
CREATE TRIGGER trg_enforce_plan_limit BEFORE INSERT ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.enforce_plan_limit();
