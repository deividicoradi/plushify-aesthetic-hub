-- newsletter_subscribers aceitava INSERT direto de `anon` via PostgREST,
-- sem nenhum rate limit (diferente do fluxo de agendamento público, que já
-- foi endurecido) e com um oráculo trivial de existência de e-mail: tentar
-- inserir um e-mail já cadastrado retorna erro de constraint única,
-- revelando que aquele e-mail já está na lista.
--
-- Fix: mesma tabela public_rate_limits/check_public_rate_limit já criada
-- pro agendamento público, e a inscrição passa a ser feita só via esta RPC
-- (SECURITY DEFINER), que sempre retorna sucesso mesmo se o e-mail já
-- existir (ON CONFLICT DO NOTHING) — remove o oráculo por completo, não só
-- no cliente (já era tratado como sucesso lá) mas na própria API.

CREATE OR REPLACE FUNCTION public.subscribe_to_newsletter(p_name text, p_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF p_email IS NULL OR p_email = '' THEN
    RAISE EXCEPTION 'E-mail é obrigatório';
  END IF;

  -- 5 tentativas a cada 15 minutos por e-mail: generoso pro fluxo normal
  -- (um clique duplicado, tentar de novo depois de um erro de rede), mas
  -- barra tentativas repetidas de martelar o mesmo endereço.
  IF NOT public.check_public_rate_limit('email:' || lower(p_email), 'subscribe_to_newsletter', 5, 15) THEN
    RAISE EXCEPTION 'Muitas tentativas, tente novamente em alguns minutos';
  END IF;

  INSERT INTO public.newsletter_subscribers (name, email)
  VALUES (p_name, p_email)
  ON CONFLICT (lower(email)) DO NOTHING;
END;
$$;

GRANT EXECUTE ON FUNCTION public.subscribe_to_newsletter(text, text) TO anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.subscribe_to_newsletter(text, text) FROM PUBLIC;

-- A tabela em si não precisa mais de INSERT direto por anon/authenticated
-- agora que a RPC cobre o fluxo; mantém só a policy/grant pro service_role.
DROP POLICY IF EXISTS "anyone can subscribe" ON public.newsletter_subscribers;
REVOKE INSERT ON public.newsletter_subscribers FROM anon, authenticated;
