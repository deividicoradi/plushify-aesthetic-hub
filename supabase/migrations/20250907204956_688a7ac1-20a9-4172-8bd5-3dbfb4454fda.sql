-- Complete the WhatsApp refresh token security enhancement
-- Add token rotation and security management functions

-- 1. Create function to securely rotate refresh tokens
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
    -- Validate old token exists and is active
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
    
    -- Set new expiration (7 days from now)
    v_new_expires_at := now() + INTERVAL '7 days';
    
    -- Revoke old token
    UPDATE public.whatsapp_refresh_tokens
    SET is_active = false,
        revoked_at = now()
    WHERE id = v_old_token_id;
    
    -- Create new token
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
    
    -- Log token rotation event
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

-- 2. Create function to securely revoke all user tokens
CREATE OR REPLACE FUNCTION public.revoke_all_user_tokens(
    p_user_id uuid,
    p_reason text DEFAULT 'security_revocation'
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    revoked_count integer;
BEGIN
    -- Verify user can only revoke their own tokens
    IF p_user_id != auth.uid() THEN
        RAISE EXCEPTION 'Access denied: Cannot revoke other users tokens';
    END IF;
    
    -- Revoke all active tokens for the user
    UPDATE public.whatsapp_refresh_tokens
    SET is_active = false,
        revoked_at = now()
    WHERE user_id = p_user_id
      AND is_active = true;
    
    GET DIAGNOSTICS revoked_count = ROW_COUNT;
    
    -- Log mass revocation event
    PERFORM public.log_whatsapp_security_event(
        p_user_id,
        'ALL_TOKENS_REVOKED',
        NULL,
        'MEDIUM',
        NULL,
        NULL,
        NULL,
        jsonb_build_object(
            'tokens_revoked', revoked_count,
            'reason', p_reason,
            'revocation_time', now()
        )
    );
    
    RETURN revoked_count;
END;
$function$;

-- 3. Create automated cleanup function for expired/old tokens
CREATE OR REPLACE FUNCTION public.cleanup_expired_refresh_tokens()
RETURNS TABLE(
    expired_tokens_cleaned integer,
    old_tokens_cleaned integer,
    revoked_tokens_cleaned integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    v_expired_count integer;
    v_old_count integer;
    v_revoked_count integer;
BEGIN
    -- Delete expired tokens (past expiration date)
    DELETE FROM public.whatsapp_refresh_tokens
    WHERE expires_at < now() - INTERVAL '1 day';
    GET DIAGNOSTICS v_expired_count = ROW_COUNT;
    
    -- Delete very old tokens (older than 30 days regardless of status)
    DELETE FROM public.whatsapp_refresh_tokens
    WHERE created_at < now() - INTERVAL '30 days';
    GET DIAGNOSTICS v_old_count = ROW_COUNT;
    
    -- Delete revoked tokens older than 7 days
    DELETE FROM public.whatsapp_refresh_tokens
    WHERE is_active = false 
      AND revoked_at < now() - INTERVAL '7 days';
    GET DIAGNOSTICS v_revoked_count = ROW_COUNT;
    
    -- Log cleanup activity
    PERFORM public.log_whatsapp_security_event(
        '00000000-0000-0000-0000-000000000000'::uuid,
        'TOKEN_CLEANUP_EXECUTED',
        NULL,
        'LOW',
        NULL,
        'system_cleanup',
        NULL,
        jsonb_build_object(
            'expired_cleaned', v_expired_count,
            'old_cleaned', v_old_count,
            'revoked_cleaned', v_revoked_count,
            'cleanup_time', now()
        )
    );
    
    RETURN QUERY SELECT v_expired_count, v_old_count, v_revoked_count;
END;
$function$;

-- 4. Create function to check token health and security status
CREATE OR REPLACE FUNCTION public.get_token_security_status(p_user_id uuid)
RETURNS TABLE(
    total_active_tokens integer,
    tokens_expiring_soon integer,
    suspicious_tokens integer,
    last_token_activity timestamp with time zone,
    security_score integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    v_total_active integer;
    v_expiring_soon integer;
    v_suspicious integer;
    v_last_activity timestamp with time zone;
    v_security_score integer;
BEGIN
    -- Verify user can only check their own tokens
    IF p_user_id != auth.uid() THEN
        RAISE EXCEPTION 'Access denied: Cannot check other users token status';
    END IF;
    
    -- Count active tokens
    SELECT COUNT(*) INTO v_total_active
    FROM public.whatsapp_refresh_tokens
    WHERE user_id = p_user_id 
      AND is_active = true 
      AND expires_at > now();
    
    -- Count tokens expiring in next 24 hours
    SELECT COUNT(*) INTO v_expiring_soon
    FROM public.whatsapp_refresh_tokens
    WHERE user_id = p_user_id 
      AND is_active = true 
      AND expires_at BETWEEN now() AND now() + INTERVAL '24 hours';
    
    -- Count potentially suspicious tokens (multiple IPs)
    SELECT COUNT(DISTINCT ip_address) - 1 INTO v_suspicious
    FROM public.whatsapp_refresh_tokens
    WHERE user_id = p_user_id 
      AND is_active = true 
      AND last_used_at > now() - INTERVAL '24 hours';
    
    -- Get last token activity
    SELECT MAX(last_used_at) INTO v_last_activity
    FROM public.whatsapp_refresh_tokens
    WHERE user_id = p_user_id 
      AND is_active = true;
    
    -- Calculate security score (0-100)
    v_security_score := GREATEST(0, 100 - 
        (v_total_active * 5) - -- Deduct for too many active tokens
        (v_expiring_soon * 10) - -- Deduct for tokens expiring soon
        (v_suspicious * 20) -- Deduct heavily for suspicious activity
    );
    
    RETURN QUERY SELECT 
        v_total_active,
        v_expiring_soon,
        GREATEST(0, v_suspicious),
        v_last_activity,
        v_security_score;
END;
$function$;