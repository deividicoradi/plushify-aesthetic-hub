-- Módulo "Cancelamentos" no admin, ao lado de Suporte: lista TUDO que é
-- cancelamento ou reembolso (mensal e anual, self-service ou processado
-- pelo admin), com nome/telefone/e-mail do cliente pra contato direto e
-- o motivo informado quando existir. Fonte de verdade é user_subscriptions
-- (cobre reembolso total feito pelo admin, cancelamento forçado, e
-- cancelamento self-service do cliente) — o motivo vem de
-- subscription_cancellation_feedback quando o cliente informou.

CREATE OR REPLACE FUNCTION public.admin_list_cancellations_and_refunds()
RETURNS TABLE(
  subscription_id uuid,
  user_id uuid,
  user_email text,
  user_name text,
  user_phone text,
  plan_type text,
  billing_interval text,
  status text,
  cancel_at_period_end boolean,
  plan_amount_paid integer,
  started_at timestamptz,
  expires_at timestamptz,
  updated_at timestamptz,
  reason text,
  comment text,
  feedback_created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;

  RETURN QUERY
  SELECT
    s.id,
    s.user_id,
    u.email::text,
    p.name,
    p.phone,
    s.plan_type::text,
    s.billing_interval,
    s.status,
    s.cancel_at_period_end,
    s.plan_amount_paid,
    s.started_at,
    s.expires_at,
    s.updated_at,
    f.reason,
    f.comment,
    f.created_at
  FROM public.user_subscriptions s
  JOIN auth.users u ON u.id = s.user_id
  LEFT JOIN public.profiles p ON p.id = s.user_id
  LEFT JOIN LATERAL (
    SELECT cf.reason AS reason, cf.comment AS comment, cf.created_at AS created_at
    FROM public.subscription_cancellation_feedback cf
    WHERE cf.subscription_id = s.id
    ORDER BY cf.created_at DESC
    LIMIT 1
  ) f ON true
  WHERE s.status IN ('cancelled', 'refunded', 'disputed')
     OR s.cancel_at_period_end IS TRUE
  ORDER BY COALESCE(f.created_at, s.updated_at) DESC;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_list_cancellations_and_refunds() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_list_cancellations_and_refunds() FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_list_cancellations_and_refunds() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_cancellations_and_refunds() TO service_role;
