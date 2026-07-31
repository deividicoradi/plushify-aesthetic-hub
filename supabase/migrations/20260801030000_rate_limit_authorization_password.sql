-- Rate limit real em verify_authorization_password. Hoje essa função (a
-- "senha de autorização" que trava ações destrutivas, incluindo cancelar
-- assinatura e revogar admin) podia ser tentada infinitas vezes sem
-- bloqueio — se a sessão de login (JWT) de um admin vazasse, esse segundo
-- fator não segurava um ataque de força bruta. A checagem WHERE
-- user_id = auth.uid() já impede um atacante de tentar a senha de OUTRA
-- pessoa, mas não impede tentar a própria senha do dono da sessão roubada
-- repetidamente.
CREATE TABLE IF NOT EXISTS public.authorization_password_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  success boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auth_pw_attempts_user_time
  ON public.authorization_password_attempts (user_id, created_at DESC);

ALTER TABLE public.authorization_password_attempts ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.authorization_password_attempts FROM PUBLIC;
REVOKE ALL ON public.authorization_password_attempts FROM anon;

-- Só o próprio usuário vê seu histórico de tentativas (nada sensível, só
-- timestamps/success), e só a função abaixo (SECURITY DEFINER) escreve.
DROP POLICY IF EXISTS "Usuário vê suas próprias tentativas" ON public.authorization_password_attempts;
CREATE POLICY "Usuário vê suas próprias tentativas"
  ON public.authorization_password_attempts FOR SELECT TO authenticated
  USING (user_id = auth.uid());

GRANT SELECT ON public.authorization_password_attempts TO authenticated;
GRANT ALL ON public.authorization_password_attempts TO service_role;

-- Mesma assinatura (text) -> boolean, então CREATE OR REPLACE preserva os
-- grants já existentes (authenticated, service_role) — reafirmados abaixo
-- por segurança de qualquer forma.
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
