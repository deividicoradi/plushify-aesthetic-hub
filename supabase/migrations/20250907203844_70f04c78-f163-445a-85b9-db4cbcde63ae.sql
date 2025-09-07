-- Fix critical security vulnerability: Enhanced protection for clients table with sensitive customer data
-- Add additional security layers, data validation, and audit trails

-- 1. Add data masking function for sensitive fields
CREATE OR REPLACE FUNCTION public.mask_sensitive_data(input_text text, mask_type text DEFAULT 'partial')
RETURNS text
LANGUAGE plpgsql
IMMUTABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  IF input_text IS NULL OR input_text = '' THEN
    RETURN input_text;
  END IF;
  
  CASE mask_type
    WHEN 'email' THEN
      -- Mask email: user@domain.com -> u***@domain.com
      RETURN regexp_replace(input_text, '^(.{1}).*(@.*)$', '\1***\2');
    WHEN 'phone' THEN
      -- Mask phone: keep only last 4 digits
      RETURN regexp_replace(input_text, '^(.*)(.{4})$', '****\2');
    WHEN 'cpf' THEN
      -- Mask CPF: keep only last 2 digits
      RETURN regexp_replace(input_text, '^(.*)(.{2})$', '***\2');
    WHEN 'address' THEN
      -- Mask address: show only first word
      RETURN split_part(input_text, ' ', 1) || ' ***';
    ELSE
      -- Default partial masking
      RETURN left(input_text, 2) || '***';
  END CASE;
END;
$function$;

-- 2. Create audit trigger for clients table changes
CREATE OR REPLACE FUNCTION public.audit_clients_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  operation_type text;
  sensitive_changed boolean := false;
BEGIN
  -- Determine operation type
  IF TG_OP = 'DELETE' THEN
    operation_type := 'DELETE_CLIENT';
  ELSIF TG_OP = 'INSERT' THEN
    operation_type := 'CREATE_CLIENT';
  ELSIF TG_OP = 'UPDATE' THEN
    operation_type := 'UPDATE_CLIENT';
    
    -- Check if sensitive data was changed
    IF (OLD.email IS DISTINCT FROM NEW.email) OR 
       (OLD.phone IS DISTINCT FROM NEW.phone) OR 
       (OLD.cpf IS DISTINCT FROM NEW.cpf) OR 
       (OLD.address IS DISTINCT FROM NEW.address) THEN
      sensitive_changed := true;
    END IF;
  END IF;

  -- Log security event for sensitive data changes
  IF auth.uid() IS NOT NULL THEN
    PERFORM public.log_whatsapp_security_event(
      auth.uid(),
      operation_type,
      NULL,
      CASE WHEN sensitive_changed THEN 'MEDIUM' ELSE 'LOW' END,
      NULL,
      NULL,
      NULL,
      jsonb_build_object(
        'client_id', COALESCE(NEW.id, OLD.id),
        'sensitive_data_changed', sensitive_changed,
        'operation', TG_OP,
        'table_name', 'clients'
      )
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- 3. Create trigger for clients table
DROP TRIGGER IF EXISTS clients_security_audit ON public.clients;
CREATE TRIGGER clients_security_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.audit_clients_changes();

-- 4. Create secure function to retrieve client data with optional masking
CREATE OR REPLACE FUNCTION public.get_client_data_secure(
    p_client_id uuid,
    p_mask_sensitive boolean DEFAULT false
)
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
  -- Verify user can access this client
  IF NOT EXISTS (
    SELECT 1 FROM public.clients c 
    WHERE c.id = p_client_id AND c.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied: Client not found or unauthorized';
  END IF;
  
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
  WHERE c.id = p_client_id AND c.user_id = auth.uid();
END;
$function$;

-- 5. Create function to validate and sanitize client data before insertion/update
CREATE OR REPLACE FUNCTION public.validate_client_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Ensure user_id is set to authenticated user
  NEW.user_id := auth.uid();
  
  -- Validate and sanitize inputs
  IF NEW.name IS NOT NULL THEN
    NEW.name := trim(NEW.name);
    IF length(NEW.name) < 2 THEN
      RAISE EXCEPTION 'Client name must be at least 2 characters long';
    END IF;
  END IF;
  
  -- Validate email format
  IF NEW.email IS NOT NULL AND NEW.email != '' THEN
    NEW.email := lower(trim(NEW.email));
    IF NOT public.validate_email(NEW.email) THEN
      RAISE EXCEPTION 'Invalid email format';
    END IF;
  END IF;
  
  -- Validate phone format
  IF NEW.phone IS NOT NULL AND NEW.phone != '' THEN
    NEW.phone := regexp_replace(NEW.phone, '[^0-9]', '', 'g');
    IF NOT public.validate_phone(NEW.phone) THEN
      RAISE EXCEPTION 'Invalid phone format';
    END IF;
  END IF;
  
  -- Validate CPF if provided
  IF NEW.cpf IS NOT NULL AND NEW.cpf != '' THEN
    NEW.cpf := regexp_replace(NEW.cpf, '[^0-9]', '', 'g');
    IF NOT public.validate_cpf(NEW.cpf) THEN
      RAISE EXCEPTION 'Invalid CPF format';
    END IF;
  END IF;
  
  -- Check for SQL injection attempts
  IF public.detect_sql_injection(NEW.name) OR 
     public.detect_sql_injection(NEW.email) OR 
     public.detect_sql_injection(COALESCE(NEW.address, '')) THEN
    RAISE EXCEPTION 'Invalid input detected';
  END IF;
  
  -- Sanitize text inputs
  NEW.name := public.sanitize_input(NEW.name);
  NEW.address := public.sanitize_input(NEW.address);
  NEW.neighborhood := public.sanitize_input(NEW.neighborhood);
  NEW.city := public.sanitize_input(NEW.city);
  
  RETURN NEW;
END;
$function$;

-- 6. Create validation trigger for clients table
DROP TRIGGER IF EXISTS clients_validate_data ON public.clients;
CREATE TRIGGER clients_validate_data
  BEFORE INSERT OR UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.validate_client_data();

-- 7. Create function to anonymize client data for compliance
CREATE OR REPLACE FUNCTION public.anonymize_client_data(p_client_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Verify user owns this client
  IF NOT EXISTS (
    SELECT 1 FROM public.clients c 
    WHERE c.id = p_client_id AND c.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied: Client not found or unauthorized';
  END IF;
  
  -- Anonymize sensitive data
  UPDATE public.clients SET
    name = 'Anonymized Client',
    email = NULL,
    phone = NULL,
    cpf = NULL,
    address = NULL,
    neighborhood = NULL,
    city = NULL,
    state = NULL,
    cep = NULL,
    updated_at = now()
  WHERE id = p_client_id AND user_id = auth.uid();
  
  -- Log anonymization event
  PERFORM public.log_whatsapp_security_event(
    auth.uid(),
    'CLIENT_ANONYMIZED',
    NULL,
    'MEDIUM',
    NULL,
    NULL,
    NULL,
    jsonb_build_object('client_id', p_client_id, 'anonymized_at', now())
  );
  
  RETURN true;
END;
$function$;