-- Mesmo ajuste já feito em admin_list_customers, admin_get_customer_detail
-- e admin_list_cancellations_and_refunds: contas excluídas (LGPD) mostram
-- o placeholder anônimo (deleted-<uuid>@deleted.plushify.com.br) em vez
-- do e-mail real, também na Auditoria de upgrades. Muda tipo de retorno
-- (nova coluna) — precisa dropar antes de recriar.

DROP FUNCTION IF EXISTS public.admin_list_upgrade_consents(integer, integer);

CREATE OR REPLACE FUNCTION public.admin_list_upgrade_consents(
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  email text,
  previous_plan_type text,
  new_plan_type text,
  credit_cents integer,
  new_price_cents integer,
  charge_now_cents integer,
  accepted_at timestamptz,
  total_count bigint,
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
    c.id,
    u.email::text,
    c.previous_plan_type,
    c.new_plan_type,
    c.credit_cents,
    c.new_price_cents,
    c.charge_now_cents,
    c.accepted_at,
    count(*) OVER ()::bigint AS total_count,
    del.email_before,
    del.requested_at
  FROM public.plan_upgrade_consents c
  JOIN auth.users u ON u.id = c.user_id
  LEFT JOIN LATERAL (
    SELECT dl.email_before AS email_before, dl.requested_at AS requested_at
    FROM public.account_deletion_log dl
    WHERE dl.user_id = c.user_id
    ORDER BY dl.requested_at DESC
    LIMIT 1
  ) del ON true
  ORDER BY c.accepted_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_list_upgrade_consents(integer, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_list_upgrade_consents(integer, integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_list_upgrade_consents(integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_upgrade_consents(integer, integer) TO service_role;

-- Mesmo problema no log de ações administrativas (mesma aba "Auditoria"):
-- target_email mostra o placeholder quando o cliente-alvo da ação (ex:
-- reembolso, cancelamento forçado) já excluiu a conta depois.
DROP FUNCTION IF EXISTS public.admin_list_actions_log(integer, integer);

CREATE OR REPLACE FUNCTION public.admin_list_actions_log(
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  admin_email text,
  target_email text,
  action text,
  reason text,
  details jsonb,
  created_at timestamptz,
  total_count bigint,
  target_deleted_email_before text,
  target_deleted_at timestamptz
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
    l.id,
    au.email::text,
    tu.email::text,
    l.action,
    l.reason,
    l.details,
    l.created_at,
    count(*) OVER ()::bigint AS total_count,
    del.email_before,
    del.requested_at
  FROM public.admin_actions_log l
  JOIN auth.users au ON au.id = l.admin_user_id
  JOIN auth.users tu ON tu.id = l.target_user_id
  LEFT JOIN LATERAL (
    SELECT dl.email_before AS email_before, dl.requested_at AS requested_at
    FROM public.account_deletion_log dl
    WHERE dl.user_id = l.target_user_id
    ORDER BY dl.requested_at DESC
    LIMIT 1
  ) del ON true
  ORDER BY l.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_list_actions_log(integer, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_list_actions_log(integer, integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_list_actions_log(integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_actions_log(integer, integer) TO service_role;
