-- "Modo Funcionário": PIN por membro da equipe pra restringir a interface
-- num dispositivo compartilhado, conforme as permissões do cargo
-- (team_members.permissions, coluna que já existia mas nunca era usada).
-- Não é uma fronteira de autenticação real — a sessão continua sendo a do
-- dono da conta (team_members não tem login próprio no sistema) — é um
-- controle de fluxo de trabalho: verifica o PIN e o app esconde/bloqueia
-- telas e ações conforme as permissões daquele cargo.

ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS pin_hash text;

CREATE OR REPLACE FUNCTION public.set_team_member_pin(p_member_id uuid, p_pin text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;
  IF p_pin !~ '^[0-9]{4,6}$' THEN
    RAISE EXCEPTION 'O PIN deve ter de 4 a 6 dígitos numéricos';
  END IF;

  UPDATE public.team_members
    SET pin_hash = extensions.crypt(p_pin, extensions.gen_salt('bf')),
        updated_at = now()
    WHERE id = p_member_id AND user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Membro não encontrado';
  END IF;

  RETURN true;
END;
$$;
GRANT EXECUTE ON FUNCTION public.set_team_member_pin(uuid, text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.clear_team_member_pin(p_member_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;

  UPDATE public.team_members
    SET pin_hash = NULL, updated_at = now()
    WHERE id = p_member_id AND user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Membro não encontrado';
  END IF;

  RETURN true;
END;
$$;
GRANT EXECUTE ON FUNCTION public.clear_team_member_pin(uuid) TO authenticated, service_role;

-- Quem chama essa função ainda é o dono da conta (é ele quem está no
-- dispositivo compartilhado e "entrega" a tela pro funcionário depois de
-- confirmar o PIN) — por isso a checagem de posse é user_id = auth.uid(),
-- igual às outras duas funções acima.
CREATE OR REPLACE FUNCTION public.verify_team_member_pin(p_member_id uuid, p_pin text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
DECLARE v_hash text;
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;

  SELECT pin_hash INTO v_hash FROM public.team_members
    WHERE id = p_member_id AND user_id = auth.uid() AND status = 'active';

  IF v_hash IS NULL THEN RETURN false; END IF;

  RETURN extensions.crypt(p_pin, v_hash) = v_hash;
END;
$$;
GRANT EXECUTE ON FUNCTION public.verify_team_member_pin(uuid, text) TO authenticated, service_role;
