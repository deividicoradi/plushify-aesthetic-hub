-- ================================================
-- SECURITY UPGRADE: Professionals Table
-- Objetivo: Elevar segurança ao nível da tabela clients
-- ================================================

-- 1. ADICIONAR CONSTRAINTS DE SEGURANÇA
-- ================================================

-- Garantir que user_id nunca seja NULL
ALTER TABLE public.professionals 
  ALTER COLUMN user_id SET NOT NULL;

-- Adicionar constraint para validar UUID
ALTER TABLE public.professionals 
  ADD CONSTRAINT professionals_user_id_valid 
  CHECK (user_id != '00000000-0000-0000-0000-000000000000'::uuid);

-- 2. ÍNDICE DE PERFORMANCE PARA RLS
-- ================================================

CREATE INDEX IF NOT EXISTS idx_professionals_user_id_security 
  ON public.professionals(user_id) 
  WHERE active = true;

-- 3. FUNÇÃO RPC SEGURA COM AUDITORIA
-- ================================================

CREATE OR REPLACE FUNCTION public.get_professionals_secure(
  p_mask_sensitive boolean DEFAULT false
)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  name text,
  email text,
  phone text,
  specialties text[],
  active boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Obter usuário autenticado
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Log de acesso para monitoramento de segurança
  PERFORM public.log_whatsapp_security_event(
    v_user_id,
    'PROFESSIONALS_LIST_ACCESS',
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
  
  -- Retornar dados dos profissionais com mascaramento opcional
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.name,
    CASE WHEN p_mask_sensitive THEN public.mask_sensitive_data(p.email, 'email') ELSE p.email END,
    CASE WHEN p_mask_sensitive THEN public.mask_sensitive_data(p.phone, 'phone') ELSE p.phone END,
    p.specialties,
    p.active,
    p.created_at,
    p.updated_at
  FROM public.professionals p
  WHERE p.user_id = v_user_id
  ORDER BY p.name;
END;
$$;

-- 4. FUNÇÃO PARA ACESSO INDIVIDUAL COM AUDITORIA
-- ================================================

CREATE OR REPLACE FUNCTION public.get_professional_secure(
  p_professional_id uuid,
  p_mask_sensitive boolean DEFAULT false
)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  name text,
  email text,
  phone text,
  specialties text[],
  active boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Verificar se o usuário pode acessar este profissional
  IF NOT EXISTS (
    SELECT 1 FROM public.professionals pr
    WHERE pr.id = p_professional_id AND pr.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied: Professional not found or unauthorized';
  END IF;
  
  -- Registrar acesso aos dados sensíveis
  PERFORM public.log_whatsapp_security_event(
    auth.uid(),
    'PROFESSIONAL_DATA_ACCESS',
    NULL,
    'LOW',
    NULL,
    NULL,
    NULL,
    jsonb_build_object(
      'professional_id', p_professional_id,
      'masked', p_mask_sensitive,
      'timestamp', now()
    )
  );
  
  -- Retornar dados do profissional com mascaramento opcional
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.name,
    CASE WHEN p_mask_sensitive THEN public.mask_sensitive_data(p.email, 'email') ELSE p.email END,
    CASE WHEN p_mask_sensitive THEN public.mask_sensitive_data(p.phone, 'phone') ELSE p.phone END,
    p.specialties,
    p.active,
    p.created_at,
    p.updated_at
  FROM public.professionals p
  WHERE p.id = p_professional_id AND p.user_id = auth.uid();
END;
$$;

-- 5. TRIGGER PARA AUDITORIA DE MUDANÇAS
-- ================================================

CREATE OR REPLACE FUNCTION public.audit_professionals_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  operation_type text;
  sensitive_changed boolean := false;
BEGIN
  -- Determinar tipo de operação
  IF TG_OP = 'DELETE' THEN
    operation_type := 'DELETE_PROFESSIONAL';
  ELSIF TG_OP = 'INSERT' THEN
    operation_type := 'CREATE_PROFESSIONAL';
  ELSIF TG_OP = 'UPDATE' THEN
    operation_type := 'UPDATE_PROFESSIONAL';
    
    -- Verificar se dados sensíveis foram alterados
    IF (OLD.email IS DISTINCT FROM NEW.email) OR 
       (OLD.phone IS DISTINCT FROM NEW.phone) THEN
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
        'professional_id', COALESCE(NEW.id, OLD.id),
        'sensitive_data_changed', sensitive_changed,
        'operation', TG_OP,
        'table_name', 'professionals'
      )
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Aplicar trigger
DROP TRIGGER IF EXISTS audit_professionals_trigger ON public.professionals;
CREATE TRIGGER audit_professionals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.professionals
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_professionals_changes();

-- 6. COMENTÁRIO DE DOCUMENTAÇÃO
-- ================================================

COMMENT ON TABLE public.professionals IS 
  'Tabela de profissionais com PII sensível (email, telefone). 
   Proteções: RLS RESTRICTIVE, constraints NOT NULL, auditoria automática.
   Use get_professionals_secure() RPC para acesso auditado.';

COMMENT ON FUNCTION public.get_professionals_secure IS
  'Função segura para listar profissionais com auditoria automática.
   Registra todos os acessos em whatsapp_security_logs.';

COMMENT ON FUNCTION public.get_professional_secure IS
  'Função segura para acessar dados de profissional individual com auditoria.
   Valida permissões e registra acesso a dados sensíveis.';