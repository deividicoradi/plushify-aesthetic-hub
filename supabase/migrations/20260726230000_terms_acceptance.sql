-- Registro auditável de aceite dos Termos de Uso / Política de Privacidade.
-- O checkbox obrigatório no cadastro (Auth.tsx) hoje só existe no estado
-- do formulário — nada fica gravado provando que o usuário realmente
-- aceitou, em que data/hora, nem qual versão dos Termos estava em vigor
-- naquele momento. Sem isso, não há como comprovar o aceite se um
-- usuário contestar futuramente.

CREATE TABLE IF NOT EXISTS public.terms_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  terms_version text NOT NULL,
  privacy_version text NOT NULL,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS terms_acceptances_user_id_idx ON public.terms_acceptances(user_id);

ALTER TABLE public.terms_acceptances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário vê apenas seu próprio aceite"
  ON public.terms_acceptances FOR SELECT
  USING (auth.uid() = user_id);

-- Sem policy de INSERT/UPDATE/DELETE para authenticated: só o trigger
-- abaixo (SECURITY DEFINER, disparado no cadastro) grava aqui.

-- Captura o aceite enviado no signUp() via options.data (terms_accepted,
-- terms_version, privacy_version) e grava um registro imutável. Mesmo
-- padrão de captura_referral_on_signup(): trigger AFTER INSERT em
-- auth.users, nunca aborta o cadastro em caso de erro.
CREATE OR REPLACE FUNCTION public.capture_terms_acceptance_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_terms_version text;
  v_privacy_version text;
BEGIN
  BEGIN
    IF NEW.raw_user_meta_data->>'terms_accepted' = 'true' THEN
      v_terms_version := COALESCE(NEW.raw_user_meta_data->>'terms_version', 'desconhecida');
      v_privacy_version := COALESCE(NEW.raw_user_meta_data->>'privacy_version', 'desconhecida');

      INSERT INTO public.terms_acceptances (user_id, terms_version, privacy_version, accepted_at)
      VALUES (NEW.id, v_terms_version, v_privacy_version, now());
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Terms acceptance capture: Error for user % - % %', NEW.id, SQLERRM, SQLSTATE;
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_capture_terms ON auth.users;
CREATE TRIGGER on_auth_user_created_capture_terms
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.capture_terms_acceptance_on_signup();
