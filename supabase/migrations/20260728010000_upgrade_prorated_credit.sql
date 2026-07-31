-- Suporte a upgrade de plano anual/mensal com crédito proporcional (pró-rata),
-- alinhado ao CDC (art. 6º, V — vedação a desvantagem excessiva) e à prática
-- de mercado de SaaS: hoje start_subscription apenas SOBRESCREVE a assinatura
-- anterior sem nenhum cálculo de crédito, cobrando o valor cheio do novo
-- plano e descartando o saldo não usado do anterior — risco real de
-- contestação de cobrança (chargeback) e reclamação via Procon.
--
-- plan_amount_paid guarda o preço de TABELA (catálogo fixo) do plano/ciclo
-- ativo, não o valor realmente cobrado na transação (que pode já incluir um
-- desconto de upgrade anterior) — assim, se o cliente fizer upgrade de novo,
-- o crédito é sempre calculado sobre o valor "cheio" do plano atual, evitando
-- desconto sobre desconto.

ALTER TABLE public.user_subscriptions
  ADD COLUMN IF NOT EXISTS plan_amount_paid integer;

COMMENT ON COLUMN public.user_subscriptions.plan_amount_paid IS
  'Preço de catálogo (em centavos) do plano/ciclo ativo — usado para calcular crédito proporcional em upgrades, não o valor real cobrado na transação.';

-- billing_interval é coluna antiga (era Stripe) que a versão anterior de
-- start_subscription nunca preenchia — toda assinatura paga ativa hoje
-- (antes desta migração) está com billing_interval NULL. Sem isso,
-- calculate_upgrade_quote bloquearia upgrade de QUALQUER cliente já pago
-- (NULL IS DISTINCT FROM 'year'/'month' é sempre verdadeiro), até a próxima
-- renovação. Inferimos pela duração real do período contratado.
UPDATE public.user_subscriptions
SET billing_interval = CASE WHEN expires_at - started_at > interval '60 days' THEN 'year' ELSE 'month' END
WHERE billing_interval IS NULL
  AND plan_type IN ('professional', 'premium')
  AND status = 'active'
  AND expires_at IS NOT NULL;

-- Backfill best-effort das assinaturas pagas já existentes, usando o catálogo
-- atual e o billing_interval recém-inferido acima.
UPDATE public.user_subscriptions
SET plan_amount_paid = CASE
  WHEN plan_type = 'professional' AND COALESCE(billing_interval, CASE WHEN expires_at - started_at > interval '60 days' THEN 'year' ELSE 'month' END) = 'year' THEN 89000
  WHEN plan_type = 'professional' THEN 8900
  WHEN plan_type = 'premium' AND COALESCE(billing_interval, CASE WHEN expires_at - started_at > interval '60 days' THEN 'year' ELSE 'month' END) = 'year' THEN 179000
  WHEN plan_type = 'premium' THEN 17900
  ELSE NULL
END
WHERE plan_amount_paid IS NULL
  AND plan_type IN ('professional', 'premium')
  AND status = 'active';

-- CREATE OR REPLACE com uma lista de parâmetros diferente cria um NOVO
-- overload no Postgres, sem substituir o antigo — removemos a versão de
-- 9 parâmetros explicitamente pra não deixar duas versões da função
-- coexistindo (uma delas nunca mais chamada, mas ainda executável).
DROP FUNCTION IF EXISTS public.start_subscription(uuid, text, text, text, integer, text, text, text, timestamptz);

-- Recria start_subscription aceitando o preço de catálogo do plano sendo
-- ativado — chamado por abacate-webhook a partir de agora.
CREATE OR REPLACE FUNCTION public.start_subscription(
  p_user_id uuid,
  p_plan_code text,
  p_payment_kind text DEFAULT 'recurring_card',
  p_billing_interval text DEFAULT 'month',
  p_trial_days integer DEFAULT 0,
  p_abacate_subscription_id text DEFAULT NULL,
  p_abacate_customer_id text DEFAULT NULL,
  p_abacate_checkout_id text DEFAULT NULL,
  p_current_period_end timestamptz DEFAULT NULL,
  p_plan_amount_paid integer DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_trial_ends timestamptz;
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  IF p_payment_kind NOT IN ('recurring_card','pix','installments','trial') THEN
    RAISE EXCEPTION 'payment_kind inválido: %', p_payment_kind;
  END IF;

  v_trial_ends := CASE
    WHEN p_trial_days > 0 THEN now() + (p_trial_days || ' days')::interval
    ELSE NULL
  END;

  INSERT INTO public.user_subscriptions (
    user_id, plan_type, status, started_at, expires_at, trial_ends_at,
    abacate_subscription_id, abacate_customer_id, abacate_checkout_id,
    payment_kind, cancel_at_period_end, billing_interval, plan_amount_paid
  )
  VALUES (
    p_user_id,
    p_plan_code::public.plan_type,
    'active',
    now(),
    p_current_period_end,
    v_trial_ends,
    p_abacate_subscription_id,
    p_abacate_customer_id,
    p_abacate_checkout_id,
    p_payment_kind,
    false,
    p_billing_interval,
    p_plan_amount_paid
  )
  ON CONFLICT (user_id) DO UPDATE SET
    plan_type               = EXCLUDED.plan_type,
    status                  = EXCLUDED.status,
    started_at              = now(),
    expires_at              = EXCLUDED.expires_at,
    trial_ends_at           = EXCLUDED.trial_ends_at,
    abacate_subscription_id = COALESCE(EXCLUDED.abacate_subscription_id, public.user_subscriptions.abacate_subscription_id),
    abacate_customer_id     = COALESCE(EXCLUDED.abacate_customer_id, public.user_subscriptions.abacate_customer_id),
    abacate_checkout_id     = COALESCE(EXCLUDED.abacate_checkout_id, public.user_subscriptions.abacate_checkout_id),
    payment_kind            = EXCLUDED.payment_kind,
    cancel_at_period_end    = false,
    billing_interval        = EXCLUDED.billing_interval,
    plan_amount_paid        = COALESCE(EXCLUDED.plan_amount_paid, public.user_subscriptions.plan_amount_paid),
    updated_at              = now()
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- Calcula o crédito proporcional (dias não usados do plano atual, sobre o
-- preço de catálogo) e o valor a cobrar hoje pelo novo plano. Só permite
-- UPGRADE (novo preço de catálogo > preço do plano atual) no MESMO ciclo de
-- cobrança (anual->anual, mensal->mensal) — trocar de ciclo ou fazer
-- downgrade fica fora deste RPC por ora (tratamento futuro, sem multa
-- ilegal de "cancelamento" aplicada aqui: diferente de cancelar o serviço,
-- upgrade é o cliente continuar cliente, então nenhuma multa é cobrada
-- sobre o crédito, ao contrário da cláusula de cancelamento dos Termos).
CREATE OR REPLACE FUNCTION public.calculate_upgrade_quote(
  p_user_id uuid,
  p_new_plan_type text,
  p_new_billing_interval text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sub RECORD;
  v_current_price integer;
  v_new_price integer;
  v_remaining_days numeric;
  v_cycle_days numeric;
  v_credit integer;
  v_charge_now integer;
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  IF p_new_billing_interval NOT IN ('month', 'year') THEN
    RAISE EXCEPTION 'billing_interval inválido: %', p_new_billing_interval;
  END IF;

  SELECT * INTO v_sub FROM public.user_subscriptions WHERE user_id = p_user_id;

  IF v_sub IS NULL OR v_sub.status <> 'active' OR v_sub.plan_type NOT IN ('professional', 'premium') THEN
    RAISE EXCEPTION 'Nenhuma assinatura paga ativa encontrada para calcular upgrade';
  END IF;

  IF v_sub.billing_interval IS DISTINCT FROM p_new_billing_interval THEN
    RAISE EXCEPTION 'Troca de ciclo de cobrança (mensal/anual) não suportada neste fluxo';
  END IF;

  v_current_price := CASE
    WHEN v_sub.plan_type = 'professional' AND v_sub.billing_interval = 'year' THEN 89000
    WHEN v_sub.plan_type = 'professional' THEN 8900
    WHEN v_sub.plan_type = 'premium' AND v_sub.billing_interval = 'year' THEN 179000
    WHEN v_sub.plan_type = 'premium' THEN 17900
  END;

  v_new_price := CASE
    WHEN p_new_plan_type = 'professional' AND p_new_billing_interval = 'year' THEN 89000
    WHEN p_new_plan_type = 'professional' THEN 8900
    WHEN p_new_plan_type = 'premium' AND p_new_billing_interval = 'year' THEN 179000
    WHEN p_new_plan_type = 'premium' THEN 17900
    ELSE NULL
  END;

  IF v_new_price IS NULL THEN
    RAISE EXCEPTION 'Plano/ciclo inválido: %/%', p_new_plan_type, p_new_billing_interval;
  END IF;

  IF v_new_price <= COALESCE(v_sub.plan_amount_paid, v_current_price) THEN
    RAISE EXCEPTION 'Este RPC só trata upgrade (plano de valor maior). Para downgrade, use outro fluxo.';
  END IF;

  v_cycle_days := CASE WHEN v_sub.billing_interval = 'year' THEN 365 ELSE 30 END;
  v_remaining_days := GREATEST(0, EXTRACT(EPOCH FROM (v_sub.expires_at - now())) / 86400);
  v_remaining_days := LEAST(v_remaining_days, v_cycle_days);

  v_credit := ROUND(COALESCE(v_sub.plan_amount_paid, v_current_price) * v_remaining_days / v_cycle_days);
  v_charge_now := GREATEST(0, v_new_price - v_credit);

  RETURN jsonb_build_object(
    'current_plan_type', v_sub.plan_type,
    'current_billing_interval', v_sub.billing_interval,
    'current_expires_at', v_sub.expires_at,
    'remaining_days', FLOOR(v_remaining_days),
    'credit_cents', v_credit,
    'new_plan_type', p_new_plan_type,
    'new_billing_interval', p_new_billing_interval,
    'new_price_cents', v_new_price,
    'charge_now_cents', v_charge_now
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.calculate_upgrade_quote(uuid, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.calculate_upgrade_quote(uuid, text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.calculate_upgrade_quote(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_upgrade_quote(uuid, text, text) TO service_role;

-- IMPORTANTE: start_subscription mudou de assinatura (novo parâmetro
-- p_plan_amount_paid) — no Postgres, isso cria um objeto de função NOVO,
-- que volta a ter os grants padrão (histórico real: incidente de
-- 2026-07-26 em que start_subscription ficou executável por `anon` por
-- causa exatamente disso). Repetimos aqui a mesma revogação explícita,
-- sem esperar por outra migration de correção.
REVOKE EXECUTE ON FUNCTION public.start_subscription(uuid, text, text, text, integer, text, text, text, timestamptz, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.start_subscription(uuid, text, text, text, integer, text, text, text, timestamptz, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.start_subscription(uuid, text, text, text, integer, text, text, text, timestamptz, integer) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.start_subscription(uuid, text, text, text, integer, text, text, text, timestamptz, integer) TO service_role;
