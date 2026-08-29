-- Achado da reauditoria de segurança de 2026-08-29 (baixa severidade,
-- schema morto): tabelas de uma tentativa anterior de integração de
-- WhatsApp via Cloud API oficial (2025-10-17, antes do pivô pra Evolution
-- API + wa_sessions em 2026-08-22). RLS estava correto nelas, mas ficaram
-- para trás quando a limpeza de resíduo WhatsApp (20260730000000) só
-- derrubou as tabelas prefixadas whatsapp_*, não as prefixadas wa_*. Nada
-- em src/ ou supabase/functions/ referencia essas tabelas hoje — confirmado
-- via grep antes desta migration.
DROP TABLE IF EXISTS public.wa_incoming_events;
DROP TABLE IF EXISTS public.wa_messages;
DROP TABLE IF EXISTS public.wa_threads;
DROP TABLE IF EXISTS public.wa_contacts;
DROP TABLE IF EXISTS public.wa_accounts;
DROP TABLE IF EXISTS public.wa_security_alerts;
DROP TABLE IF EXISTS public.wa_token_refresh;
DROP TABLE IF EXISTS public.wa_audit_logs;
DROP TABLE IF EXISTS public.wa_rate_limits;
