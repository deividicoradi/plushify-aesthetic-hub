-- 1. cash_openings / cash_closures: restore operator_id / machine_id columns
ALTER TABLE public.cash_openings
  ADD COLUMN IF NOT EXISTS operator_id uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS machine_id text;

ALTER TABLE public.cash_closures
  ADD COLUMN IF NOT EXISTS operator_id uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS machine_id text;

-- 2. clients.last_visit trigger from appointments
CREATE OR REPLACE FUNCTION public.update_client_last_visit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NEW.status = 'concluido' AND NEW.client_id IS NOT NULL THEN
    UPDATE public.clients
    SET last_visit = GREATEST(COALESCE(last_visit, NEW.appointment_date::timestamptz), NEW.appointment_date::timestamptz),
        updated_at = now()
    WHERE id = NEW.client_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_client_last_visit ON public.appointments;
CREATE TRIGGER trg_update_client_last_visit
AFTER INSERT OR UPDATE OF status ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.update_client_last_visit();

-- 3. redeem_loyalty_reward RPC
CREATE OR REPLACE FUNCTION public.redeem_loyalty_reward(p_client_id uuid, p_reward_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user uuid := auth.uid();
  v_reward public.loyalty_rewards%ROWTYPE;
  v_client public.clients%ROWTYPE;
  v_validity_days integer;
  v_cutoff timestamptz;
  v_balance numeric;
  v_redemption_id uuid;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;

  SELECT * INTO v_client FROM public.clients WHERE id = p_client_id AND user_id = v_user;
  IF NOT FOUND THEN RAISE EXCEPTION 'cliente não encontrado'; END IF;

  SELECT * INTO v_reward FROM public.loyalty_rewards
    WHERE id = p_reward_id AND user_id = v_user AND active = true AND available = true;
  IF NOT FOUND THEN RAISE EXCEPTION 'recompensa não encontrada ou indisponível'; END IF;

  SELECT points_validity_days INTO v_validity_days FROM public.loyalty_settings WHERE user_id = v_user;
  v_cutoff := CASE WHEN v_validity_days IS NOT NULL THEN now() - (v_validity_days || ' days')::interval ELSE NULL END;

  SELECT COALESCE(SUM(CASE WHEN kind = 'spend' THEN -points ELSE points END), 0) INTO v_balance
    FROM public.loyalty_point_transactions
    WHERE user_id = v_user AND client_id = p_client_id
      AND (kind = 'spend' OR v_cutoff IS NULL OR created_at >= v_cutoff);

  IF v_balance < v_reward.points_cost THEN RAISE EXCEPTION 'saldo de pontos insuficiente'; END IF;

  INSERT INTO public.loyalty_point_transactions (user_id, client_id, kind, source, points, description, reference_id)
    VALUES (v_user, p_client_id, 'spend', 'redemption', v_reward.points_cost, 'Resgate: ' || v_reward.title, v_reward.id);

  INSERT INTO public.loyalty_reward_redemptions
    (user_id, client_id, reward_id, reward_title, points_used, estimated_value, status)
    VALUES (v_user, p_client_id, v_reward.id, v_reward.title, v_reward.points_cost, 0, 'delivered')
    RETURNING id INTO v_redemption_id;

  RETURN v_redemption_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.redeem_loyalty_reward(uuid, uuid) TO authenticated;

-- 4. notes.client_id
ALTER TABLE public.notes
  ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_notes_client_id ON public.notes(client_id) WHERE client_id IS NOT NULL;

-- 5. profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  phone text,
  profession text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own profile" ON public.profiles;
CREATE POLICY "own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.profiles (id)
SELECT id FROM auth.users
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'handle_new_user_profile: Error creating profile for user % - % %', NEW.id, SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- 6. enforce_plan_limit triggers
CREATE OR REPLACE FUNCTION public.enforce_plan_limit()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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

  v_limit := CASE TG_TABLE_NAME
    WHEN 'clients' THEN CASE v_plan WHEN 'trial' THEN 5 ELSE -1 END
    WHEN 'appointments' THEN CASE v_plan WHEN 'trial' THEN 3 ELSE -1 END
    WHEN 'products' THEN CASE v_plan WHEN 'trial' THEN 10 WHEN 'professional' THEN 100 ELSE -1 END
    WHEN 'services' THEN CASE v_plan WHEN 'trial' THEN 2 WHEN 'professional' THEN 20 ELSE -1 END
    WHEN 'team_members' THEN CASE v_plan WHEN 'trial' THEN 1 WHEN 'professional' THEN 2 ELSE 5 END
    ELSE -1
  END;

  IF v_limit = -1 THEN RETURN NEW; END IF;

  IF TG_TABLE_NAME = 'team_members' THEN
    SELECT count(*) INTO v_count FROM public.team_members WHERE user_id = NEW.user_id AND status = 'active';
  ELSE
    EXECUTE format('SELECT count(*) FROM public.%I WHERE user_id = $1', TG_TABLE_NAME) INTO v_count USING NEW.user_id;
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
CREATE TRIGGER trg_enforce_plan_limit BEFORE INSERT ON public.clients FOR EACH ROW EXECUTE FUNCTION public.enforce_plan_limit();
DROP TRIGGER IF EXISTS trg_enforce_plan_limit ON public.appointments;
CREATE TRIGGER trg_enforce_plan_limit BEFORE INSERT ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.enforce_plan_limit();
DROP TRIGGER IF EXISTS trg_enforce_plan_limit ON public.products;
CREATE TRIGGER trg_enforce_plan_limit BEFORE INSERT ON public.products FOR EACH ROW EXECUTE FUNCTION public.enforce_plan_limit();
DROP TRIGGER IF EXISTS trg_enforce_plan_limit ON public.services;
CREATE TRIGGER trg_enforce_plan_limit BEFORE INSERT ON public.services FOR EACH ROW EXECUTE FUNCTION public.enforce_plan_limit();
DROP TRIGGER IF EXISTS trg_enforce_plan_limit ON public.team_members;
CREATE TRIGGER trg_enforce_plan_limit BEFORE INSERT ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.enforce_plan_limit();

-- 7. has_feature_access: team_management for professional
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

-- 8. Staff PIN mode
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS pin_hash text;

CREATE OR REPLACE FUNCTION public.set_team_member_pin(p_member_id uuid, p_pin text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'extensions' AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Não autenticado'; END IF;
  IF p_pin !~ '^[0-9]{4,6}$' THEN RAISE EXCEPTION 'O PIN deve ter de 4 a 6 dígitos numéricos'; END IF;

  UPDATE public.team_members
    SET pin_hash = extensions.crypt(p_pin, extensions.gen_salt('bf')), updated_at = now()
    WHERE id = p_member_id AND user_id = auth.uid();

  IF NOT FOUND THEN RAISE EXCEPTION 'Membro não encontrado'; END IF;
  RETURN true;
END;
$$;
GRANT EXECUTE ON FUNCTION public.set_team_member_pin(uuid, text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.clear_team_member_pin(p_member_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Não autenticado'; END IF;
  UPDATE public.team_members SET pin_hash = NULL, updated_at = now()
    WHERE id = p_member_id AND user_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'Membro não encontrado'; END IF;
  RETURN true;
END;
$$;
GRANT EXECUTE ON FUNCTION public.clear_team_member_pin(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.verify_team_member_pin(p_member_id uuid, p_pin text)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public', 'extensions' AS $$
DECLARE v_hash text;
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  SELECT pin_hash INTO v_hash FROM public.team_members
    WHERE id = p_member_id AND user_id = auth.uid() AND status = 'active';
  IF v_hash IS NULL THEN RETURN false; END IF;
  RETURN extensions.crypt(p_pin, v_hash) = v_hash;
END;
$$;
GRANT EXECUTE ON FUNCTION public.verify_team_member_pin(uuid, text) TO authenticated, service_role;