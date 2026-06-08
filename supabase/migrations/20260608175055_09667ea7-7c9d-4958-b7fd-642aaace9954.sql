-- Extra columns on existing tables
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS cpf text,
  ADD COLUMN IF NOT EXISTS cep text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS neighborhood text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS payment_method text;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS validity_date date,
  ADD COLUMN IF NOT EXISTS acquisition_date date;

ALTER TABLE public.working_hours
  ADD COLUMN IF NOT EXISTS auto_confirm_appointments boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS auto_complete_appointments boolean NOT NULL DEFAULT false;

ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS professional_id uuid;

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('info','warning','success','error')),
  title text NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY notifications_owner ON public.notifications FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, created_at DESC) WHERE read = false;

-- PROFESSIONALS
CREATE TABLE public.professionals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  email text,
  phone text,
  specialties text[],
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.professionals TO authenticated;
GRANT ALL ON public.professionals TO service_role;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
CREATE POLICY professionals_owner ON public.professionals FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER update_professionals_updated_at BEFORE UPDATE ON public.professionals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- SERVICE_PROFESSIONALS
CREATE TABLE public.service_professionals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  professional_id uuid NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, service_id, professional_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_professionals TO authenticated;
GRANT ALL ON public.service_professionals TO service_role;
ALTER TABLE public.service_professionals ENABLE ROW LEVEL SECURITY;
CREATE POLICY service_professionals_owner ON public.service_professionals FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- RPCs
CREATE OR REPLACE FUNCTION public.get_clients_masked(p_mask_sensitive boolean DEFAULT false)
RETURNS SETOF public.clients
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN; END IF;
  RETURN QUERY SELECT * FROM public.clients WHERE user_id = auth.uid() ORDER BY name;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_clients_masked(boolean) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_client_data_secure(p_client_id uuid, p_mask_sensitive boolean DEFAULT false)
RETURNS SETOF public.clients
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN; END IF;
  RETURN QUERY SELECT * FROM public.clients WHERE id = p_client_id AND user_id = auth.uid();
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_client_data_secure(uuid, boolean) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_professionals_secure(p_mask_sensitive boolean DEFAULT false)
RETURNS SETOF public.professionals
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN; END IF;
  RETURN QUERY SELECT * FROM public.professionals WHERE user_id = auth.uid() ORDER BY name;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_professionals_secure(boolean) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.start_subscription(
  p_user_id uuid,
  p_plan_code text,
  p_billing_interval text DEFAULT 'month',
  p_trial_days integer DEFAULT 0,
  p_stripe_subscription_id text DEFAULT NULL,
  p_stripe_customer_id text DEFAULT NULL,
  p_current_period_end timestamptz DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_id uuid; v_status text; v_trial_ends timestamptz;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN RAISE EXCEPTION 'Acesso negado'; END IF;
  v_trial_ends := CASE WHEN p_trial_days > 0 THEN now() + (p_trial_days || ' days')::interval ELSE NULL END;
  v_status := CASE WHEN p_trial_days > 0 THEN 'active' ELSE 'active' END;
  INSERT INTO public.user_subscriptions (user_id, plan_type, status, started_at, expires_at, trial_ends_at)
  VALUES (p_user_id, p_plan_code::public.plan_type, v_status, now(), p_current_period_end, v_trial_ends)
  ON CONFLICT (user_id) DO UPDATE SET
    plan_type = EXCLUDED.plan_type,
    status = EXCLUDED.status,
    started_at = now(),
    expires_at = EXCLUDED.expires_at,
    trial_ends_at = EXCLUDED.trial_ends_at,
    updated_at = now()
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.start_subscription(uuid, text, text, integer, text, text, timestamptz) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.set_authorization_password(p_password text) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'extensions' AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Não autenticado'; END IF;
  IF length(p_password) < 4 THEN RAISE EXCEPTION 'Senha muito curta'; END IF;
  INSERT INTO public.authorization_passwords (user_id, password_hash)
  VALUES (auth.uid(), extensions.crypt(p_password, extensions.gen_salt('bf')))
  ON CONFLICT (user_id) DO UPDATE SET password_hash = EXCLUDED.password_hash, updated_at = now();
  RETURN true;
END;
$$;
GRANT EXECUTE ON FUNCTION public.set_authorization_password(text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.verify_authorization_password(p_password text) RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public', 'extensions' AS $$
DECLARE v_hash text;
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  SELECT password_hash INTO v_hash FROM public.authorization_passwords WHERE user_id = auth.uid();
  IF v_hash IS NULL THEN RAISE EXCEPTION 'Authorization password not configured'; END IF;
  RETURN extensions.crypt(p_password, v_hash) = v_hash;
END;
$$;
GRANT EXECUTE ON FUNCTION public.verify_authorization_password(text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.check_pending_appointments_for_day(p_user_id uuid, p_day_of_week integer) RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_count int;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN RETURN false; END IF;
  SELECT COUNT(*) INTO v_count FROM public.appointments
   WHERE user_id = p_user_id
     AND status IN ('agendado','confirmado')
     AND appointment_date >= CURRENT_DATE
     AND EXTRACT(DOW FROM appointment_date)::int = p_day_of_week;
  RETURN v_count > 0;
END;
$$;
GRANT EXECUTE ON FUNCTION public.check_pending_appointments_for_day(uuid, integer) TO authenticated, service_role;