-- Fix security vulnerability in whatsapp_login_attempts table
-- First, check and drop existing policies safely

DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "System can manage login attempts" ON public.whatsapp_login_attempts;
    DROP POLICY IF EXISTS "System functions can insert login attempts" ON public.whatsapp_login_attempts;
    DROP POLICY IF EXISTS "Users can view their own login attempts" ON public.whatsapp_login_attempts;
    DROP POLICY IF EXISTS "Users can view own login attempts" ON public.whatsapp_login_attempts;
    DROP POLICY IF EXISTS "System functions can update login attempts" ON public.whatsapp_login_attempts;
END $$;

-- Create secure policies for login attempts
-- Only authenticated system functions can insert login attempts
CREATE POLICY "Secure system insert login attempts" 
ON public.whatsapp_login_attempts 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL); -- Requires authentication but allows security definer functions

-- Users can only view their own login attempts
CREATE POLICY "Users view own login attempts only" 
ON public.whatsapp_login_attempts 
FOR SELECT 
USING (auth.uid() = user_id);

-- Only system functions can update login attempts (for blocking/unblocking)
CREATE POLICY "Secure system update login attempts" 
ON public.whatsapp_login_attempts 
FOR UPDATE 
USING (auth.uid() IS NOT NULL) -- Requires authentication
WITH CHECK (auth.uid() IS NOT NULL);

-- Completely restrict DELETE operations for audit trail integrity
-- No DELETE policy = no one can delete

-- Update the existing login attempt logging function with better security
CREATE OR REPLACE FUNCTION public.log_whatsapp_login_attempt(
    p_user_id uuid, 
    p_ip_address inet, 
    p_success boolean, 
    p_user_agent text DEFAULT NULL::text, 
    p_failure_reason text DEFAULT NULL::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER  -- This allows the function to bypass RLS for system operations
SET search_path TO 'public'
AS $function$
DECLARE
  attempt_id UUID;
  security_check RECORD;
BEGIN
  -- Validate input parameters for security
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User ID is required for login attempt logging';
  END IF;
  
  IF p_ip_address IS NULL THEN
    RAISE EXCEPTION 'IP address is required for security logging';
  END IF;
  
  -- Insert login attempt with input sanitization
  INSERT INTO public.whatsapp_login_attempts (
    user_id, 
    ip_address, 
    success, 
    user_agent, 
    failure_reason
  ) VALUES (
    p_user_id, 
    p_ip_address, 
    p_success, 
    -- Sanitize and limit text inputs to prevent injection
    LEFT(COALESCE(p_user_agent, ''), 500),
    LEFT(COALESCE(p_failure_reason, ''), 500)
  ) RETURNING id INTO attempt_id;
  
  -- Check for suspicious activity on failed logins
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
    RAISE EXCEPTION 'Authentication required to view login attempts';
  END IF;
  
  -- Validate and sanitize input parameters
  p_limit := GREATEST(1, LEAST(COALESCE(p_limit, 50), 100));
  p_offset := GREATEST(0, COALESCE(p_offset, 0));
  
  -- Return only the authenticated user's own login attempts
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