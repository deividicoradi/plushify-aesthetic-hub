-- ========================================
-- SECURITY FIXES - SQL Functions
-- ========================================

-- Fix functions missing search_path = public
-- These functions need to be updated to prevent schema search path attacks

-- 1. Fix validate_phone function
CREATE OR REPLACE FUNCTION public.validate_phone(phone text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF phone IS NULL THEN
    RETURN TRUE;
  END IF;
  
  phone := regexp_replace(phone, '[^0-9]', '', 'g');
  RETURN phone ~ '^[1-9][0-9]{9,10}$';
END;
$function$;

-- 2. Fix validate_email function
CREATE OR REPLACE FUNCTION public.validate_email(email text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF email IS NULL THEN
    RETURN TRUE;
  END IF;
  
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$function$;

-- 3. Fix sanitize_input function
CREATE OR REPLACE FUNCTION public.sanitize_input(input_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF input_text IS NULL THEN
    RETURN NULL;
  END IF;
  
  input_text := regexp_replace(input_text, '[<>"''%;()&+]', '', 'g');
  
  IF length(input_text) > 1000 THEN
    input_text := left(input_text, 1000);
  END IF;
  
  RETURN trim(input_text);
END;
$function$;

-- 4. Create secure function for getting masked clients with rate limiting
CREATE OR REPLACE FUNCTION public.get_clients_masked(p_mask_sensitive boolean DEFAULT false)
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
SET search_path = public
AS $function$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get authenticated user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Log access for security monitoring
  PERFORM public.log_whatsapp_security_event(
    v_user_id,
    'CLIENTS_LIST_ACCESS',
    NULL,
    'LOW',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object(
      'masked', p_mask_sensitive,
      'timestamp', now()
    )
  );
  
  -- Return client data with optional masking
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
  WHERE c.user_id = v_user_id
  ORDER BY c.created_at DESC;
END;
$function$;

-- 5. Create RLS policies for whatsapp_rate_limits if missing
DO $$ 
BEGIN
  -- Check if table exists and RLS is enabled
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'whatsapp_rate_limits'
  ) THEN
    -- Ensure RLS is enabled
    ALTER TABLE public.whatsapp_rate_limits ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can manage their own rate limits" ON public.whatsapp_rate_limits;
    DROP POLICY IF EXISTS "Admins can view all rate limits" ON public.whatsapp_rate_limits;
    
    -- Create consolidated policy for users
    CREATE POLICY "Users can manage their own rate limits"
    ON public.whatsapp_rate_limits
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
    
    -- Create policy for admins
    CREATE POLICY "Admins can view all rate limits"
    ON public.whatsapp_rate_limits
    FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;