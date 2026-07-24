-- Estende cancel_subscription para também tratar reembolso (checkout.refunded/
-- transparent.refunded) e disputa/chargeback (checkout.disputed/transparent.disputed).

DROP FUNCTION IF EXISTS public.cancel_subscription(uuid, text);

CREATE OR REPLACE FUNCTION public.cancel_subscription(
  p_user_id uuid,
  p_abacate_subscription_id text DEFAULT NULL,
  p_abacate_checkout_id text DEFAULT NULL,
  p_status text DEFAULT 'cancelled'
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  IF p_status NOT IN ('cancelled', 'refunded', 'disputed') THEN
    RAISE EXCEPTION 'status inválido: %', p_status;
  END IF;

  UPDATE public.user_subscriptions
  SET status = p_status,
      cancel_at_period_end = false,
      updated_at = now()
  WHERE user_id = p_user_id
    AND (
      (p_abacate_subscription_id IS NULL AND p_abacate_checkout_id IS NULL)
      OR abacate_subscription_id = p_abacate_subscription_id
      OR abacate_checkout_id = p_abacate_checkout_id
    );

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cancel_subscription(uuid, text, text, text) TO authenticated, service_role;