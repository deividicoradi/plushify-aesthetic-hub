-- CDC Art. 49 (direito de arrependimento): o cliente tem reembolso integral
-- garantido dentro de 7 dias corridos da contratação. Passado esse prazo,
-- não existe mais esse direito automático — reembolso deixa de ser algo
-- que "o cliente pode pedir quando quiser" e volta a ser critério do
-- negócio (ou obrigatório só em caso de vício do serviço, o que é tratado
-- caso a caso, fora deste botão). Trava aqui na função (não só na tela)
-- pra não depender só do frontend não deixar clicar.

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
  v_started_at timestamptz;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;

  IF NOT public.mfa_satisfied() THEN
    RAISE EXCEPTION 'Reautentique-se com seu código de dois fatores para continuar.';
  END IF;

  SELECT abacate_checkout_id, started_at INTO v_checkout_id, v_started_at
  FROM public.user_subscriptions
  WHERE id = p_subscription_id AND user_id = p_user_id;

  IF v_checkout_id IS NULL THEN
    RAISE EXCEPTION 'Assinatura não encontrada ou sem checkout associado';
  END IF;

  IF v_started_at IS NULL OR now() > v_started_at + interval '7 days' THEN
    RAISE EXCEPTION 'Prazo legal de arrependimento (7 dias, Art. 49 do CDC) já passou — essa assinatura não pode mais ser reembolsada por este botão';
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
