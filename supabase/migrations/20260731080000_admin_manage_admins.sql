-- Gestão de admins pelo próprio painel: até aqui, promover um admin exigia
-- SQL manual no editor do Supabase (decisão original: o PRIMEIRO admin tem
-- que nascer assim, nunca por código do app, pra fechar qualquer caminho de
-- auto-promoção — ver comentário em 20260728030000_admin_dashboard_foundation.sql).
-- Isso continua valendo pro primeiro admin. Só quem JÁ é admin pode chamar
-- estas funções (mesma regra que as policies de INSERT/DELETE em
-- user_roles já impõem), então promover um SEGUNDO/TERCEIRO admin por aqui
-- não abre nenhum caminho de auto-promoção — é o admin existente decidindo
-- delegar, do mesmo jeito que faria com um INSERT manual.

CREATE OR REPLACE FUNCTION public.admin_list_admins()
RETURNS TABLE(
  user_id uuid,
  email text,
  granted_by_email text,
  granted_at timestamptz
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
  SELECT r.user_id, u.email::text, gb.email::text, r.granted_at
  FROM public.user_roles r
  JOIN auth.users u ON u.id = r.user_id
  LEFT JOIN auth.users gb ON gb.id = r.granted_by
  WHERE r.role = 'admin'
  ORDER BY r.granted_at ASC;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_list_admins() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_list_admins() FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_list_admins() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_admins() TO service_role;

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
