-- CORREÇÃO DE SEGURANÇA SIMPLIFICADA PARA PROTEÇÃO DE DADOS DOS CLIENTES

-- 1. Primeiro, verificar quais ações são permitidas na tabela audit_logs
DO $$
DECLARE
    allowed_actions text[];
BEGIN
    -- Verificar constraint de ações permitidas
    SELECT enumvals INTO allowed_actions 
    FROM pg_enum e 
    JOIN pg_type t ON e.enumtypid = t.oid 
    WHERE t.typname LIKE '%action%' LIMIT 1;
    
    IF allowed_actions IS NULL THEN
        RAISE NOTICE 'Constraint de ações não encontrada, continuando...';
    END IF;
END $$;

-- 2. Atualizar políticas RLS para serem mais restritivas e seguras
DROP POLICY IF EXISTS "clients_select_optimized" ON public.clients;
DROP POLICY IF EXISTS "clients_insert_optimized" ON public.clients;
DROP POLICY IF EXISTS "clients_update_optimized" ON public.clients;
DROP POLICY IF EXISTS "clients_delete_optimized" ON public.clients;

-- 3. Criar políticas RLS mais seguras com validação aprimorada
CREATE POLICY "clients_select_secure" ON public.clients
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
    AND public.verify_user_access(user_id)
  );

CREATE POLICY "clients_insert_secure" ON public.clients
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
    AND public.verify_user_access(user_id)
    AND name IS NOT NULL 
    AND length(trim(name)) > 0
    AND (email IS NULL OR public.validate_email(email))
    AND (phone IS NULL OR public.validate_phone(phone))
    AND (cpf IS NULL OR public.validate_cpf(cpf))
  );

CREATE POLICY "clients_update_secure" ON public.clients
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
    AND public.verify_user_access(user_id)
  )
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
    AND public.verify_user_access(user_id)
    AND name IS NOT NULL 
    AND length(trim(name)) > 0
    AND (email IS NULL OR public.validate_email(email))
    AND (phone IS NULL OR public.validate_phone(phone))
    AND (cpf IS NULL OR public.validate_cpf(cpf))
  );

CREATE POLICY "clients_delete_secure" ON public.clients
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
    AND public.verify_user_access(user_id)
  );

-- 4. Criar função de auditoria específica para clientes (removendo triggers existentes primeiro)
DROP TRIGGER IF EXISTS clients_audit_trigger ON public.clients;
DROP TRIGGER IF EXISTS clients_validate_trigger ON public.clients;

CREATE OR REPLACE FUNCTION public.audit_clients_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

  -- Log security event for sensitive data changes usando função existente
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
$$;

-- 5. Aplicar triggers de segurança
CREATE TRIGGER clients_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.audit_clients_changes();

CREATE TRIGGER clients_validate_trigger
  BEFORE INSERT OR UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.validate_client_cpf();

-- 6. Criar função para acesso seguro aos dados dos clientes
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
SET search_path = public
AS $$
BEGIN
  -- Verify user can access this client
  IF NOT EXISTS (
    SELECT 1 FROM public.clients c 
    WHERE c.id = p_client_id AND c.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied: Client not found or unauthorized';
  END IF;
  
  -- Log access to sensitive data
  PERFORM public.log_whatsapp_security_event(
    auth.uid(),
    'CLIENT_DATA_ACCESS',
    NULL,
    'LOW',
    NULL,
    NULL,
    NULL,
    jsonb_build_object(
      'client_id', p_client_id,
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
  WHERE c.id = p_client_id AND c.user_id = auth.uid();
END;
$$;

-- 7. Comentário de documentação da correção de segurança
COMMENT ON POLICY "clients_select_secure" ON public.clients IS 
'Enhanced security policy: Only authenticated users can view their own clients with additional access verification';

COMMENT ON POLICY "clients_insert_secure" ON public.clients IS 
'Enhanced security policy: Only authenticated users can create clients with data validation (email, phone, CPF)';

COMMENT ON POLICY "clients_update_secure" ON public.clients IS 
'Enhanced security policy: Only authenticated users can update their own clients with comprehensive validation';

COMMENT ON POLICY "clients_delete_secure" ON public.clients IS 
'Enhanced security policy: Only authenticated users can delete their own clients with access verification';

COMMENT ON FUNCTION public.get_client_data_secure(uuid, boolean) IS 
'Secure function to access client data with optional sensitive data masking and full audit logging';