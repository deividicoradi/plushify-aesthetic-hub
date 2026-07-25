-- Falha de segurança real: start_subscription estava com GRANT EXECUTE
-- liberado pra "authenticated" além de "service_role". A função é
-- SECURITY DEFINER e só checa `auth.uid() = p_user_id` — ou seja, qualquer
-- usuário logado podia chamar essa RPC direto do navegador (via
-- supabase.rpc('start_subscription', {...})) e se auto-promover a
-- Professional/Premium de graça, com p_current_period_end arbitrário,
-- sem passar pelo checkout nem pagar nada. Confirmado na prática durante
-- teste de limites de plano em 2026-07-25.
--
-- A única chamadora legítima hoje (supabase/functions/start-trial) já usa
-- o client de service_role internamente, não o client autenticado do
-- usuário — então revogar "authenticated" não quebra nada em produção.

REVOKE EXECUTE ON FUNCTION public.start_subscription(uuid, text, text, text, integer, text, text, text, timestamptz) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.start_subscription(uuid, text, text, text, integer, text, text, text, timestamptz) TO service_role;
