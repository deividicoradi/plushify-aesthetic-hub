-- CORREÇÃO DIRETA DE SEGURANÇA PARA PROTEÇÃO DE DADOS DOS CLIENTES
-- Migração simplificada e direta

-- 1. Remover políticas RLS antigas da tabela clients
DROP POLICY IF EXISTS "clients_select_optimized" ON public.clients;
DROP POLICY IF EXISTS "clients_insert_optimized" ON public.clients;
DROP POLICY IF EXISTS "clients_update_optimized" ON public.clients;
DROP POLICY IF EXISTS "clients_delete_optimized" ON public.clients;

-- 2. Criar políticas RLS mais seguras e restritivas
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

-- 3. Remover triggers existentes antes de recriar
DROP TRIGGER IF EXISTS clients_audit_trigger ON public.clients;
DROP TRIGGER IF EXISTS clients_validate_trigger ON public.clients;

-- 4. Criar função de auditoria para mudanças nos clientes
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
  -- Determinar tipo de operação
  IF TG_OP = 'DELETE' THEN
    operation_type := 'DELETE_CLIENT';
  ELSIF TG_OP = 'INSERT' THEN
    operation_type := 'CREATE_CLIENT';
  ELSIF TG_OP = 'UPDATE' THEN
    operation_type := 'UPDATE_CLIENT';
    
    -- Verificar se dados sensíveis foram alterados
    IF (OLD.email IS DISTINCT FROM NEW.email) OR 
       (OLD.phone IS DISTINCT FROM NEW.phone) OR 
       (OLD.cpf IS DISTINCT FROM NEW.cpf) OR 
       (OLD.address IS DISTINCT FROM NEW.address) THEN
      sensitive_changed := true;
    END IF;
  END IF;

  -- Registrar evento de segurança para mudanças em dados sensíveis
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

-- 5. Criar trigger de auditoria para clientes
CREATE TRIGGER clients_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.audit_clients_changes();

-- 6. Recriar trigger de validação de CPF
CREATE TRIGGER clients_validate_trigger
  BEFORE INSERT OR UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.validate_client_cpf();

-- 7. Criar função para acesso seguro aos dados dos clientes
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
  -- Verificar se o usuário pode acessar este cliente
  IF NOT EXISTS (
    SELECT 1 FROM public.clients c 
    WHERE c.id = p_client_id AND c.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied: Client not found or unauthorized';
  END IF;
  
  -- Registrar acesso aos dados sensíveis
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
  
  -- Retornar dados do cliente com mascaramento opcional
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