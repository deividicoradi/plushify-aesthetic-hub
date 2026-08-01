-- Aviso por e-mail a cada novo login (pedido do usuário depois da auditoria
-- de 2FA: detectar rápido um acesso indevido, já que nenhuma proteção
-- técnica cobre 100% dos casos — ex: phishing que captura senha + código).
--
-- Dispara no momento em que a SENHA é aceita (evento SIGNED_IN do
-- supabase-js), não depois do desafio de 2FA — porque o alerta serve
-- justamente pra avisar o dono da conta mesmo quando o invasor NÃO tem o
-- segundo fator e falha nele. Reaproveita a fila 'transactional_emails' já
-- usada pelo e-mail de confirmação de upgrade (abacate-webhook).

-- Debounce por usuário: evita duplicar o aviso se onAuthStateChange disparar
-- SIGNED_IN mais de uma vez em sequência rápida (múltiplas abas, refresh).
CREATE TABLE IF NOT EXISTS public.login_notification_state (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_notified_at timestamptz NOT NULL
);

ALTER TABLE public.login_notification_state ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.login_notification_state FROM PUBLIC;
REVOKE ALL ON public.login_notification_state FROM anon;
-- Sem policy para authenticated: só a função SECURITY DEFINER abaixo
-- (roda como dono, ignora RLS) lê/escreve aqui.
GRANT ALL ON public.login_notification_state TO service_role;

CREATE OR REPLACE FUNCTION public.notify_login(p_user_agent text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  v_last timestamptz;
  v_now timestamptz := now();
  v_message_id text;
  v_when text;
  v_device_row text;
BEGIN
  IF auth.uid() IS NULL THEN RETURN; END IF;

  SELECT last_notified_at INTO v_last FROM public.login_notification_state WHERE user_id = auth.uid();
  IF v_last IS NOT NULL AND v_last > v_now - interval '2 minutes' THEN
    RETURN;
  END IF;

  INSERT INTO public.login_notification_state (user_id, last_notified_at)
  VALUES (auth.uid(), v_now)
  ON CONFLICT (user_id) DO UPDATE SET last_notified_at = v_now;

  SELECT email::text INTO v_email FROM auth.users WHERE id = auth.uid();
  IF v_email IS NULL THEN RETURN; END IF;

  v_when := to_char(v_now AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI');
  v_message_id := 'login-' || auth.uid()::text || '-' || extract(epoch FROM v_now)::bigint::text;
  v_device_row := CASE WHEN p_user_agent IS NOT NULL AND btrim(p_user_agent) <> ''
    THEN '<tr><td style="padding:8px 0; color:#666; border-top:1px solid #eee;">Dispositivo</td><td style="text-align:right; border-top:1px solid #eee;">' || left(p_user_agent, 200) || '</td></tr>'
    ELSE ''
  END;

  PERFORM public.enqueue_email('transactional_emails', jsonb_build_object(
    'to', v_email,
    'from', 'Plushify <naoresponda@notify.plushify.com.br>',
    'sender_domain', 'notify.plushify.com.br',
    'subject', 'Novo login na sua conta Plushify',
    'html',
      '<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">' ||
      '<h2>Novo login detectado</h2>' ||
      '<p>Sua conta Plushify (' || v_email || ') acabou de ser acessada com sua senha.</p>' ||
      '<table style="width:100%; border-collapse: collapse; margin: 16px 0;">' ||
      '<tr><td style="padding:8px 0; color:#666;">Data e hora</td><td style="text-align:right;">' || v_when || ' (horário de Brasília)</td></tr>' ||
      v_device_row ||
      '</table>' ||
      '<p style="color:#c0392b; font-weight:bold;">Não foi você? Troque sua senha agora e ative a autenticação em duas etapas em Configurações → Conta.</p>' ||
      '<p style="color:#999; font-size:12px; margin-top:24px;">Dúvidas? Fale com plushify.suporte@gmail.com</p>' ||
      '</div>',
    'text', 'Novo login na sua conta Plushify em ' || v_when || ' (horário de Brasília). Não foi você? Troque sua senha e ative o 2FA em Configurações → Conta.',
    'purpose', 'transactional',
    'label', 'login_notification',
    'message_id', v_message_id,
    'idempotency_key', v_message_id,
    'queued_at', v_now
  ));
EXCEPTION WHEN OTHERS THEN
  -- Nunca deixa uma falha no envio do aviso quebrar o login do usuário.
  RAISE WARNING 'notify_login falhou para user %: %', auth.uid(), SQLERRM;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.notify_login(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_login(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.notify_login(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_login(text) TO service_role;
