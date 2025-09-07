-- Fix critical security vulnerability: Enhanced protection for WhatsApp refresh tokens
-- Implement additional security layers, token rotation, and audit controls

-- 1. Drop existing policies to recreate with enhanced security
DROP POLICY IF EXISTS "Deny anonymous access to refresh tokens" ON public.whatsapp_refresh_tokens;
DROP POLICY IF EXISTS "Users can only access their own refresh tokens" ON public.whatsapp_refresh_tokens;

-- 2. Create more restrictive and secure RLS policies
CREATE POLICY "Block all anonymous access to tokens" 
ON public.whatsapp_refresh_tokens 
FOR ALL 
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Users can only select their own active tokens" 
ON public.whatsapp_refresh_tokens 
FOR SELECT 
TO authenticated
USING (
  auth.uid() = user_id 
  AND is_active = true 
  AND expires_at > now()
  AND created_at > now() - INTERVAL '30 days'
);

CREATE POLICY "System can insert tokens for authenticated users" 
ON public.whatsapp_refresh_tokens 
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND expires_at > now()
  AND is_active = true
);

CREATE POLICY "Users can only update their own token status" 
ON public.whatsapp_refresh_tokens 
FOR UPDATE 
TO authenticated
USING (
  auth.uid() = user_id 
  AND created_at > now() - INTERVAL '30 days'
)
WITH CHECK (
  auth.uid() = user_id
  AND (
    -- Only allow deactivation or revocation, not reactivation
    (OLD.is_active = true AND NEW.is_active = false) OR
    (OLD.revoked_at IS NULL AND NEW.revoked_at IS NOT NULL)
  )
);

CREATE POLICY "No direct deletion of tokens" 
ON public.whatsapp_refresh_tokens 
FOR DELETE 
TO authenticated
USING (false);

-- 3. Create enhanced token security functions
CREATE OR REPLACE FUNCTION public.validate_refresh_token_security(
    p_token_hash text,
    p_user_id uuid,
    p_session_id text
)
RETURNS TABLE(
    is_valid boolean,
    security_status text,
    remaining_uses integer,
    expires_in_seconds integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    v_token_record RECORD;
    v_suspicious_activity boolean := false;
    v_remaining_uses integer;
    v_expires_in integer;
BEGIN
    -- Check for the token with additional security validations
    SELECT 
        rt.id,
        rt.user_id,
        rt.session_id,
        rt.is_active,
        rt.expires_at,
        rt.last_used_at,
        rt.created_at,
        rt.ip_address
    INTO v_token_record
    FROM public.whatsapp_refresh_tokens rt
    WHERE rt.refresh_token_hash = p_token_hash
      AND rt.user_id = p_user_id
      AND rt.session_id = p_session_id;
    
    -- Token not found
    IF NOT FOUND THEN
        -- Log suspicious token attempt
        PERFORM public.log_whatsapp_security_event(
            p_user_id,
            'INVALID_TOKEN_ATTEMPT',
            p_session_id,
            'HIGH',
            NULL,
            NULL,
            NULL,
            jsonb_build_object(
                'token_hash_prefix', left(p_token_hash, 8),
                'session_id', p_session_id
            )
        );
        
        RETURN QUERY SELECT false, 'TOKEN_NOT_FOUND', 0, 0;
        RETURN;
    END IF;
    
    -- Check if token is expired
    IF v_token_record.expires_at <= now() THEN
        RETURN QUERY SELECT false, 'TOKEN_EXPIRED', 0, 0;
        RETURN;
    END IF;
    
    -- Check if token is active
    IF NOT v_token_record.is_active THEN
        RETURN QUERY SELECT false, 'TOKEN_REVOKED', 0, 0;
        RETURN;
    END IF;
    
    -- Check for suspicious activity patterns
    -- Multiple rapid token uses from different IPs
    SELECT COUNT(*) > 10 INTO v_suspicious_activity
    FROM public.whatsapp_refresh_tokens rt2
    WHERE rt2.user_id = p_user_id
      AND rt2.last_used_at > now() - INTERVAL '1 hour'
      AND rt2.ip_address != v_token_record.ip_address;
    
    IF v_suspicious_activity THEN
        -- Log security alert and revoke token
        PERFORM public.log_whatsapp_security_event(
            p_user_id,
            'SUSPICIOUS_TOKEN_ACTIVITY',
            p_session_id,
            'CRITICAL',
            NULL,
            NULL,
            NULL,
            jsonb_build_object(
                'revoked_token_id', v_token_record.id,
                'reason', 'multiple_ip_usage'
            )
        );
        
        -- Revoke the token immediately
        UPDATE public.whatsapp_refresh_tokens 
        SET is_active = false, 
            revoked_at = now()
        WHERE id = v_token_record.id;
        
        RETURN QUERY SELECT false, 'TOKEN_SUSPICIOUS_REVOKED', 0, 0;
        RETURN;
    END IF;
    
    -- Calculate remaining metrics
    v_remaining_uses := 50 - COALESCE((
        SELECT COUNT(*) 
        FROM public.whatsapp_refresh_tokens rt3
        WHERE rt3.user_id = p_user_id 
          AND rt3.last_used_at > now() - INTERVAL '24 hours'
    ), 0);
    
    v_expires_in := EXTRACT(EPOCH FROM (v_token_record.expires_at - now()))::integer;
    
    -- Update last used timestamp
    UPDATE public.whatsapp_refresh_tokens 
    SET last_used_at = now()
    WHERE id = v_token_record.id;
    
    -- Return valid token status
    RETURN QUERY SELECT true, 'TOKEN_VALID', GREATEST(v_remaining_uses, 0), v_expires_in;
END;
$function$;

-- 4. Create function to securely rotate refresh tokens
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

-- 5. Create function to securely revoke all user tokens
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

-- 6. Create automated cleanup function for expired/old tokens
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