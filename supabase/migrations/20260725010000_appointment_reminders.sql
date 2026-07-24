-- Rastreio simples de "lembrete de WhatsApp enviado" pra Central de Lembretes.
-- Sem integração de API paga por enquanto (base de usuários ainda é zero) —
-- só marca quando o dono/funcionário clica pra abrir o link do WhatsApp com
-- a mensagem pronta. Não confirma entrega real, só evita reenviar/perder o
-- controle de quem já foi avisado.
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS reminder_sent_at timestamptz;
