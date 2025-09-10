-- MIGRAÇÃO DE SEGURANÇA PARA PROTEÇÃO DE DADOS PESSOAIS DOS CLIENTES

-- 1. Primeiro, vamos verificar se a tabela existe e tem a estrutura correta
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'clients') THEN
    RAISE EXCEPTION 'Tabela clients não encontrada. Esta migração deve ser executada em um banco com a tabela clients existente.';
  END IF;
END $$;

-- 2. Criar função para criptografia de tokens (se não existir)
CREATE OR REPLACE FUNCTION public.encrypt_token(token_text text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Simulação de criptografia (em produção usar pgcrypto)
  RETURN encode(digest(token_text || 'salt_key_2024', 'sha256'), 'hex');
END;
$$;

-- 3. Criar função para descriptografia de tokens (se não existir)
CREATE OR REPLACE FUNCTION public.decrypt_token(encrypted_token text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Retorna o token (em produção implementar descriptografia real)
  RETURN encrypted_token;
END;
$$;

-- 4. Função para obter plano do usuário (se não existir)
CREATE OR REPLACE FUNCTION public.get_user_plan(user_uuid uuid)
RETURNS plan_type
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_plan plan_type;
BEGIN
  SELECT 
    CASE 
      WHEN us.plan_type IS NOT NULL THEN us.plan_type
      ELSE 'trial'::plan_type
    END
  INTO user_plan
  FROM public.user_subscriptions us
  WHERE us.user_id = user_uuid
    AND us.status = 'active'
    AND (us.expires_at IS NULL OR us.expires_at > now())
  ORDER BY us.created_at DESC
  LIMIT 1;
  
  RETURN COALESCE(user_plan, 'trial'::plan_type);
END;
$$;

-- 5. Função para verificar disponibilidade de agendamento
CREATE OR REPLACE FUNCTION public.check_appointment_availability(
  p_user_id uuid,
  p_date date,
  p_time time,
  p_duration integer,
  p_exclude_appointment_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conflict_count integer;
  working_hours_active boolean;
  dow_value integer;
BEGIN
  -- Verificar se há horário de trabalho configurado para este dia
  dow_value := EXTRACT(DOW FROM p_date);
  
  SELECT EXISTS(
    SELECT 1 FROM public.working_hours wh
    WHERE wh.user_id = p_user_id
      AND wh.day_of_week = dow_value
      AND wh.is_active = true
      AND p_time >= wh.start_time
      AND (p_time + (p_duration || ' minutes')::INTERVAL)::time <= wh.end_time
  ) INTO working_hours_active;
  
  IF NOT working_hours_active THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar conflitos de agendamento
  SELECT COUNT(*)
  INTO conflict_count
  FROM public.appointments a
  WHERE a.user_id = p_user_id
    AND a.appointment_date = p_date
    AND a.status IN ('agendado', 'confirmado')
    AND (p_exclude_appointment_id IS NULL OR a.id != p_exclude_appointment_id)
    AND (
      -- Conflito: novo agendamento começa durante um existente
      (p_time >= a.appointment_time AND p_time < (a.appointment_time + (a.duration || ' minutes')::INTERVAL)::time)
      OR
      -- Conflito: novo agendamento termina durante um existente  
      ((p_time + (p_duration || ' minutes')::INTERVAL)::time > a.appointment_time AND (p_time + (p_duration || ' minutes')::INTERVAL)::time <= (a.appointment_time + (a.duration || ' minutes')::INTERVAL)::time)
      OR
      -- Conflito: novo agendamento engloba um existente
      (p_time <= a.appointment_time AND (p_time + (p_duration || ' minutes')::INTERVAL)::time >= (a.appointment_time + (a.duration || ' minutes')::INTERVAL)::time)
    );
  
  RETURN conflict_count = 0;
END;
$$;

-- 6. Função para obter horários disponíveis
CREATE OR REPLACE FUNCTION public.get_available_slots(
  p_user_id uuid,
  p_date date,
  p_duration integer,
  p_interval_minutes integer DEFAULT 30
)
RETURNS TABLE(slot_time time without time zone, is_available boolean)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  dow_value integer;
  wh_record RECORD;
  current_time time;
  end_time time;
BEGIN
  dow_value := EXTRACT(DOW FROM p_date);
  
  -- Buscar horário de trabalho para o dia
  SELECT start_time, end_time INTO wh_record
  FROM public.working_hours
  WHERE user_id = p_user_id 
    AND day_of_week = dow_value 
    AND is_active = true
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN; -- Nenhum horário de trabalho configurado
  END IF;
  
  current_time := wh_record.start_time;
  end_time := wh_record.end_time;
  
  -- Gerar slots de tempo
  WHILE current_time + (p_duration || ' minutes')::INTERVAL <= end_time::time LOOP
    RETURN QUERY SELECT 
      current_time,
      public.check_appointment_availability(p_user_id, p_date, current_time, p_duration);
    
    current_time := current_time + (p_interval_minutes || ' minutes')::INTERVAL;
  END LOOP;
END;
$$;

-- 7. Remover triggers existentes se houver para evitar conflitos
DROP TRIGGER IF EXISTS clients_security_trigger ON public.clients;
DROP TRIGGER IF EXISTS clients_audit_trigger ON public.clients;
DROP TRIGGER IF EXISTS clients_validate_trigger ON public.clients;

-- 8. Criar trigger de segurança para a tabela clients (ANTES dos dados)
CREATE OR REPLACE FUNCTION public.clients_security_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar injeção SQL
  IF public.detect_sql_injection(NEW.name) OR 
     public.detect_sql_injection(NEW.email) OR 
     public.detect_sql_injection(NEW.phone) THEN
    RAISE EXCEPTION 'Tentativa de injeção detectada e bloqueada';
  END IF;
  
  -- Sanitizar entradas
  NEW.name := public.sanitize_input(NEW.name);
  NEW.email := public.sanitize_input(NEW.email);
  NEW.phone := public.sanitize_input(NEW.phone);
  
  RETURN NEW;
END;
$$;

-- 9. Criar trigger de auditoria para clientes (DEPOIS dos dados)
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
$$;

-- 10. Aplicar triggers à tabela clients
CREATE TRIGGER clients_security_trigger
  BEFORE INSERT OR UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.clients_security_trigger();

CREATE TRIGGER clients_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.audit_clients_changes();

CREATE TRIGGER clients_validate_trigger
  BEFORE INSERT OR UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.validate_client_cpf();

-- 11. Atualizar políticas RLS para serem mais restritivas
DROP POLICY IF EXISTS "clients_select_optimized" ON public.clients;
DROP POLICY IF EXISTS "clients_insert_optimized" ON public.clients;
DROP POLICY IF EXISTS "clients_update_optimized" ON public.clients;
DROP POLICY IF EXISTS "clients_delete_optimized" ON public.clients;

-- Política SELECT mais restritiva com verificação adicional
CREATE POLICY "clients_select_secure" ON public.clients
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
    AND public.verify_user_access(user_id)
  );

-- Política INSERT com validação
CREATE POLICY "clients_insert_secure" ON public.clients
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
    AND public.verify_user_access(user_id)
    AND name IS NOT NULL 
    AND length(name) > 0
  );

-- Política UPDATE com validação
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
    AND length(name) > 0
  );

-- Política DELETE mais restritiva
CREATE POLICY "clients_delete_secure" ON public.clients
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
    AND public.verify_user_access(user_id)
  );

-- 12. Criar função para acesso seguro aos dados dos clientes
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

-- 13. Log da implementação de segurança
INSERT INTO public.audit_logs (
  user_id, table_name, record_id, action, reason, new_data
) VALUES (
  COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID),
  'clients', '00000000-0000-0000-0000-000000000000'::UUID,
  'SECURITY_ENHANCEMENT', 'Implementação de medidas de segurança para proteção de dados pessoais',
  jsonb_build_object(
    'security_features', ARRAY[
      'RLS policies enhanced',
      'Input validation triggers',
      'Audit logging',
      'Data masking functions',
      'Secure access functions'
    ],
    'timestamp', now()
  )
);