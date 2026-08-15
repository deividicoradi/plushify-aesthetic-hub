-- Reverte a integração de WhatsApp via OpenWA (não-oficial). Número de
-- teste foi banido pelo WhatsApp quase imediatamente após conectar via
-- whatsapp-web.js — iniciativa pausada até reavaliação (ver memória do
-- projeto: project_whatsapp_ban_incident).
DROP TRIGGER IF EXISTS wa_sessions_updated_at ON public.wa_sessions;
DROP FUNCTION IF EXISTS public.update_wa_sessions_updated_at();
DROP TABLE IF EXISTS public.wa_sessions;
