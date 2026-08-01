-- Bug real encontrado em produção (2026-08-01): o e-mail de aviso de login
-- (notify_login, migration anterior) falhava com
-- "400 missing_unsubscribe_token" na primeira tentativa — a API de e-mail
-- da Lovable exige um token de descadastro pra e-mails com purpose
-- 'transactional', e a função não gerava nenhum. Pior: como o processador
-- da fila reusa o MESMO idempotency_key em cada retry, todas as tentativas
-- seguintes ficavam presas num loop de 409 "already failed" até cair na
-- DLQ (10 falhas registradas pro mesmo e-mail antes de identificar a causa).
--
-- Corrige gerando (ou reaproveitando) um token em
-- public.email_unsubscribe_tokens por e-mail, igual a infraestrutura já
-- prevista em 20260726183040_email_infra.sql só que nunca populada até
-- agora. O retry travado em loop de idempotency_key foi corrigido à parte
-- em supabase/functions/process-email-queue/index.ts (varia a chave por
-- tentativa a partir da 2ª falha).

CREATE OR REPLACE FUNCTION public.notify_login(p_user_agent text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
DECLARE
  v_email text;
  v_last timestamptz;
  v_now timestamptz := now();
  v_message_id text;
  v_when text;
  v_device_row text;
  v_unsub_token text;
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

  SELECT token INTO v_unsub_token FROM public.email_unsubscribe_tokens WHERE email = v_email;
  IF v_unsub_token IS NULL THEN
    v_unsub_token := encode(gen_random_bytes(24), 'hex');
    INSERT INTO public.email_unsubscribe_tokens (token, email)
    VALUES (v_unsub_token, v_email)
    ON CONFLICT (email) DO UPDATE SET token = EXCLUDED.token
    RETURNING token INTO v_unsub_token;
  END IF;

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
    'unsubscribe_token', v_unsub_token,
    'queued_at', v_now
  ));
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'notify_login falhou para user %: %', auth.uid(), SQLERRM;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.notify_login(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_login(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.notify_login(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_login(text) TO service_role;
