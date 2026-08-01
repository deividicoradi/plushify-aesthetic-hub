-- Achado da auditoria de 2FA: o desafio de segundo fator (MfaGate.tsx) só
-- bloqueia a RENDERIZAÇÃO das rotas no React. A sessão aal1 emitida assim
-- que a senha é aceita já é uma sessão válida pro Supabase — nenhuma RLS
-- policy ou função daqui checava o nível de garantia (aal), então um token
-- aal1 roubado/vazado (antes do usuário completar o desafio TOTP) bastava
-- pra ler/escrever dados via API direta, contornando completamente o app
-- React e o 2FA. Esta migration fecha essa lacuna em duas frentes:
--
-- 1) public.mfa_satisfied(): só EXIGE aal2 de quem TEM um fator TOTP
--    verificado. Quem nunca ativou 2FA não é afetado em nada.
-- 2) Uma policy RESTRICTIVE genérica em toda tabela com RLS habilitado no
--    schema public, aplicada dinamicamente (sem precisar tocar policy por
--    policy) — fecha o acesso direto via PostgREST/API pra quem tem 2FA
--    ativo mas está numa sessão aal1.
-- 3) As funções SECURITY DEFINER mais sensíveis (promover/revogar admin,
--    cancelar assinatura à força, estender trial, verificar senha de
--    autorização) ganham a mesma checagem explícita — SECURITY DEFINER
--    roda como dono da função e por isso NÃO é coberto pela RLS do item 2.

CREATE OR REPLACE FUNCTION public.mfa_satisfied()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
DECLARE
  v_has_verified_factor boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN true; -- não autenticado: não é papel desta função decidir isso
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM auth.mfa_factors
    WHERE user_id = auth.uid() AND status = 'verified'
  ) INTO v_has_verified_factor;

  IF NOT v_has_verified_factor THEN
    RETURN true; -- usuário nunca ativou 2FA, nada a exigir
  END IF;

  RETURN (auth.jwt() ->> 'aal') = 'aal2';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.mfa_satisfied() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.mfa_satisfied() FROM anon;
GRANT EXECUTE ON FUNCTION public.mfa_satisfied() TO authenticated;
GRANT EXECUTE ON FUNCTION public.mfa_satisfied() TO service_role;

-- Policy RESTRICTIVE em toda tabela do schema public com RLS habilitado.
-- RESTRICTIVE combina com AND sobre as policies PERMISSIVE já existentes —
-- ou seja, não abre acesso nenhum novo, só pode fechar. Reaplica em toda
-- execução da migration (idempotente) e cobre tabelas futuras não, só as
-- que já existem no momento em que ela roda.
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname = 'public' AND rowsecurity = true
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "mfa_required" ON %I.%I', r.schemaname, r.tablename);
    EXECUTE format(
      'CREATE POLICY "mfa_required" ON %I.%I AS RESTRICTIVE FOR ALL TO authenticated USING (public.mfa_satisfied()) WITH CHECK (public.mfa_satisfied())',
      r.schemaname, r.tablename
    );
  END LOOP;
END;
$$;

-- Reforço explícito nas funções SECURITY DEFINER mais sensíveis (bypassam a
-- RLS do bloco acima por rodarem como dono, então precisam da checagem
-- direta). Mesma assinatura de antes em todas — CREATE OR REPLACE preserva
-- os grants, reafirmados abaixo por segurança de qualquer forma.

CREATE OR REPLACE FUNCTION public.admin_promote_to_admin(p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_target_id uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;

  IF NOT public.mfa_satisfied() THEN
    RAISE EXCEPTION 'Reautentique-se com seu código de dois fatores para continuar.';
  END IF;

  SELECT id INTO v_target_id FROM auth.users WHERE email = p_email;

  IF v_target_id IS NULL THEN
    RAISE EXCEPTION 'Nenhum usuário encontrado com esse e-mail';
  END IF;

  IF public.has_role(v_target_id, 'admin') THEN
    RAISE EXCEPTION 'Este usuário já é administrador';
  END IF;

  INSERT INTO public.user_roles (user_id, role, granted_by)
  VALUES (v_target_id, 'admin', auth.uid());

  INSERT INTO public.admin_actions_log (admin_user_id, target_user_id, action, reason, details)
  VALUES (auth.uid(), v_target_id, 'promote_admin', NULL, jsonb_build_object('email', p_email));

  RETURN jsonb_build_object('user_id', v_target_id, 'email', p_email);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_promote_to_admin(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_promote_to_admin(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_promote_to_admin(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_promote_to_admin(text) TO service_role;

CREATE OR REPLACE FUNCTION public.admin_revoke_admin(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_count integer;
  v_target_email text;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;

  IF NOT public.mfa_satisfied() THEN
    RAISE EXCEPTION 'Reautentique-se com seu código de dois fatores para continuar.';
  END IF;

  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Você não pode revogar seu próprio acesso de administrador';
  END IF;

  SELECT count(*) INTO v_admin_count FROM public.user_roles WHERE role = 'admin';
  IF v_admin_count <= 1 THEN
    RAISE EXCEPTION 'Não é possível remover o último administrador';
  END IF;

  SELECT email::text INTO v_target_email FROM auth.users WHERE id = p_user_id;

  DELETE FROM public.user_roles WHERE user_id = p_user_id AND role = 'admin';

  INSERT INTO public.admin_actions_log (admin_user_id, target_user_id, action, reason, details)
  VALUES (auth.uid(), p_user_id, 'revoke_admin', NULL, jsonb_build_object('email', v_target_email));

  RETURN jsonb_build_object('user_id', p_user_id);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_revoke_admin(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_revoke_admin(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_revoke_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_revoke_admin(uuid) TO service_role;

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

  IF NOT public.mfa_satisfied() THEN
    RAISE EXCEPTION 'Reautentique-se com seu código de dois fatores para continuar.';
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

  IF NOT public.mfa_satisfied() THEN
    RAISE EXCEPTION 'Reautentique-se com seu código de dois fatores para continuar.';
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

-- Senha de autorização: mesma lógica, agora também exige aal2 pra quem tem
-- 2FA ativo (além do rate limit já existente contra força bruta na senha).
CREATE OR REPLACE FUNCTION public.verify_authorization_password(p_password text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
DECLARE
  v_hash text;
  v_recent_failures integer;
  v_is_valid boolean;
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;

  IF NOT public.mfa_satisfied() THEN
    RAISE EXCEPTION 'Reautentique-se com seu código de dois fatores para continuar.';
  END IF;

  SELECT count(*) INTO v_recent_failures
  FROM public.authorization_password_attempts
  WHERE user_id = auth.uid()
    AND success = false
    AND created_at > now() - interval '15 minutes';

  IF v_recent_failures >= 5 THEN
    RAISE EXCEPTION 'Muitas tentativas incorretas. Aguarde 15 minutos e tente novamente.';
  END IF;

  SELECT password_hash INTO v_hash FROM public.authorization_passwords WHERE user_id = auth.uid();
  IF v_hash IS NULL THEN RAISE EXCEPTION 'Authorization password not configured'; END IF;

  v_is_valid := (extensions.crypt(p_password, v_hash) = v_hash);

  INSERT INTO public.authorization_password_attempts (user_id, success)
  VALUES (auth.uid(), v_is_valid);

  RETURN v_is_valid;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.verify_authorization_password(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.verify_authorization_password(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.verify_authorization_password(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_authorization_password(text) TO service_role;
