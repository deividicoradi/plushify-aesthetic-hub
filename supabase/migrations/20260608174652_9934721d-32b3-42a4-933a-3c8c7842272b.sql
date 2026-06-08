CREATE TYPE public.plan_type AS ENUM ('trial', 'professional', 'premium');

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE FUNCTION public.audit_trigger_function() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE old_data JSONB; new_data JSONB; operation_type TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN old_data := to_jsonb(OLD); operation_type := 'DELETE';
  ELSIF TG_OP = 'INSERT' THEN new_data := to_jsonb(NEW); operation_type := 'INSERT';
  ELSIF TG_OP = 'UPDATE' THEN old_data := to_jsonb(OLD); new_data := to_jsonb(NEW); operation_type := 'UPDATE';
  END IF;
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO public.audit_logs (user_id, table_name, record_id, action, old_data, new_data, reason)
    VALUES (auth.uid(), TG_TABLE_NAME, COALESCE(NEW.id, OLD.id), operation_type, old_data, new_data, 'Automatic audit trigger');
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE FUNCTION public.detect_sql_injection(input_text text) RETURNS boolean LANGUAGE plpgsql IMMUTABLE SET search_path TO 'public' AS $$
DECLARE
  malicious_patterns TEXT[] := ARRAY['union\s+select','drop\s+table','delete\s+from','insert\s+into','update\s+set','exec\s*\(','execute\s*\(','sp_executesql','xp_cmdshell','script\s*>','<\s*script','javascript:','vbscript:','onload\s*=','onerror\s*=','eval\s*\(','expression\s*\(','url\s*\(','import\s*\('];
  pattern TEXT;
BEGIN
  IF input_text IS NULL THEN RETURN FALSE; END IF;
  input_text := lower(input_text);
  FOREACH pattern IN ARRAY malicious_patterns LOOP
    IF input_text ~* pattern THEN RETURN TRUE; END IF;
  END LOOP;
  RETURN FALSE;
END;
$$;

CREATE FUNCTION public.sanitize_input(input_text text) RETURNS text LANGUAGE plpgsql IMMUTABLE SET search_path TO 'public' AS $$
BEGIN
  IF input_text IS NULL THEN RETURN NULL; END IF;
  input_text := regexp_replace(input_text, '[<>\"''%;()&+]', '', 'g');
  IF length(input_text) > 1000 THEN input_text := left(input_text, 1000); END IF;
  RETURN trim(input_text);
END;
$$;

CREATE FUNCTION public.validate_email(email text) RETURNS boolean LANGUAGE plpgsql IMMUTABLE SET search_path TO 'public' AS $_$
BEGIN
  IF email IS NULL THEN RETURN TRUE; END IF;
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$_$;

CREATE FUNCTION public.validate_phone(phone text) RETURNS boolean LANGUAGE plpgsql IMMUTABLE SET search_path TO 'public' AS $_$
BEGIN
  IF phone IS NULL THEN RETURN TRUE; END IF;
  phone := regexp_replace(phone, '[^0-9]', '', 'g');
  RETURN phone ~ '^[1-9][0-9]{9,10}$';
END;
$_$;

CREATE FUNCTION public.clients_security_trigger() RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF public.detect_sql_injection(NEW.name) OR public.detect_sql_injection(NEW.email) OR public.detect_sql_injection(NEW.phone) THEN
    RAISE EXCEPTION 'Tentativa de injeção detectada e bloqueada';
  END IF;
  NEW.name := public.sanitize_input(NEW.name);
  NEW.email := public.sanitize_input(NEW.email);
  NEW.phone := public.sanitize_input(NEW.phone);
  RETURN NEW;
END;
$$;

CREATE FUNCTION public.update_product_stock() RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  UPDATE public.products SET stock_quantity = NEW.new_stock, updated_at = now() WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$;

-- TABLES
CREATE TABLE public.appointments (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  client_id uuid,
  service_id uuid,
  client_name text NOT NULL,
  service_name text NOT NULL,
  appointment_date date NOT NULL,
  appointment_time time without time zone NOT NULL,
  duration integer DEFAULT 60 NOT NULL,
  status text DEFAULT 'agendado' NOT NULL CHECK (status IN ('agendado','confirmado','concluido','cancelado')),
  price numeric(10,2) DEFAULT 0 NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE public.audit_logs (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL,
  old_data jsonb,
  new_data jsonb,
  reason text,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE public.authorization_passwords (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE public.cash_closures (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  closure_date date NOT NULL,
  opening_balance numeric(10,2) DEFAULT 0 NOT NULL,
  closing_balance numeric(10,2) NOT NULL,
  total_income numeric(10,2) DEFAULT 0 NOT NULL,
  total_expenses numeric(10,2) DEFAULT 0 NOT NULL,
  cash_amount numeric(10,2) DEFAULT 0 NOT NULL,
  card_amount numeric(10,2) DEFAULT 0 NOT NULL,
  pix_amount numeric(10,2) DEFAULT 0 NOT NULL,
  other_amount numeric(10,2) DEFAULT 0 NOT NULL,
  difference numeric(10,2) DEFAULT 0 NOT NULL,
  status text DEFAULT 'aberto' NOT NULL CHECK (status IN ('aberto','fechado')),
  notes text,
  closed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE public.cash_openings (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  opening_date date NOT NULL,
  opening_balance numeric DEFAULT 0 NOT NULL,
  cash_amount numeric DEFAULT 0 NOT NULL,
  card_amount numeric DEFAULT 0 NOT NULL,
  pix_amount numeric DEFAULT 0 NOT NULL,
  other_amount numeric DEFAULT 0 NOT NULL,
  notes text,
  status text DEFAULT 'aberto' NOT NULL,
  opened_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE public.clients (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL CHECK (length(trim(name)) > 0 AND length(name) <= 255),
  email text CHECK (public.validate_email(email)),
  phone text CHECK (public.validate_phone(phone)),
  status text DEFAULT 'Ativo' CHECK (status IN ('Ativo','Inativo','Bloqueado')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  last_visit timestamptz
);

CREATE TABLE public.dashboard_analytics (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  analysis_date date DEFAULT CURRENT_DATE NOT NULL,
  metrics jsonb NOT NULL,
  insights jsonb NOT NULL,
  trends jsonb NOT NULL,
  recommendations jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE public.payment_methods (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('pix','dinheiro','cartao_debito','cartao_credito','transferencia','boleto','cheque','vale_alimentacao','vale_refeicao','outros')),
  active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE public.expenses (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  category text NOT NULL CHECK (category IN ('Aluguel','Energia','Internet','Material','Salários','Marketing','Outros')),
  description text NOT NULL CHECK (length(trim(description)) > 0),
  amount numeric(10,2) NOT NULL CHECK (amount > 0),
  payment_method_id uuid REFERENCES public.payment_methods(id),
  expense_date timestamptz DEFAULT now() NOT NULL,
  receipt_url text,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE public.financial_transactions (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  appointment_id uuid,
  type text NOT NULL CHECK (type IN ('receita','despesa')),
  category text NOT NULL,
  amount numeric(10,2) NOT NULL,
  description text,
  transaction_date timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE public.payments (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  appointment_id uuid,
  client_id uuid,
  payment_method_id uuid NOT NULL REFERENCES public.payment_methods(id),
  amount numeric(10,2) NOT NULL CHECK (amount > 0),
  paid_amount numeric(10,2) DEFAULT 0 NOT NULL CHECK (paid_amount >= 0),
  discount numeric(10,2) DEFAULT 0 CHECK (COALESCE(discount,0) >= 0),
  status text DEFAULT 'pendente' NOT NULL CHECK (status IN ('pendente','pago','parcial','cancelado','vencido')),
  payment_date timestamptz,
  due_date timestamptz,
  description text,
  notes text,
  installments integer DEFAULT 1 NOT NULL CHECK (installments > 0 AND installments <= 360),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT payments_paid_not_exceed_total CHECK (paid_amount <= amount)
);

CREATE TABLE public.installments (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  payment_id uuid NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  installment_number integer NOT NULL,
  total_installments integer NOT NULL,
  amount numeric(10,2) NOT NULL,
  paid_amount numeric(10,2) DEFAULT 0 NOT NULL,
  due_date timestamptz NOT NULL,
  payment_date timestamptz,
  status text DEFAULT 'pendente' NOT NULL CHECK (status IN ('pendente','pago','atrasado','cancelado')),
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE public.products (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL CHECK (length(trim(name)) > 0),
  description text,
  sku text,
  price numeric(10,2) DEFAULT 0 NOT NULL CHECK (price >= 0),
  cost_price numeric(10,2) DEFAULT 0 CHECK (COALESCE(cost_price,0) >= 0),
  stock_quantity integer DEFAULT 0 NOT NULL CHECK (stock_quantity >= 0),
  min_stock_level integer DEFAULT 0 CHECK (COALESCE(min_stock_level,0) >= 0),
  category text,
  brand text,
  barcode text,
  active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (user_id, name),
  UNIQUE (user_id, sku)
);

CREATE TABLE public.inventory_transactions (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  transaction_type text NOT NULL CHECK (transaction_type IN ('entrada','saida','ajuste')),
  quantity integer NOT NULL,
  previous_stock integer NOT NULL,
  new_stock integer NOT NULL,
  cost_price numeric(10,2),
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE public.notes (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  content text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.services (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL CHECK (length(trim(name)) > 0),
  description text,
  duration integer NOT NULL CHECK (duration > 0 AND duration <= 480),
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  category text,
  active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE public.team_members (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  email text,
  phone text,
  role text NOT NULL,
  permissions jsonb DEFAULT '{}'::jsonb,
  avatar_url text,
  status text DEFAULT 'active' NOT NULL,
  hire_date date,
  salary numeric,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE public.user_subscriptions (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  plan_type public.plan_type DEFAULT 'trial' NOT NULL,
  status text DEFAULT 'active' NOT NULL,
  started_at timestamptz DEFAULT now() NOT NULL,
  expires_at timestamptz,
  trial_ends_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE public.working_hours (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- FK to appointments/services/clients (added after tables exist)
ALTER TABLE public.appointments ADD CONSTRAINT appointments_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id);
ALTER TABLE public.appointments ADD CONSTRAINT appointments_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id);

-- INDEXES
CREATE INDEX idx_appointments_user_date ON public.appointments(user_id, appointment_date DESC);
CREATE INDEX idx_appointments_status_date ON public.appointments(user_id, status, appointment_date DESC);
CREATE INDEX idx_appointments_client_date ON public.appointments(user_id, client_id, appointment_date DESC) WHERE client_id IS NOT NULL;
CREATE INDEX idx_appointments_service_date ON public.appointments(user_id, service_id, appointment_date DESC) WHERE service_id IS NOT NULL;
CREATE INDEX idx_audit_logs_user_date ON public.audit_logs(user_id, created_at DESC);
CREATE INDEX idx_cash_closures_status_date ON public.cash_closures(user_id, status, closure_date DESC);
CREATE UNIQUE INDEX idx_unique_cash_opening_per_day ON public.cash_openings(user_id, opening_date) WHERE status = 'aberto';
CREATE INDEX idx_cash_openings_status_date ON public.cash_openings(user_id, status, opening_date DESC);
CREATE INDEX idx_clients_user_id ON public.clients(user_id);
CREATE INDEX idx_clients_status_active ON public.clients(user_id, status) WHERE status = 'Ativo';
CREATE INDEX idx_clients_email_unique ON public.clients(user_id, email) WHERE email IS NOT NULL;
CREATE INDEX idx_clients_phone_search ON public.clients(user_id, phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_dashboard_analytics_user_date ON public.dashboard_analytics(user_id, analysis_date DESC);
CREATE INDEX idx_expenses_user_date ON public.expenses(user_id, expense_date DESC);
CREATE INDEX idx_expenses_category_date ON public.expenses(user_id, category, expense_date DESC);
CREATE INDEX idx_financial_transactions_user_date ON public.financial_transactions(user_id, transaction_date DESC);
CREATE INDEX idx_financial_transactions_type_category ON public.financial_transactions(user_id, type, category);
CREATE INDEX idx_installments_user_due_date ON public.installments(user_id, due_date);
CREATE INDEX idx_installments_due_status ON public.installments(user_id, due_date, status) WHERE status IN ('pendente','vencido');
CREATE INDEX idx_installments_payment_id ON public.installments(payment_id);
CREATE INDEX idx_notes_user_updated ON public.notes(user_id, updated_at DESC NULLS LAST);
CREATE INDEX idx_payment_methods_user_id ON public.payment_methods(user_id);
CREATE INDEX idx_payments_user_date ON public.payments(user_id, payment_date DESC);
CREATE INDEX idx_payments_client_status ON public.payments(user_id, client_id, status) WHERE client_id IS NOT NULL;
CREATE INDEX idx_payments_due_date_pending ON public.payments(due_date) WHERE status = 'pendente' AND due_date IS NOT NULL;
CREATE INDEX idx_products_user_id ON public.products(user_id);
CREATE INDEX idx_products_category_active ON public.products(user_id, category) WHERE active = true AND category IS NOT NULL;
CREATE INDEX idx_products_stock_low ON public.products(user_id, stock_quantity) WHERE active = true AND stock_quantity <= min_stock_level;
CREATE INDEX idx_services_user_id ON public.services(user_id);
CREATE INDEX idx_services_active_price ON public.services(user_id, active, price DESC) WHERE active = true;

-- TRIGGERS for updated_at and audit
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cash_closures_updated_at BEFORE UPDATE ON public.cash_closures FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cash_openings_updated_at BEFORE UPDATE ON public.cash_openings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_dashboard_analytics_updated_at BEFORE UPDATE ON public.dashboard_analytics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_financial_transactions_updated_at BEFORE UPDATE ON public.financial_transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_installments_updated_at BEFORE UPDATE ON public.installments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON public.payment_methods FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_working_hours_updated_at BEFORE UPDATE ON public.working_hours FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER audit_clients_trigger AFTER INSERT OR UPDATE OR DELETE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
CREATE TRIGGER audit_expenses_trigger AFTER INSERT OR UPDATE OR DELETE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
CREATE TRIGGER audit_payments_trigger AFTER INSERT OR UPDATE OR DELETE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
CREATE TRIGGER audit_products_trigger AFTER INSERT OR UPDATE OR DELETE ON public.products FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
CREATE TRIGGER audit_services_trigger AFTER INSERT OR UPDATE OR DELETE ON public.services FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
CREATE TRIGGER clients_security_trigger_t BEFORE INSERT OR UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.clients_security_trigger();
CREATE TRIGGER update_product_stock_trigger AFTER INSERT ON public.inventory_transactions FOR EACH ROW EXECUTE FUNCTION public.update_product_stock();

-- GRANTS
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated; GRANT ALL ON public.appointments TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.audit_logs TO authenticated; GRANT ALL ON public.audit_logs TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.authorization_passwords TO authenticated; GRANT ALL ON public.authorization_passwords TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cash_closures TO authenticated; GRANT ALL ON public.cash_closures TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cash_openings TO authenticated; GRANT ALL ON public.cash_openings TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated; GRANT ALL ON public.clients TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dashboard_analytics TO authenticated; GRANT ALL ON public.dashboard_analytics TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated; GRANT ALL ON public.expenses TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.financial_transactions TO authenticated; GRANT ALL ON public.financial_transactions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.installments TO authenticated; GRANT ALL ON public.installments TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory_transactions TO authenticated; GRANT ALL ON public.inventory_transactions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notes TO authenticated; GRANT ALL ON public.notes TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_methods TO authenticated; GRANT ALL ON public.payment_methods TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated; GRANT ALL ON public.payments TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated; GRANT ALL ON public.products TO service_role;
GRANT SELECT ON public.services TO anon; GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated; GRANT ALL ON public.services TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_members TO authenticated; GRANT ALL ON public.team_members TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_subscriptions TO authenticated; GRANT ALL ON public.user_subscriptions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.working_hours TO authenticated; GRANT ALL ON public.working_hours TO service_role;

-- RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authorization_passwords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_closures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_openings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;

-- POLICIES (owner-scoped FOR ALL)
CREATE POLICY appointments_owner ON public.appointments FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY audit_logs_select ON public.audit_logs FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY audit_logs_insert ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY authorization_passwords_owner ON public.authorization_passwords FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY cash_closures_owner ON public.cash_closures FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY cash_openings_owner ON public.cash_openings FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY clients_owner ON public.clients FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY dashboard_analytics_owner ON public.dashboard_analytics FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY expenses_owner ON public.expenses FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY financial_transactions_owner ON public.financial_transactions FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY installments_owner ON public.installments FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY inventory_transactions_owner ON public.inventory_transactions FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY notes_owner ON public.notes FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY payment_methods_owner ON public.payment_methods FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY payments_owner ON public.payments FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY products_owner ON public.products FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY services_owner ON public.services FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY services_public_active ON public.services FOR SELECT TO anon USING (active = true);
CREATE POLICY team_members_owner ON public.team_members FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY user_subscriptions_owner ON public.user_subscriptions FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY working_hours_owner ON public.working_hours FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Helper functions referenced by the app
CREATE OR REPLACE FUNCTION public.get_user_plan(user_uuid uuid DEFAULT auth.uid()) RETURNS public.plan_type LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE user_plan plan_type;
BEGIN
  IF auth.uid() IS NULL THEN RETURN 'trial'::plan_type; END IF;
  IF user_uuid != auth.uid() THEN RAISE EXCEPTION 'Acesso negado'; END IF;
  SELECT CASE
    WHEN trial_ends_at IS NOT NULL AND trial_ends_at > now() THEN 'trial'::plan_type
    WHEN expires_at IS NULL OR expires_at > now() THEN plan_type
    ELSE 'trial'::plan_type END
  INTO user_plan FROM public.user_subscriptions WHERE user_id = user_uuid AND status = 'active' LIMIT 1;
  RETURN COALESCE(user_plan, 'trial'::plan_type);
END;
$$;

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
    WHEN 'analytics_advanced' THEN RETURN user_plan = 'premium';
    WHEN 'reports_detailed' THEN RETURN user_plan = 'premium';
    WHEN 'reports_export' THEN RETURN user_plan = 'premium';
    WHEN 'inventory_advanced' THEN RETURN user_plan = 'premium';
    WHEN 'recurring_payments' THEN RETURN user_plan = 'premium';
    WHEN 'team_management' THEN RETURN user_plan = 'premium';
    WHEN 'backup_automatic' THEN RETURN user_plan = 'premium';
    WHEN 'support_24_7' THEN RETURN user_plan = 'premium';
    WHEN 'executive_dashboard' THEN RETURN user_plan = 'premium';
    WHEN 'predictive_analytics' THEN RETURN user_plan = 'premium';
    ELSE RETURN FALSE;
  END CASE;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_appointment_availability(p_user_id uuid, p_appointment_date date, p_appointment_time time without time zone, p_duration integer, p_exclude_appointment_id uuid DEFAULT NULL) RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE appointment_end_time time; day_of_week_num int; working_start time; working_end time; conflict_count int;
BEGIN
  appointment_end_time := p_appointment_time + (p_duration || ' minutes')::interval;
  day_of_week_num := EXTRACT(DOW FROM p_appointment_date);
  SELECT wh.start_time, wh.end_time INTO working_start, working_end FROM public.working_hours wh WHERE wh.user_id = p_user_id AND wh.day_of_week = day_of_week_num AND wh.is_active = true LIMIT 1;
  IF working_start IS NULL THEN RETURN FALSE; END IF;
  IF p_appointment_time < working_start OR appointment_end_time > working_end THEN RETURN FALSE; END IF;
  SELECT COUNT(*) INTO conflict_count FROM public.appointments a
  WHERE a.user_id = p_user_id AND a.appointment_date = p_appointment_date AND a.status <> 'cancelado'
    AND (p_exclude_appointment_id IS NULL OR a.id != p_exclude_appointment_id)
    AND ((p_appointment_time >= a.appointment_time AND p_appointment_time < (a.appointment_time + (a.duration || ' minutes')::interval))
      OR (appointment_end_time > a.appointment_time AND appointment_end_time <= (a.appointment_time + (a.duration || ' minutes')::interval))
      OR (p_appointment_time <= a.appointment_time AND appointment_end_time >= (a.appointment_time + (a.duration || ' minutes')::interval)));
  RETURN conflict_count = 0;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_available_slots(p_user_id uuid, p_date date, p_service_duration integer DEFAULT 60, p_slot_interval integer DEFAULT 30) RETURNS TABLE(slot_time time, is_available boolean) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE day_of_week_num int; working_start time; working_end time; current_slot time;
BEGIN
  day_of_week_num := EXTRACT(DOW FROM p_date);
  SELECT wh.start_time, wh.end_time INTO working_start, working_end FROM public.working_hours wh WHERE wh.user_id = p_user_id AND wh.day_of_week = day_of_week_num AND wh.is_active = true LIMIT 1;
  IF working_start IS NULL THEN RETURN; END IF;
  current_slot := working_start;
  WHILE current_slot + (p_service_duration || ' minutes')::interval <= working_end LOOP
    RETURN QUERY SELECT current_slot, public.check_appointment_availability(p_user_id, p_date, current_slot, p_service_duration);
    current_slot := current_slot + (p_slot_interval || ' minutes')::interval;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_public_available_slots(p_service_id uuid, p_date date) RETURNS TABLE(slot_time time, is_available boolean) LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_service RECORD;
BEGIN
  SELECT duration, user_id INTO v_service FROM public.services WHERE id = p_service_id AND active = true;
  IF NOT FOUND THEN RAISE EXCEPTION 'Serviço não encontrado'; END IF;
  RETURN QUERY SELECT * FROM public.get_available_slots(v_service.user_id, p_date, v_service.duration, 30);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_public_services() RETURNS TABLE(id uuid, name text, description text, price numeric, duration integer, category text) LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN RETURN QUERY SELECT s.id, s.name, s.description, s.price, s.duration, s.category FROM public.services s WHERE s.active = true ORDER BY s.name; END;
$$;

CREATE OR REPLACE FUNCTION public.create_public_booking(p_client_name text, p_client_email text, p_client_phone text, p_service_id uuid, p_appointment_date date, p_appointment_time time, p_notes text DEFAULT NULL) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_service RECORD; v_appointment_id uuid; v_client_id uuid;
BEGIN
  SELECT id, name, price, duration, user_id INTO v_service FROM public.services WHERE id = p_service_id AND active = true;
  IF NOT FOUND THEN RAISE EXCEPTION 'Serviço não encontrado ou inativo'; END IF;
  IF NOT public.check_appointment_availability(v_service.user_id, p_appointment_date, p_appointment_time, v_service.duration) THEN RAISE EXCEPTION 'Horário não disponível'; END IF;
  IF p_client_email IS NOT NULL AND p_client_email <> '' THEN
    SELECT id INTO v_client_id FROM public.clients WHERE user_id = v_service.user_id AND email = p_client_email LIMIT 1;
  END IF;
  IF v_client_id IS NULL AND p_client_phone IS NOT NULL AND p_client_phone <> '' THEN
    SELECT id INTO v_client_id FROM public.clients WHERE user_id = v_service.user_id AND phone = p_client_phone LIMIT 1;
  END IF;
  IF v_client_id IS NOT NULL THEN
    UPDATE public.clients SET name = p_client_name, email = p_client_email, phone = p_client_phone, updated_at = now() WHERE id = v_client_id;
  ELSE
    INSERT INTO public.clients (user_id, name, email, phone, status) VALUES (v_service.user_id, p_client_name, p_client_email, p_client_phone, 'Ativo') RETURNING id INTO v_client_id;
  END IF;
  INSERT INTO public.appointments (user_id, client_id, service_id, client_name, service_name, appointment_date, appointment_time, duration, price, status, notes)
  VALUES (v_service.user_id, v_client_id, p_service_id, p_client_name, v_service.name, p_appointment_date, p_appointment_time, v_service.duration, v_service.price, 'agendado', p_notes)
  RETURNING id INTO v_appointment_id;
  RETURN v_appointment_id;
END;
$$;

CREATE TRIGGER validate_appointment_trigger BEFORE INSERT OR UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT EXECUTE ON FUNCTION public.get_user_plan(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_feature_access(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.check_appointment_availability(uuid, date, time, integer, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_available_slots(uuid, date, integer, integer) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_public_available_slots(uuid, date) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_public_services() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_public_booking(text, text, text, uuid, date, time, text) TO anon, authenticated, service_role;