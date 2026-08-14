-- Correção do item 2 do relatório de bug bounty
-- (vazamento-schema-postgrest-supabase.md): auditoria de RLS confirmou que
-- as policies dessas tabelas já protegem corretamente os dados (RLS
-- ligado, sem policy permissiva de mais, mfa_required é RESTRICTIVE — soma
-- com AND, não abre acesso sozinha). O problema real é que os GRANTs de
-- privilégio de tabela concedem muito mais do que as policies realmente
-- usam: anon e authenticated têm DELETE/UPDATE/TRUNCATE nelas mesmo sem
-- nenhuma policy que permita isso pra eles.
--
-- TRUNCATE é o mais grave: ele ignora RLS completamente (ao contrário de
-- SELECT/INSERT/UPDATE/DELETE, que são sempre filtrados pelas policies).
-- Hoje isso não é explorável via PostgREST (não expõe TRUNCATE por HTTP),
-- mas não deveria existir — reduz superfície de ataque caso surja qualquer
-- outro caminho de acesso usando esses papéis.

-- anon não tem NENHUMA policy passável nestas tabelas — revoga tudo.
REVOKE ALL ON public.audit_logs FROM anon;
REVOKE ALL ON public.commissions FROM anon;
REVOKE ALL ON public.financial_transactions FROM anon;
REVOKE ALL ON public.suppressed_emails FROM anon;
REVOKE ALL ON public.user_subscriptions FROM anon;
REVOKE ALL ON public.user_roles FROM anon;

-- TRUNCATE nunca é necessário via RLS/PostgREST — revoga de authenticated
-- em todas.
REVOKE TRUNCATE ON public.audit_logs FROM authenticated;
REVOKE TRUNCATE ON public.commissions FROM authenticated;
REVOKE TRUNCATE ON public.financial_transactions FROM authenticated;
REVOKE TRUNCATE ON public.suppressed_emails FROM authenticated;
REVOKE TRUNCATE ON public.user_subscriptions FROM authenticated;
REVOKE TRUNCATE ON public.user_roles FROM authenticated;

-- audit_logs: só tem policy de SELECT/INSERT (dono) — sem UPDATE/DELETE.
REVOKE UPDATE, DELETE ON public.audit_logs FROM authenticated;

-- suppressed_emails: só tem policy pra service_role — nenhuma pra
-- authenticated comum, então nada do CRUD concedido é de fato utilizável.
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.suppressed_emails FROM authenticated;

-- user_subscriptions: só tem policy de SELECT — mudança de plano é sempre
-- via RPC/service_role, nunca escrita direta do client.
REVOKE INSERT, UPDATE, DELETE ON public.user_subscriptions FROM authenticated;

-- user_roles: SELECT (próprio/admin), INSERT e DELETE (admin, via RPC-like
-- check na própria policy) — sem policy de UPDATE.
REVOKE UPDATE ON public.user_roles FROM authenticated;
