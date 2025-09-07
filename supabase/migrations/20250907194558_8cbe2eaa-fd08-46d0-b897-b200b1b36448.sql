-- Comprehensive security fixes for authentication tokens

-- 1. Create strict RLS policies for whatsapp_refresh_tokens
DROP POLICY IF EXISTS "System can manage refresh tokens" ON public.whatsapp_refresh_tokens;
DROP POLICY IF EXISTS "Users can view their own refresh tokens" ON public.whatsapp_refresh_tokens;

-- Only allow users to access their own tokens, no system-wide access
CREATE POLICY "Users can only access their own refresh tokens"
ON public.whatsapp_refresh_tokens
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Deny all access to anonymous users
CREATE POLICY "Deny anonymous access to refresh tokens"
ON public.whatsapp_refresh_tokens
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- 2. Create secure token management functions with proper access control

-- Function to safely validate refresh tokens
CREATE OR REPLACE FUNCTION public.validate_refresh_token_secure(p_token_hash text)
RETURNS TABLE(is_valid boolean, user_id uuid, session_id text) AS $$
DECLARE
  token_record RECORD;
BEGIN
  -- Only allow authenticated users to validate their own tokens
  IF auth.uid() IS NULL THEN
    RETURN QUERY SELECT false, NULL::uuid, NULL::text;
    RETURN;
  END IF;
  
  -- Find valid token for current user only
  SELECT rt.user_id, rt.session_id, rt.expires_at, rt.is_active
  INTO token_record
  FROM public.whatsapp_refresh_tokens rt
  WHERE rt.refresh_token_hash = p_token_hash
    AND rt.user_id = auth.uid()  -- Critical: only user's own tokens
    AND rt.is_active = true
    AND rt.expires_at > now();
  
  IF FOUND THEN
    -- Update last used timestamp
    UPDATE public.whatsapp_refresh_tokens
    SET last_used_at = now()
    WHERE refresh_token_hash = p_token_hash
      AND user_id = auth.uid();
    
    RETURN QUERY SELECT true, token_record.user_id, token_record.session_id;
  ELSE
    -- Log suspicious token validation attempt
    PERFORM public.log_whatsapp_security_event(
      auth.uid(),
      'INVALID_TOKEN_VALIDATION',
      NULL,
      'HIGH',
      NULL,
      NULL,
      NULL,
      jsonb_build_object('token_hash_prefix', left(p_token_hash, 8))
    );
    
    RETURN QUERY SELECT false, NULL::uuid, NULL::text;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to securely revoke tokens
CREATE OR REPLACE FUNCTION public.revoke_user_tokens_secure(p_user_id uuid DEFAULT auth.uid())
RETURNS integer AS $$
DECLARE
  revoked_count INTEGER := 0;
BEGIN
  -- Only allow users to revoke their own tokens
  IF auth.uid() IS NULL OR p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: Cannot revoke tokens for other users';
  END IF;
  
  -- Revoke all active tokens for the user
  UPDATE public.whatsapp_refresh_tokens
  SET is_active = false,
      revoked_at = now()
  WHERE user_id = p_user_id
    AND is_active = true;
  
  GET DIAGNOSTICS revoked_count = ROW_COUNT;
  
  -- Log token revocation
  PERFORM public.log_whatsapp_security_event(
    p_user_id,
    'TOKENS_REVOKED',
    NULL,
    'MEDIUM',
    NULL,
    NULL,
    NULL,
    jsonb_build_object('revoked_count', revoked_count)
  );
  
  RETURN revoked_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Enhanced token cleanup with security logging
CREATE OR REPLACE FUNCTION public.secure_token_cleanup()
RETURNS TABLE(expired_tokens integer, old_sessions integer, security_issues integer) AS $$
DECLARE
  v_expired_tokens INTEGER := 0;
  v_old_sessions INTEGER := 0;
  v_security_issues INTEGER := 0;
  suspicious_token RECORD;
BEGIN
  -- Find and log suspicious tokens before cleanup
  FOR suspicious_token IN 
    SELECT user_id, count(*) as token_count
    FROM public.whatsapp_refresh_tokens 
    WHERE is_active = true 
      AND created_at > now() - INTERVAL '1 hour'
    GROUP BY user_id 
    HAVING count(*) > 10  -- More than 10 active tokens in 1 hour is suspicious
  LOOP
    v_security_issues := v_security_issues + 1;
    
    -- Log suspicious activity
    PERFORM public.log_whatsapp_security_event(
      suspicious_token.user_id,
      'SUSPICIOUS_TOKEN_ACTIVITY',
      NULL,
      'HIGH',
      NULL,
      NULL,
      NULL,
      jsonb_build_object('token_count', suspicious_token.token_count)
    );
  END LOOP;
  
  -- Clean up expired tokens
  DELETE FROM public.whatsapp_refresh_tokens 
  WHERE expires_at < now() OR 
        (is_active = false AND revoked_at < now() - INTERVAL '24 hours');
  GET DIAGNOSTICS v_expired_tokens = ROW_COUNT;
  
  -- Clean up old sessions
  DELETE FROM public.whatsapp_sessions 
  WHERE status = 'expirado' AND updated_at < now() - INTERVAL '7 days';
  GET DIAGNOSTICS v_old_sessions = ROW_COUNT;
  
  -- Log cleanup activity
  PERFORM public.log_whatsapp_security_event(
    '00000000-0000-0000-0000-000000000000'::UUID,
    'TOKEN_CLEANUP_EXECUTED',
    NULL,
    'LOW',
    NULL,
    'system',
    NULL,
    jsonb_build_object(
      'expired_tokens', v_expired_tokens,
      'old_sessions', v_old_sessions,
      'security_issues', v_security_issues
    )
  );
  
  RETURN QUERY SELECT v_expired_tokens, v_old_sessions, v_security_issues;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Add trigger to detect token manipulation attempts
CREATE OR REPLACE FUNCTION public.token_security_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Detect direct token table manipulation attempts
  IF TG_OP = 'UPDATE' AND OLD.user_id != NEW.user_id THEN
    -- Log attempt to change token ownership
    PERFORM public.log_whatsapp_security_event(
      COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID),
      'TOKEN_OWNERSHIP_CHANGE_ATTEMPT',
      NEW.session_id,
      'CRITICAL',
      NULL,
      NULL,
      NULL,
      jsonb_build_object(
        'old_user_id', OLD.user_id,
        'new_user_id', NEW.user_id,
        'token_id', NEW.id
      )
    );
    RAISE EXCEPTION 'Unauthorized: Cannot change token ownership';
  END IF;
  
  -- Detect attempts to modify encrypted tokens directly
  IF TG_OP = 'UPDATE' AND OLD.encrypted_refresh_token != NEW.encrypted_refresh_token THEN
    PERFORM public.log_whatsapp_security_event(
      COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID),
      'TOKEN_MODIFICATION_ATTEMPT',
      NEW.session_id,
      'CRITICAL',
      NULL,
      NULL,
      NULL,
      jsonb_build_object('token_id', NEW.id)
    );
    RAISE EXCEPTION 'Unauthorized: Direct token modification not allowed';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for token security
DROP TRIGGER IF EXISTS token_security_trigger ON public.whatsapp_refresh_tokens;
CREATE TRIGGER token_security_trigger
  BEFORE UPDATE ON public.whatsapp_refresh_tokens
  FOR EACH ROW EXECUTE FUNCTION public.token_security_trigger();

-- 5. Create secure session validation function
CREATE OR REPLACE FUNCTION public.validate_session_secure(p_session_id text)
RETURNS TABLE(is_valid boolean, user_id uuid, status text) AS $$
DECLARE
  session_record RECORD;
BEGIN
  -- Only allow authenticated users to validate their own sessions
  IF auth.uid() IS NULL THEN
    RETURN QUERY SELECT false, NULL::uuid, NULL::text;
    RETURN;
  END IF;
  
  -- Find valid session for current user only
  SELECT ws.user_id, ws.status, ws.expires_at
  INTO session_record
  FROM public.whatsapp_sessions ws
  WHERE ws.session_id = p_session_id
    AND ws.user_id = auth.uid()  -- Critical: only user's own sessions
    AND ws.expires_at > now()
    AND ws.status != 'expirado';
  
  IF FOUND THEN
    -- Update last activity
    UPDATE public.whatsapp_sessions
    SET last_activity = now()
    WHERE session_id = p_session_id
      AND user_id = auth.uid();
    
    RETURN QUERY SELECT true, session_record.user_id, session_record.status;
  ELSE
    -- Log suspicious session validation attempt
    PERFORM public.log_whatsapp_security_event(
      auth.uid(),
      'INVALID_SESSION_VALIDATION',
      p_session_id,
      'MEDIUM',
      NULL,
      NULL,
      NULL,
      jsonb_build_object('session_id', p_session_id)
    );
    
    RETURN QUERY SELECT false, NULL::uuid, NULL::text;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;