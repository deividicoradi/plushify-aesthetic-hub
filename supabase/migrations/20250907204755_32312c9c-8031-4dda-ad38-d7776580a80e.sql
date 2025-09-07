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

CREATE POLICY "Users can only deactivate their own tokens" 
ON public.whatsapp_refresh_tokens 
FOR UPDATE 
TO authenticated
USING (
  auth.uid() = user_id 
  AND created_at > now() - INTERVAL '30 days'
)
WITH CHECK (
  auth.uid() = user_id
  AND is_active = false  -- Only allow deactivation
);

CREATE POLICY "No direct deletion of tokens allowed" 
ON public.whatsapp_refresh_tokens 
FOR DELETE 
TO authenticated
USING (false);

-- 3. Create enhanced token security validation function
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