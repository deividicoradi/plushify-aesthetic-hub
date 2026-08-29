-- Correções da auditoria de segurança de 2026-08-29 (docs/security-audit/):
--
-- F1 (alta): webhook da AbacatePay autentica só por secret estático em query
-- string, sem HMAC do payload — a AbacatePay não expõe a chave pública
-- necessária pra verificar assinatura nesta conta (ver comentário em
-- abacate-webhook/index.ts), então HMAC não é implementável. A mitigação
-- real possível é bloquear replay: registrar o hash de cada payload já
-- processado e rejeitar reentregas idênticas, mesmo vindas com o secret
-- correto (ex: secret capturado e reenviado por um atacante).
--
-- F2 (baixa): has_role(uuid, app_role) aceita _user_id arbitrário — qualquer
-- autenticado pode consultar se outro UUID é admin. Cria has_role_self() que
-- ignora qualquer id e sempre usa auth.uid(), e revoga o EXECUTE da versão
-- com uuid livre de authenticated/anon (RPCs internas e edge functions com
-- client de service_role continuam funcionando sem alteração).

CREATE TABLE public.webhook_processed_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,
  payload_hash TEXT NOT NULL,
  event_type TEXT,
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (source, payload_hash)
);

ALTER TABLE public.webhook_processed_events ENABLE ROW LEVEL SECURITY;
-- Sem policy: acesso só via service_role (edge functions), igual ao padrão
-- já usado em webhook_failures/account_deletion_log neste projeto.
REVOKE ALL ON public.webhook_processed_events FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.webhook_processed_events TO service_role;

CREATE OR REPLACE FUNCTION public.has_role_self(_role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), _role);
$$;

GRANT EXECUTE ON FUNCTION public.has_role_self(public.app_role) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
