-- Create secure function to get clients with proper masking
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
AS $$
BEGIN
  -- Verify user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Access denied: Authentication required';
  END IF;
  
  -- Log access attempt for audit purposes
  PERFORM public.log_whatsapp_security_event(
    auth.uid(),
    'CLIENT_DATA_ACCESS',
    NULL,
    CASE WHEN p_mask_sensitive THEN 'LOW' ELSE 'MEDIUM' END,
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object(
      'masked', p_mask_sensitive,
      'user_id', auth.uid()
    )
  );
  
  -- Return client data with optional sensitive data masking
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
  ORDER BY c.name;
END;
$$;

-- Create function to encrypt sensitive client data  
CREATE OR REPLACE FUNCTION public.encrypt_token(input_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF input_text IS NULL OR input_text = '' THEN
    RETURN input_text;
  END IF;
  
  -- Use pgcrypto for encryption (simplified version for demo)
  -- In production, use proper key management
  RETURN encode(digest(input_text || 'secret_salt', 'sha256'), 'hex');
END;
$$;

-- Create function to decrypt sensitive client data
CREATE OR REPLACE FUNCTION public.decrypt_token(encrypted_text text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This is a simplified implementation
  -- In production, implement proper decryption
  RETURN encrypted_text;
END;
$$;