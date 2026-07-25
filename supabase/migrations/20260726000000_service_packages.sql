-- Pacotes de Serviços: o dono cadastra um "modelo" (ex: 10x Depilação, R$450,
-- válido 90 dias), vende pra um cliente, e cada sessão é debitada
-- automaticamente quando o agendamento daquele cliente+serviço é concluído
-- (mesmo padrão de trigger já usado em professional_commissions.sql).

-- 1. Modelo de pacote (o que o dono cadastra)
CREATE TABLE public.service_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  name text NOT NULL,
  total_sessions integer NOT NULL CHECK (total_sessions > 0),
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  validity_days integer NOT NULL CHECK (validity_days > 0),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_packages TO authenticated;
GRANT ALL ON public.service_packages TO service_role;
ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY service_packages_owner ON public.service_packages FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX idx_service_packages_service ON public.service_packages(service_id);
CREATE TRIGGER update_service_packages_updated_at BEFORE UPDATE ON public.service_packages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Pacote comprado por um cliente (snapshot dos dados do modelo no momento
-- da compra, pra não quebrar histórico se o modelo mudar/for excluído depois)
CREATE TABLE public.client_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  service_package_id uuid REFERENCES public.service_packages(id) ON DELETE SET NULL,
  package_name text NOT NULL,
  total_sessions integer NOT NULL CHECK (total_sessions > 0),
  sessions_used integer NOT NULL DEFAULT 0 CHECK (sessions_used >= 0),
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  purchased_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','expired','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (sessions_used <= total_sessions)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_packages TO authenticated;
GRANT ALL ON public.client_packages TO service_role;
ALTER TABLE public.client_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY client_packages_owner ON public.client_packages FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX idx_client_packages_client_service_status ON public.client_packages(client_id, service_id, status, expires_at);
CREATE TRIGGER update_client_packages_updated_at BEFORE UPDATE ON public.client_packages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Ledger imutável de consumo de sessão (fonte da verdade; sessions_used em
-- client_packages é só uma coluna-cache mantida junto, no mesmo trigger)
CREATE TABLE public.package_session_usages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  client_package_id uuid NOT NULL REFERENCES public.client_packages(id) ON DELETE CASCADE,
  appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'used' CHECK (status IN ('used','reverted')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (appointment_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.package_session_usages TO authenticated;
GRANT ALL ON public.package_session_usages TO service_role;
ALTER TABLE public.package_session_usages ENABLE ROW LEVEL SECURITY;
CREATE POLICY package_session_usages_owner ON public.package_session_usages FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX idx_package_session_usages_client_package ON public.package_session_usages(client_package_id);
CREATE TRIGGER update_package_session_usages_updated_at BEFORE UPDATE ON public.package_session_usages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Vínculo opcional com o financeiro: a venda do pacote gera um payment
-- normal (reaproveita payment_method_id existente, sem novo tipo de forma de
-- pagamento), pra aparecer nos relatórios de receita.
ALTER TABLE public.payments
  ADD COLUMN client_package_id uuid REFERENCES public.client_packages(id) ON DELETE SET NULL;
CREATE INDEX idx_payments_client_package ON public.payments(client_package_id) WHERE client_package_id IS NOT NULL;

-- 5. Compra do pacote como função atômica (mesmo motivo de redeem_loyalty_reward:
-- evita pacote gravado sem o payment correspondente, ou vice-versa, se uma
-- das duas escritas falhar no meio do fluxo).
CREATE OR REPLACE FUNCTION public.purchase_client_package(
  p_client_id uuid,
  p_service_package_id uuid,
  p_payment_method_id uuid
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_template public.service_packages%ROWTYPE;
  v_client_package_id uuid;
  v_expires_at timestamptz;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;

  SELECT * INTO v_template FROM public.service_packages
    WHERE id = p_service_package_id AND user_id = v_user AND active = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Modelo de pacote não encontrado ou inativo';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.clients WHERE id = p_client_id AND user_id = v_user) THEN
    RAISE EXCEPTION 'Cliente não encontrado';
  END IF;

  v_expires_at := now() + (v_template.validity_days || ' days')::interval;

  INSERT INTO public.client_packages (
    user_id, client_id, service_id, service_package_id, package_name,
    total_sessions, price, expires_at
  ) VALUES (
    v_user, p_client_id, v_template.service_id, v_template.id, v_template.name,
    v_template.total_sessions, v_template.price, v_expires_at
  ) RETURNING id INTO v_client_package_id;

  INSERT INTO public.payments (
    user_id, client_id, client_package_id, payment_method_id,
    amount, paid_amount, status, payment_date, description
  ) VALUES (
    v_user, p_client_id, v_client_package_id, p_payment_method_id,
    v_template.price, v_template.price, 'pago', now(), 'Pacote: ' || v_template.name
  );

  RETURN v_client_package_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.purchase_client_package(uuid, uuid, uuid) TO authenticated;

-- 6. Débito automático de sessão ao concluir o agendamento correspondente.
CREATE OR REPLACE FUNCTION public.debit_package_session_on_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_client_package_id uuid;
BEGIN
  IF NEW.status = 'concluido' AND OLD.status IS DISTINCT FROM 'concluido'
     AND NEW.client_id IS NOT NULL AND NEW.service_id IS NOT NULL THEN

    -- Pacote ativo do cliente pra esse serviço, com saldo, que vence primeiro
    -- (FIFO por expires_at). FOR UPDATE evita corrida entre agendamentos
    -- concorrentes disputando a última sessão.
    SELECT id INTO v_client_package_id
    FROM public.client_packages
    WHERE client_id = NEW.client_id
      AND service_id = NEW.service_id
      AND user_id = NEW.user_id
      AND status = 'active'
      AND expires_at > now()
      AND sessions_used < total_sessions
    ORDER BY expires_at ASC
    LIMIT 1
    FOR UPDATE;

    IF v_client_package_id IS NOT NULL THEN
      INSERT INTO public.package_session_usages (user_id, client_package_id, appointment_id, status)
      VALUES (NEW.user_id, v_client_package_id, NEW.id, 'used')
      ON CONFLICT (appointment_id) DO UPDATE SET
        client_package_id = EXCLUDED.client_package_id,
        status = 'used',
        updated_at = now();

      UPDATE public.client_packages
      SET sessions_used = sessions_used + 1,
          status = CASE WHEN sessions_used + 1 >= total_sessions THEN 'completed' ELSE status END,
          updated_at = now()
      WHERE id = v_client_package_id;
    END IF;
    -- Sem pacote ativo pra esse serviço: não faz nada, segue cobrança avulsa normal.
  END IF;

  IF OLD.status = 'concluido' AND NEW.status <> 'concluido' THEN
    UPDATE public.package_session_usages
    SET status = 'reverted', updated_at = now()
    WHERE appointment_id = NEW.id AND status = 'used'
    RETURNING client_package_id INTO v_client_package_id;

    IF v_client_package_id IS NOT NULL THEN
      UPDATE public.client_packages
      SET sessions_used = GREATEST(sessions_used - 1, 0),
          status = CASE WHEN status = 'completed' THEN 'active' ELSE status END,
          updated_at = now()
      WHERE id = v_client_package_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_debit_package_session
AFTER UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.debit_package_session_on_completion();
