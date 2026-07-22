-- RPC para rebaixar o usuário quando a assinatura é cancelada (webhook
-- subscription.cancelled da AbacatePay, disparado após esgotar as
-- tentativas de cobrança ou cancelamento explícito).
--
-- get_user_plan() já ignora qualquer linha com status <> 'active' e cai
-- para 'trial' automaticamente (COALESCE), então só precisamos marcar o
-- status como 'cancelled' — não é necessário alterar plan_type.

CREATE OR REPLACE FUNCTION public.cancel_subscription(
  p_user_id uuid,
  p_abacate_subscription_id text DEFAULT NULL
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  -- Só o próprio usuário ou service_role pode chamar.
  IF auth.uid() IS NOT NULL AND auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  -- Se veio um abacate_subscription_id, só cancela se bater com o registro
  -- atual — evita que um evento de cancelamento atrasado/duplicado cancele
  -- uma assinatura mais nova (ex: usuário cancelou e assinou de novo antes
  -- do webhook antigo chegar).
  UPDATE public.user_subscriptions
  SET status = 'cancelled',
      cancel_at_period_end = false,
      updated_at = now()
  WHERE user_id = p_user_id
    AND (
      p_abacate_subscription_id IS NULL
      OR abacate_subscription_id = p_abacate_subscription_id
    );

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cancel_subscription(uuid, text) TO authenticated, service_role;
