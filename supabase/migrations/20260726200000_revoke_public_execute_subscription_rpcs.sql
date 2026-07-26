-- Falha de segurança crítica confirmada na prática (2026-07-26): chamei
-- public.start_subscription() via RPC como usuário autenticado comum e a
-- chamada funcionou, criando/alterando minha própria assinatura, mesmo
-- depois da migration 20260726020000 já ter revogado EXECUTE de
-- "authenticated" nessa função. A causa: toda função nova no Postgres
-- recebe EXECUTE para a role PUBLIC automaticamente (todo mundo,
-- inclusive "anon" e "authenticated" são membros implícitos de PUBLIC) —
-- revogar só de "authenticated" não revoga de PUBLIC, então o acesso
-- continuava aberto pelo caminho implícito.
--
-- Pior: start_subscription e cancel_subscription usam o padrão
--   IF auth.uid() IS NOT NULL AND auth.uid() <> p_user_id THEN RAISE EXCEPTION
-- que existe pra permitir chamadas internas do service_role (cujo
-- auth.uid() é sempre NULL nesse contexto). Combinado com o EXECUTE
-- ainda aberto pra PUBLIC, isso significa que uma chamada TOTALMENTE
-- ANÔNIMA (sem login, sem token — onde auth.uid() também é NULL) passava
-- pela checagem e conseguia criar/alterar/cancelar a assinatura de
-- QUALQUER user_id informado, sem autenticação nenhuma.
--
-- As demais funções sensíveis do app (purchase_client_package,
-- purchase_gift_card, redeem_gift_card, redeem_loyalty_reward,
-- set/clear/verify_team_member_pin, get_or_create_referral_code,
-- set/verify_authorization_password, get_clients_masked,
-- get_client_data_secure, get_professionals_secure) foram conferidas e
-- usam o padrão seguro (`IF auth.uid() IS NULL THEN ... RETURN/EXCEPTION`,
-- derivando o usuário sempre de auth.uid() internamente, nunca confiando
-- num p_user_id de fora) — não estão vulneráveis a esse bypass, mas
-- revogamos PUBLIC delas também por princípio de menor privilégio.

REVOKE EXECUTE ON FUNCTION public.start_subscription(uuid, text, text, text, integer, text, text, text, timestamptz) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cancel_subscription(uuid, text, text, text, boolean) FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION public.purchase_client_package(uuid, uuid, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.purchase_gift_card(uuid, numeric, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.redeem_gift_card(uuid, numeric, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.redeem_loyalty_reward(uuid, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_team_member_pin(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.clear_team_member_pin(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.verify_team_member_pin(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_or_create_referral_code() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_authorization_password(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.verify_authorization_password(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_clients_masked(boolean) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_client_data_secure(uuid, boolean) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_professionals_secure(boolean) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_pending_appointments_for_day(uuid, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_or_create_booking_slug() FROM PUBLIC;

-- Reafirma os grants legítimos (redundante se já existirem, garante que
-- ninguém ficou sem acesso depois do REVOKE FROM PUBLIC acima).
GRANT EXECUTE ON FUNCTION public.start_subscription(uuid, text, text, text, integer, text, text, text, timestamptz) TO service_role;
GRANT EXECUTE ON FUNCTION public.cancel_subscription(uuid, text, text, text, boolean) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.purchase_client_package(uuid, uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.purchase_gift_card(uuid, numeric, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_gift_card(uuid, numeric, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_loyalty_reward(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_team_member_pin(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.clear_team_member_pin(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.verify_team_member_pin(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_or_create_referral_code() TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_authorization_password(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.verify_authorization_password(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_clients_masked(boolean) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_client_data_secure(uuid, boolean) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_professionals_secure(boolean) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.check_pending_appointments_for_day(uuid, integer) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_or_create_booking_slug() TO authenticated;
