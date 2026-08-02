-- Mesmo ajuste já feito em admin_list_customers/admin_get_customer_detail:
-- quando a conta foi excluída (LGPD) depois do cancelamento/reembolso,
-- o e-mail em auth.users vira o placeholder feio
-- (deleted-<uuid>@deleted.plushify.com.br) e o nome vira "Conta excluída"
-- — sem o e-mail original, o admin não tem como contatar esse cliente
-- aqui. Junta account_deletion_log e mostra o e-mail original quando
-- existir, igual já funciona na tela de Clientes.

DROP FUNCTION IF EXISTS public.admin_list_cancellations_and_refunds();

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
  feedback_created_at timestamptz,
  deleted_email_before text,
  deleted_at timestamptz
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
    f.created_at,
    del.email_before,
    del.requested_at
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
  LEFT JOIN LATERAL (
    SELECT dl.email_before AS email_before, dl.requested_at AS requested_at
    FROM public.account_deletion_log dl
    WHERE dl.user_id = s.user_id
    ORDER BY dl.requested_at DESC
    LIMIT 1
  ) del ON true
  WHERE s.status IN ('cancelled', 'refunded', 'disputed')
     OR s.cancel_at_period_end IS TRUE
  ORDER BY COALESCE(f.created_at, s.updated_at) DESC;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_list_cancellations_and_refunds() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_list_cancellations_and_refunds() FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_list_cancellations_and_refunds() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_cancellations_and_refunds() TO service_role;
