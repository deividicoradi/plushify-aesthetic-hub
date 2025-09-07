-- Critical Security Fixes Migration

-- 1. Add secure password verification function to replace re-authentication
CREATE OR REPLACE FUNCTION public.verify_authorization_password(
    p_password text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    stored_hash text;
    user_exists boolean;
BEGIN
    -- Check if user has authorization password set
    SELECT password_hash INTO stored_hash
    FROM public.authorization_passwords
    WHERE user_id = auth.uid();
    
    -- If no password set, require setup first
    IF stored_hash IS NULL THEN
        RAISE EXCEPTION 'Authorization password not configured. Please set up your authorization password first.';
    END IF;
    
    -- Verify password using crypt function
    RETURN crypt(p_password, stored_hash) = stored_hash;
EXCEPTION
    WHEN others THEN
        -- Log failed verification attempt
        PERFORM public.log_whatsapp_security_event(
            auth.uid(),
            'AUTHORIZATION_PASSWORD_FAILED',
            NULL,
            'HIGH',
            NULL,
            NULL,
            NULL,
            jsonb_build_object('error', SQLERRM)
        );
        RETURN false;
END;
$function$;

-- 2. Add function to set authorization password securely
CREATE OR REPLACE FUNCTION public.set_authorization_password(
    p_password text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    password_hash text;
BEGIN
    -- Validate password strength (minimum 6 characters)
    IF length(p_password) < 6 THEN
        RAISE EXCEPTION 'Authorization password must be at least 6 characters long';
    END IF;
    
    -- Generate secure hash
    password_hash := crypt(p_password, gen_salt('bf', 10));
    
    -- Insert or update password
    INSERT INTO public.authorization_passwords (user_id, password_hash)
    VALUES (auth.uid(), password_hash)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        password_hash = EXCLUDED.password_hash,
        updated_at = now();
    
    -- Log password change
    PERFORM public.log_whatsapp_security_event(
        auth.uid(),
        'AUTHORIZATION_PASSWORD_SET',
        NULL,
        'MEDIUM',
        NULL,
        NULL,
        NULL,
        jsonb_build_object('timestamp', now())
    );
    
    RETURN true;
EXCEPTION
    WHEN others THEN
        RAISE EXCEPTION 'Failed to set authorization password: %', SQLERRM;
END;
$function$;

-- 3. Fix search_path for existing SECURITY DEFINER functions
CREATE OR REPLACE FUNCTION public.encrypt_token(token text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  IF token IS NULL OR token = '' THEN
    RETURN NULL;
  END IF;
  RETURN encode(pgp_sym_encrypt(token, current_setting('app.jwt_secret', true)), 'base64');
END;
$function$;

CREATE OR REPLACE FUNCTION public.decrypt_token(encrypted_token text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  IF encrypted_token IS NULL OR encrypted_token = '' THEN
    RETURN NULL;
  END IF;
  RETURN pgp_sym_decrypt(decode(encrypted_token, 'base64'), current_setting('app.jwt_secret', true));
END;
$function$;

-- 4. Remove plaintext token columns from whatsapp_sessions (if they exist)
-- First check if columns exist to avoid errors
DO $$ 
BEGIN
    -- Remove access_token column if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'whatsapp_sessions' 
        AND column_name = 'access_token'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.whatsapp_sessions DROP COLUMN access_token;
    END IF;
    
    -- Remove refresh_token column if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'whatsapp_sessions' 
        AND column_name = 'refresh_token'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.whatsapp_sessions DROP COLUMN refresh_token;
    END IF;
END $$;

-- 5. Add secure client data access function with PII masking
CREATE OR REPLACE FUNCTION public.get_clients_masked(p_mask_sensitive boolean DEFAULT true)
RETURNS TABLE(
    id uuid,
    name text,
    email text,
    phone text,
    cpf text,
    address text,
    neighborhood text,
    city text,
    state text,
    cep text,
    status text,
    payment_method text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    last_visit timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        CASE WHEN p_mask_sensitive THEN public.mask_sensitive_data(c.email, 'email') ELSE c.email END,
        CASE WHEN p_mask_sensitive THEN public.mask_sensitive_data(c.phone, 'phone') ELSE c.phone END,
        CASE WHEN p_mask_sensitive THEN public.mask_sensitive_data(c.cpf, 'cpf') ELSE c.cpf END,
        CASE WHEN p_mask_sensitive THEN public.mask_sensitive_data(c.address, 'address') ELSE c.address END,
        c.neighborhood,
        c.city,
        c.state,
        c.cep,
        c.status,
        c.payment_method,
        c.created_at,
        c.updated_at,
        c.last_visit
    FROM public.clients c
    WHERE c.user_id = auth.uid()
    ORDER BY c.created_at DESC;
END;
$function$;

-- 6. Update all security definer functions to have proper search_path
CREATE OR REPLACE FUNCTION public.cleanup_expired_whatsapp_sessions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  expired_count INTEGER := 0;
  session_record RECORD;
BEGIN
  -- Buscar e log sessões expiradas
  FOR session_record IN 
    SELECT user_id, session_id 
    FROM public.whatsapp_sessions 
    WHERE expires_at < now() AND status != 'expirado'
  LOOP
    -- Log da expiração
    INSERT INTO public.whatsapp_session_logs (user_id, session_id, event, metadata)
    VALUES (session_record.user_id, session_record.session_id, 'SESSION_EXPIRED', 
            jsonb_build_object('expired_at', now()));
            
    expired_count := expired_count + 1;
  END LOOP;
  
  -- Marcar sessões como expiradas
  UPDATE public.whatsapp_sessions 
  SET status = 'expirado', 
      updated_at = now()
  WHERE expires_at < now() AND status != 'expirado';
  
  RETURN expired_count;
END;
$function$;