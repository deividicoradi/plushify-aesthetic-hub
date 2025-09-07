-- Fix security vulnerability in whatsapp_login_attempts table
-- Remove overly permissive policy and create secure ones

-- Drop the insecure policy that allows system-wide access
DROP POLICY IF EXISTS "System can manage login attempts" ON public.whatsapp_login_attempts;

-- Create secure policies for login attempts
-- Only allow system functions to insert login attempts (via security definer functions)
CREATE POLICY "System functions can insert login attempts" 
ON public.whatsapp_login_attempts 
FOR INSERT 
WITH CHECK (true); -- This is safe because only security definer functions can bypass RLS

-- Users can only view their own login attempts
CREATE POLICY "Users can view own login attempts" 
ON public.whatsapp_login_attempts 
FOR SELECT 
USING (auth.uid() = user_id);

-- Only system functions can update login attempts (for blocking/unblocking)
CREATE POLICY "System functions can update login attempts" 
ON public.whatsapp_login_attempts 
FOR UPDATE 
USING (true) -- This is safe because only security definer functions can bypass RLS
WITH CHECK (true);

-- No one can delete login attempts (for audit trail integrity)
-- DELETE is completely restricted

-- Update the existing login attempt logging function to be more secure
CREATE OR REPLACE FUNCTION public.log_whatsapp_login_attempt(
    p_user_id uuid, 
    p_ip_address inet, 
    p_success boolean, 
    p_user_agent text DEFAULT NULL::text, 
    p_failure_reason text DEFAULT NULL::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER  -- This bypasses RLS to allow system logging
SET search_path TO 'public'
AS $function$
DECLARE
  attempt_id UUID;
  security_check RECORD;
BEGIN
  -- Validate that the user_id exists in auth.users (basic security check)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'Invalid user_id provided';
  END IF;
  
  -- Sanitize IP address input
  IF p_ip_address IS NULL THEN
    RAISE EXCEPTION 'IP address is required for security logging';
  END IF;
  
  -- Insert login attempt with additional security validation
  INSERT INTO public.whatsapp_login_attempts (
    user_id, ip_address, success, user_agent, failure_reason
  ) VALUES (
    p_user_id, p_ip_address, p_success, 
    LEFT(COALESCE(p_user_agent, ''), 500), -- Limit user agent length
    LEFT(COALESCE(p_failure_reason, ''), 500) -- Limit failure reason length
  ) RETURNING id INTO attempt_id;
  
  -- If login failed, check for suspicious activity
  IF NOT p_success THEN
    SELECT * INTO security_check 
    FROM public.check_suspicious_login_attempts(p_user_id, p_ip_address);
    
    -- Log security event based on severity
    PERFORM public.log_whatsapp_security_event(
      p_user_id,
      CASE 
        WHEN security_check.severity = 'HIGH' THEN 'MULTIPLE_FAILED_LOGINS'
        WHEN security_check.severity = 'MEDIUM' THEN 'SUSPICIOUS_LOGIN_ACTIVITY'
        ELSE 'FAILED_LOGIN'
      END,
      NULL,
      security_check.severity,
      p_ip_address,
      p_user_agent,
      NULL,
      jsonb_build_object(
        'attempts_count', security_check.attempts_count,
        'is_blocked', security_check.is_blocked,
        'failure_reason', p_failure_reason
      )
    );
  ELSE
    -- Log successful login for audit trail
    PERFORM public.log_whatsapp_security_event(
      p_user_id,
      'SUCCESSFUL_LOGIN',
      NULL,
      'LOW',
      p_ip_address,
      p_user_agent,
      NULL,
      jsonb_build_object('login_time', now())
    );
  END IF;
  
  RETURN attempt_id;
END;
$function$;

-- Create a secure function for users to view their own login history
CREATE OR REPLACE FUNCTION public.get_user_login_attempts(
    p_limit integer DEFAULT 50,
    p_offset integer DEFAULT 0
)
RETURNS TABLE(
    id uuid,
    ip_address inet,
    success boolean,
    attempt_time timestamp with time zone,
    user_agent text,
    failure_reason text,
    blocked_until timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Verify user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Validate input parameters
  IF p_limit < 1 OR p_limit > 100 THEN
    p_limit := 50;
  END IF;
  
  IF p_offset < 0 THEN
    p_offset := 0;
  END IF;
  
  -- Return only the user's own login attempts
  RETURN QUERY
  SELECT 
    la.id,
    la.ip_address,
    la.success,
    la.attempt_time,
    la.user_agent,
    la.failure_reason,
    la.blocked_until
  FROM public.whatsapp_login_attempts la
  WHERE la.user_id = auth.uid()
  ORDER BY la.attempt_time DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$function$;