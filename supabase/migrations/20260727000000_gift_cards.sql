-- Vale-presente: crédito em R$ vendido pra um cliente, com saldo consumido
-- aos poucos. Escopo v1: só venda + controle de saldo — o abatimento num
-- pagamento futuro é registrado manualmente pelo dono (sem integração com o
-- formulário de pagamento por enquanto).
--
-- NOTA: esta migration é byte-a-byte equivalente (menos comentários) à
-- migration anterior 20260725005011_1afb3a75-...sql, já aplicada em produção
-- primeiro. Reescrita de forma idempotente (IF NOT EXISTS / DO blocks) pra
-- não quebrar se o histórico completo de migrations for reaplicado do zero.

CREATE TABLE IF NOT EXISTS public.client_gift_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  initial_value numeric(10,2) NOT NULL CHECK (initial_value > 0),
  balance numeric(10,2) NOT NULL CHECK (balance >= 0),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','redeemed','cancelled')),
  purchased_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (balance <= initial_value)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_gift_cards TO authenticated;
GRANT ALL ON public.client_gift_cards TO service_role;
ALTER TABLE public.client_gift_cards ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY client_gift_cards_owner ON public.client_gift_cards FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
CREATE INDEX IF NOT EXISTS idx_client_gift_cards_client ON public.client_gift_cards(client_id, status);
DROP TRIGGER IF EXISTS update_client_gift_cards_updated_at ON public.client_gift_cards;
CREATE TRIGGER update_client_gift_cards_updated_at BEFORE UPDATE ON public.client_gift_cards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Ledger imutável de uso (fonte da verdade; balance em client_gift_cards é
-- coluna-cache mantida junto, dentro da mesma function).
CREATE TABLE IF NOT EXISTS public.gift_card_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  client_gift_card_id uuid NOT NULL REFERENCES public.client_gift_cards(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL CHECK (amount > 0),
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gift_card_redemptions TO authenticated;
GRANT ALL ON public.gift_card_redemptions TO service_role;
ALTER TABLE public.gift_card_redemptions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY gift_card_redemptions_owner ON public.gift_card_redemptions FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
CREATE INDEX IF NOT EXISTS idx_gift_card_redemptions_card ON public.gift_card_redemptions(client_gift_card_id);

-- Vínculo com o financeiro: a venda do vale gera um payment normal, mesmo
-- padrão de client_packages.
DO $$ BEGIN
  ALTER TABLE public.payments
    ADD COLUMN client_gift_card_id uuid REFERENCES public.client_gift_cards(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
CREATE INDEX IF NOT EXISTS idx_payments_client_gift_card ON public.payments(client_gift_card_id) WHERE client_gift_card_id IS NOT NULL;

-- Venda atômica (mesmo motivo de purchase_client_package/redeem_loyalty_reward:
-- evita vale gravado sem o payment correspondente, ou vice-versa).
CREATE OR REPLACE FUNCTION public.purchase_gift_card(
  p_client_id uuid,
  p_value numeric,
  p_payment_method_id uuid
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_gift_card_id uuid;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;

  IF p_value IS NULL OR p_value <= 0 THEN
    RAISE EXCEPTION 'Valor do vale deve ser maior que zero';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.clients WHERE id = p_client_id AND user_id = v_user) THEN
    RAISE EXCEPTION 'Cliente não encontrado';
  END IF;

  INSERT INTO public.client_gift_cards (user_id, client_id, initial_value, balance)
  VALUES (v_user, p_client_id, p_value, p_value)
  RETURNING id INTO v_gift_card_id;

  INSERT INTO public.payments (
    user_id, client_id, client_gift_card_id, payment_method_id,
    amount, paid_amount, status, payment_date, description
  ) VALUES (
    v_user, p_client_id, v_gift_card_id, p_payment_method_id,
    p_value, p_value, 'pago', now(), 'Vale-presente'
  );

  RETURN v_gift_card_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.purchase_gift_card(uuid, numeric, uuid) TO authenticated;

-- Registro de uso (débito manual do saldo, sem integração automática com
-- pagamentos nesta v1). Atômico: valida saldo e insere o evento junto.
CREATE OR REPLACE FUNCTION public.redeem_gift_card(
  p_gift_card_id uuid,
  p_amount numeric,
  p_note text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_card public.client_gift_cards%ROWTYPE;
  v_redemption_id uuid;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Valor deve ser maior que zero';
  END IF;

  SELECT * INTO v_card FROM public.client_gift_cards
    WHERE id = p_gift_card_id AND user_id = v_user
    FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Vale-presente não encontrado';
  END IF;

  IF v_card.status <> 'active' THEN
    RAISE EXCEPTION 'Vale-presente não está ativo';
  END IF;

  IF p_amount > v_card.balance THEN
    RAISE EXCEPTION 'Saldo insuficiente no vale-presente';
  END IF;

  INSERT INTO public.gift_card_redemptions (user_id, client_gift_card_id, amount, note)
  VALUES (v_user, p_gift_card_id, p_amount, p_note)
  RETURNING id INTO v_redemption_id;

  UPDATE public.client_gift_cards
  SET balance = balance - p_amount,
      status = CASE WHEN balance - p_amount <= 0 THEN 'redeemed' ELSE status END,
      updated_at = now()
  WHERE id = p_gift_card_id;

  RETURN v_redemption_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.redeem_gift_card(uuid, numeric, text) TO authenticated;
