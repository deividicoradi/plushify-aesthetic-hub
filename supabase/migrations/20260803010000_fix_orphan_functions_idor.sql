-- Três funções SECURITY DEFINER recebiam um identificador de usuário do
-- client (check_user_id / p_user_id) sem nunca comparar com auth.uid(), e
-- sem REVOKE explícito de PUBLIC/anon (herdando o GRANT EXECUTE TO PUBLIC
-- padrão do Postgres). Nenhuma delas é chamada pelo app atual (frontend ou
-- edge functions) — são código órfão — mas continuavam expostas via RPC
-- pra qualquer usuário autenticado poder consultar/mutar dados de outra
-- conta. Adiciona checagem de posse e restringe o GRANT a service_role,
-- já que não há caller legítimo no client hoje.

CREATE OR REPLACE FUNCTION public.comprehensive_security_check(check_user_id uuid)
RETURNS TABLE(table_name text, check_type text, status text, details text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF check_user_id != auth.uid() AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Cannot access other users data';
  END IF;

  RETURN QUERY
  SELECT 'clients'::TEXT, 'data_integrity'::TEXT,
         CASE WHEN COUNT(*) >= 0 THEN 'OK' ELSE 'ERROR' END::TEXT,
         ('Total: ' || COUNT(*))::TEXT
  FROM public.clients WHERE user_id = check_user_id;

  RETURN QUERY
  SELECT 'payments'::TEXT, 'suspicious_amounts'::TEXT,
         CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'WARNING' END::TEXT,
         ('Suspicious: ' || COUNT(*))::TEXT
  FROM public.payments WHERE user_id = check_user_id AND (amount <= 0 OR amount > 1000000);
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_data_integrity(check_user_id uuid)
RETURNS TABLE(table_name text, total_records bigint, unauthorized_records bigint, status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF check_user_id != auth.uid() AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Cannot access other users data';
  END IF;

  RETURN QUERY
  SELECT 'clients'::TEXT, COUNT(*)::BIGINT, 0::BIGINT, 'OK'::TEXT
  FROM public.clients WHERE user_id = check_user_id;

  RETURN QUERY
  SELECT 'appointments'::TEXT, COUNT(*)::BIGINT, 0::BIGINT, 'OK'::TEXT
  FROM public.appointments WHERE user_id = check_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.rotate_refresh_token(
    p_old_token_hash text,
    p_user_id uuid,
    p_new_token_hash text,
    p_new_encrypted_token text,
    p_session_id text,
    p_ip_address inet DEFAULT NULL,
    p_user_agent text DEFAULT NULL
)
RETURNS TABLE(
    success boolean,
    new_token_id uuid,
    expires_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    v_old_token_id uuid;
    v_new_token_id uuid;
    v_new_expires_at timestamp with time zone;
BEGIN
    IF p_user_id != auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized: Cannot rotate tokens for other users';
    END IF;

    SELECT id INTO v_old_token_id
    FROM public.whatsapp_refresh_tokens
    WHERE refresh_token_hash = p_old_token_hash
      AND user_id = p_user_id
      AND session_id = p_session_id
      AND is_active = true
      AND expires_at > now();

    IF NOT FOUND THEN
        RETURN QUERY SELECT false, NULL::uuid, NULL::timestamp with time zone;
        RETURN;
    END IF;

    v_new_expires_at := now() + INTERVAL '7 days';

    UPDATE public.whatsapp_refresh_tokens
    SET is_active = false,
        revoked_at = now()
    WHERE id = v_old_token_id;

    INSERT INTO public.whatsapp_refresh_tokens (
        user_id,
        session_id,
        refresh_token_hash,
        encrypted_refresh_token,
        expires_at,
        ip_address,
        user_agent
    ) VALUES (
        p_user_id,
        p_session_id,
        p_new_token_hash,
        p_new_encrypted_token,
        v_new_expires_at,
        p_ip_address,
        p_user_agent
    ) RETURNING id INTO v_new_token_id;

    PERFORM public.log_whatsapp_security_event(
        p_user_id,
        'TOKEN_ROTATED',
        p_session_id,
        'LOW',
        p_ip_address,
        p_user_agent,
        NULL,
        jsonb_build_object(
            'old_token_id', v_old_token_id,
            'new_token_id', v_new_token_id,
            'rotation_time', now()
        )
    );

    RETURN QUERY SELECT true, v_new_token_id, v_new_expires_at;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.comprehensive_security_check(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.comprehensive_security_check(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.comprehensive_security_check(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.comprehensive_security_check(uuid) TO service_role;

REVOKE EXECUTE ON FUNCTION public.verify_data_integrity(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.verify_data_integrity(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.verify_data_integrity(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_data_integrity(uuid) TO service_role;

REVOKE EXECUTE ON FUNCTION public.rotate_refresh_token(text, uuid, text, text, text, inet, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.rotate_refresh_token(text, uuid, text, text, text, inet, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.rotate_refresh_token(text, uuid, text, text, text, inet, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rotate_refresh_token(text, uuid, text, text, text, inet, text) TO service_role;
