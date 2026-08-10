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

-- validate_refresh_token_security foi removida (IDOR: recebia p_user_id do
-- client sem checar auth.uid(), e chamava log_whatsapp_security_event que
-- também foi removida; confirmado que nunca foi aplicada em produção via
-- pg_get_function_identity_arguments). Não recriar sem checagem de posse.