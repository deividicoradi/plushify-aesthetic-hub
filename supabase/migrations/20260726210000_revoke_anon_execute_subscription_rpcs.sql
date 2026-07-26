-- Causa raiz real da vulnerabilidade (confirmada via
-- SELECT proacl FROM pg_proc): a função start_subscription tinha uma
-- concessão de EXECUTE feita DIRETAMENTE para a role "anon"
-- (anon=X/postgres no ACL), fora de qualquer migration rastreada neste
-- repositório — não veio de PUBLIC nem de "authenticated", por isso a
-- migration anterior (20260726200000), que só revogava PUBLIC e
-- authenticated, não teve efeito nenhum. Qualquer requisição sem login
-- (usando só a anon key) executa como a role "anon" no Postgres, e por
-- ter essa concessão direta, conseguia criar/alterar assinatura de
-- QUALQUER usuário sem autenticação nenhuma.
--
-- Revoga EXECUTE de "anon" explicitamente nas mesmas funções sensíveis
-- de plano/pagamento/PIN/senha de autorização já revisadas antes.

REVOKE EXECUTE ON FUNCTION public.start_subscription(uuid, text, text, text, integer, text, text, text, timestamptz) FROM anon;
REVOKE EXECUTE ON FUNCTION public.cancel_subscription(uuid, text, text, text, boolean) FROM anon;

REVOKE EXECUTE ON FUNCTION public.purchase_client_package(uuid, uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.purchase_gift_card(uuid, numeric, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.redeem_gift_card(uuid, numeric, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.redeem_loyalty_reward(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.set_team_member_pin(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.clear_team_member_pin(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.verify_team_member_pin(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_or_create_referral_code() FROM anon;
REVOKE EXECUTE ON FUNCTION public.set_authorization_password(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.verify_authorization_password(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_clients_masked(boolean) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_client_data_secure(uuid, boolean) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_professionals_secure(boolean) FROM anon;
REVOKE EXECUTE ON FUNCTION public.check_pending_appointments_for_day(uuid, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_or_create_booking_slug() FROM anon;
