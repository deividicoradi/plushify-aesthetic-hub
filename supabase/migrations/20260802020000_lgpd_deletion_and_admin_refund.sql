-- Item 4 (LGPD): cliente pede exclusão da própria conta. Anonimiza dados
-- pessoais + desativa login (via edge function com service role, que também
-- mexe em auth.users) — mantém as linhas financeiras/assinatura para
-- obrigação fiscal/legal, só remove a identidade pessoal. Exige assinatura
-- paga já cancelada antes (cancel_at_period_end=true), pra não confundir com
-- reembolso automático nem deixar cobrança pendente órfã.
--
-- Item 5: reembolso de uma assinatura específica pelo admin, direto do
-- checkout da AbacatePay (endpoint POST /v2/checkouts/refund). A chamada real
-- à API acontece na edge function abacate-refund-checkout; esta RPC só grava
-- o resultado (status='refunded', revoga acesso, audita) depois que o
-- estorno na AbacatePay já foi confirmado com sucesso — nunca antes.

CREATE TABLE IF NOT EXISTS public.account_deletion_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email_before text NOT NULL,
  requested_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.account_deletion_log ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.account_deletion_log FROM PUBLIC;
REVOKE ALL ON public.account_deletion_log FROM anon;
GRANT ALL ON public.account_deletion_log TO service_role;

-- Cliente consulta se pode excluir a própria conta agora.
CREATE OR REPLACE FUNCTION public.get_account_deletion_status()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_blocked boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.user_subscriptions
    WHERE user_id = auth.uid()
      AND status = 'active'
      AND plan_type IN ('professional', 'premium')
      AND cancel_at_period_end IS NOT TRUE
  ) INTO v_blocked;

  RETURN jsonb_build_object(
    'can_delete', NOT v_blocked,
    'blocking_reason', CASE WHEN v_blocked
      THEN 'Você tem uma assinatura paga ativa. Cancele-a primeiro (abra um chamado em Suporte) para poder excluir sua conta.'
      ELSE NULL
    END
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_account_deletion_status() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_account_deletion_status() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_account_deletion_status() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_account_deletion_status() TO service_role;

-- Anonimiza os dados pessoais em public.* do próprio usuário (chamada pela
-- edge function delete-account, que depois cuida da parte em auth.users com
-- service role). Reforça a mesma checagem de bloqueio por segurança — nunca
-- confia só na checagem já feita no client/edge function.
CREATE OR REPLACE FUNCTION public.anonymize_account_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_blocked boolean;
  v_email text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.user_subscriptions
    WHERE user_id = auth.uid()
      AND status = 'active'
      AND plan_type IN ('professional', 'premium')
      AND cancel_at_period_end IS NOT TRUE
  ) INTO v_blocked;

  IF v_blocked THEN
    RAISE EXCEPTION 'Cancele sua assinatura paga antes de excluir a conta';
  END IF;

  SELECT email::text INTO v_email FROM auth.users WHERE id = auth.uid();

  UPDATE public.profiles
  SET name = 'Conta excluída', phone = NULL, profession = NULL
  WHERE id = auth.uid();

  INSERT INTO public.account_deletion_log (user_id, email_before)
  VALUES (auth.uid(), COALESCE(v_email, 'desconhecido'));
END;
$$;

REVOKE EXECUTE ON FUNCTION public.anonymize_account_data() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.anonymize_account_data() FROM anon;
GRANT EXECUTE ON FUNCTION public.anonymize_account_data() TO authenticated;
GRANT EXECUTE ON FUNCTION public.anonymize_account_data() TO service_role;

-- admin_get_customer_detail passa a incluir os ids da AbacatePay, necessários
-- pro admin decidir/disparar um reembolso (retorno continua jsonb — não
-- precisa dropar a função antes).
CREATE OR REPLACE FUNCTION public.admin_get_customer_detail(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  v_signed_up_at timestamptz;
  v_subscriptions jsonb;
  v_upgrades jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;

  SELECT u.email::text, u.created_at INTO v_email, v_signed_up_at
  FROM auth.users u WHERE u.id = p_user_id;

  IF v_email IS NULL THEN
    RAISE EXCEPTION 'Cliente não encontrado';
  END IF;

  SELECT COALESCE(jsonb_agg(t ORDER BY t.started_at DESC), '[]'::jsonb) INTO v_subscriptions
  FROM (
    SELECT
      id, plan_type::text, status, billing_interval, payment_kind,
      plan_amount_paid, started_at, expires_at, trial_ends_at,
      cancel_at_period_end, updated_at, abacate_checkout_id, abacate_subscription_id
    FROM public.user_subscriptions
    WHERE user_id = p_user_id
  ) t;

  SELECT COALESCE(jsonb_agg(t ORDER BY t.accepted_at DESC), '[]'::jsonb) INTO v_upgrades
  FROM (
    SELECT
      id, previous_plan_type, previous_billing_interval,
      new_plan_type, new_billing_interval,
      credit_cents, new_price_cents, charge_now_cents, accepted_at
    FROM public.plan_upgrade_consents
    WHERE user_id = p_user_id
  ) t;

  RETURN jsonb_build_object(
    'user_id', p_user_id,
    'email', v_email,
    'signed_up_at', v_signed_up_at,
    'subscriptions', v_subscriptions,
    'upgrades', v_upgrades
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_get_customer_detail(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_get_customer_detail(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_get_customer_detail(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_customer_detail(uuid) TO service_role;

-- Grava o resultado de um reembolso já confirmado na AbacatePay (chamado só
-- pela edge function abacate-refund-checkout, depois do POST /checkouts/refund
-- retornar sucesso). Reaproveita o mesmo efeito de cancel_subscription pra
-- reembolso/disputa: revoga o acesso na hora.
CREATE OR REPLACE FUNCTION public.admin_mark_subscription_refunded(
  p_user_id uuid,
  p_subscription_id uuid,
  p_reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
DECLARE
  v_checkout_id text;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;

  IF NOT public.mfa_satisfied() THEN
    RAISE EXCEPTION 'Reautentique-se com seu código de dois fatores para continuar.';
  END IF;

  SELECT abacate_checkout_id INTO v_checkout_id
  FROM public.user_subscriptions
  WHERE id = p_subscription_id AND user_id = p_user_id;

  IF v_checkout_id IS NULL THEN
    RAISE EXCEPTION 'Assinatura não encontrada ou sem checkout associado';
  END IF;

  UPDATE public.user_subscriptions
  SET status = 'refunded', updated_at = now()
  WHERE id = p_subscription_id AND user_id = p_user_id;

  INSERT INTO public.admin_actions_log (admin_user_id, target_user_id, action, reason, details)
  VALUES (
    auth.uid(), p_user_id, 'refund_subscription', p_reason,
    jsonb_build_object('subscription_id', p_subscription_id, 'abacate_checkout_id', v_checkout_id)
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_mark_subscription_refunded(uuid, uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_mark_subscription_refunded(uuid, uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_mark_subscription_refunded(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_mark_subscription_refunded(uuid, uuid, text) TO service_role;
