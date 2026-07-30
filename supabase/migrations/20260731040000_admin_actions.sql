-- Ações administrativas diretas (estender trial, forçar cancelamento),
-- cada uma logada em admin_actions_log (quem, quando, em quem, por quê) —
-- sem isso, toda correção manual até agora só existia como SQL avulso que eu
-- rodava fora de qualquer trilha de auditoria.
CREATE TABLE IF NOT EXISTS public.admin_actions_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL REFERENCES auth.users(id),
  target_user_id uuid NOT NULL REFERENCES auth.users(id),
  action text NOT NULL,
  reason text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_actions_log ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.admin_actions_log FROM PUBLIC;
REVOKE ALL ON public.admin_actions_log FROM anon;

DROP POLICY IF EXISTS "Admin vê o log de ações admin" ON public.admin_actions_log;
CREATE POLICY "Admin vê o log de ações admin"
  ON public.admin_actions_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- INSERT só acontece de dentro das funções SECURITY DEFINER abaixo (rodam
-- como owner, ignoram RLS) — authenticated não tem INSERT direto na tabela.
GRANT SELECT ON public.admin_actions_log TO authenticated;
GRANT ALL ON public.admin_actions_log TO service_role;

-- Estende o trial de um cliente em N dias. Só age em assinatura com
-- status='trial_active' (não "inventa" trial pra quem já é pago/cancelado).
CREATE OR REPLACE FUNCTION public.admin_extend_trial(
  p_user_id uuid,
  p_days integer,
  p_reason text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sub_id uuid;
  v_new_trial_ends timestamptz;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;

  IF p_days IS NULL OR p_days <= 0 OR p_days > 90 THEN
    RAISE EXCEPTION 'Quantidade de dias inválida (1 a 90)';
  END IF;

  SELECT id, trial_ends_at INTO v_sub_id, v_new_trial_ends
  FROM public.user_subscriptions
  WHERE user_id = p_user_id AND status = 'trial_active'
  ORDER BY started_at DESC
  LIMIT 1;

  IF v_sub_id IS NULL THEN
    RAISE EXCEPTION 'Cliente não tem trial ativo';
  END IF;

  v_new_trial_ends := GREATEST(COALESCE(v_new_trial_ends, now()), now()) + (p_days || ' days')::interval;

  UPDATE public.user_subscriptions
  SET trial_ends_at = v_new_trial_ends, expires_at = v_new_trial_ends, updated_at = now()
  WHERE id = v_sub_id;

  INSERT INTO public.admin_actions_log (admin_user_id, target_user_id, action, reason, details)
  VALUES (auth.uid(), p_user_id, 'extend_trial', p_reason,
    jsonb_build_object('subscription_id', v_sub_id, 'days', p_days, 'new_trial_ends_at', v_new_trial_ends));

  RETURN jsonb_build_object('subscription_id', v_sub_id, 'new_trial_ends_at', v_new_trial_ends);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_extend_trial(uuid, integer, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_extend_trial(uuid, integer, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_extend_trial(uuid, integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_extend_trial(uuid, integer, text) TO service_role;

-- Cancela imediatamente a assinatura ativa (paga ou trial) de um cliente.
-- Não mexe em cobrança/reembolso na AbacatePay (isso é decisão à parte,
-- fora do escopo desta função) — só encerra o acesso no nosso sistema.
CREATE OR REPLACE FUNCTION public.admin_force_cancel_subscription(
  p_user_id uuid,
  p_reason text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sub_id uuid;
  v_plan_type text;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;

  IF p_reason IS NULL OR btrim(p_reason) = '' THEN
    RAISE EXCEPTION 'Motivo é obrigatório para cancelamento forçado';
  END IF;

  SELECT id, plan_type::text INTO v_sub_id, v_plan_type
  FROM public.user_subscriptions
  WHERE user_id = p_user_id AND status IN ('active', 'trial_active')
  ORDER BY started_at DESC
  LIMIT 1;

  IF v_sub_id IS NULL THEN
    RAISE EXCEPTION 'Cliente não tem assinatura ativa';
  END IF;

  UPDATE public.user_subscriptions
  SET status = 'cancelled', cancel_at_period_end = false, updated_at = now()
  WHERE id = v_sub_id;

  INSERT INTO public.admin_actions_log (admin_user_id, target_user_id, action, reason, details)
  VALUES (auth.uid(), p_user_id, 'force_cancel', p_reason,
    jsonb_build_object('subscription_id', v_sub_id, 'plan_type', v_plan_type));

  RETURN jsonb_build_object('subscription_id', v_sub_id);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_force_cancel_subscription(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_force_cancel_subscription(uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_force_cancel_subscription(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_force_cancel_subscription(uuid, text) TO service_role;

-- Lista as últimas ações administrativas pra auditoria própria do painel.
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
  total_count bigint
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
    count(*) OVER ()::bigint AS total_count
  FROM public.admin_actions_log l
  JOIN auth.users au ON au.id = l.admin_user_id
  JOIN auth.users tu ON tu.id = l.target_user_id
  ORDER BY l.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_list_actions_log(integer, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_list_actions_log(integer, integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_list_actions_log(integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_actions_log(integer, integer) TO service_role;
