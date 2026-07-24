CREATE OR REPLACE FUNCTION public.credit_loyalty_points_on_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ppc numeric;
  v_points integer;
BEGIN
  IF NEW.client_id IS NULL OR NEW.status <> 'pago' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status = 'pago' THEN
    RETURN NEW;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.loyalty_point_transactions
    WHERE reference_id = NEW.id AND source = 'payment' AND kind = 'earn'
  ) THEN
    RETURN NEW;
  END IF;

  SELECT points_per_currency INTO v_ppc FROM public.loyalty_settings WHERE user_id = NEW.user_id;
  v_ppc := COALESCE(v_ppc, 1);
  v_points := floor(NEW.amount * v_ppc);

  IF v_points > 0 THEN
    INSERT INTO public.loyalty_point_transactions
      (user_id, client_id, kind, source, points, description, reference_id)
    VALUES
      (NEW.user_id, NEW.client_id, 'earn', 'payment', v_points, 'Pontos por pagamento confirmado', NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.credit_loyalty_points_on_payment() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.credit_loyalty_points_on_payment() TO service_role;

DROP TRIGGER IF EXISTS trg_credit_loyalty_points ON public.payments;
CREATE TRIGGER trg_credit_loyalty_points
  AFTER INSERT OR UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.credit_loyalty_points_on_payment();

INSERT INTO public.loyalty_point_transactions
  (user_id, client_id, kind, source, points, description, reference_id, created_at)
SELECT
  p.user_id,
  p.client_id,
  'earn',
  'payment',
  floor(p.amount * COALESCE(ls.points_per_currency, 1)),
  'Pontos por pagamento confirmado (backfill)',
  p.id,
  COALESCE(p.payment_date, p.created_at)
FROM public.payments p
LEFT JOIN public.loyalty_settings ls ON ls.user_id = p.user_id
WHERE p.status = 'pago'
  AND p.client_id IS NOT NULL
  AND floor(p.amount * COALESCE(ls.points_per_currency, 1)) > 0
  AND NOT EXISTS (
    SELECT 1 FROM public.loyalty_point_transactions t
    WHERE t.reference_id = p.id AND t.source = 'payment' AND t.kind = 'earn'
  );