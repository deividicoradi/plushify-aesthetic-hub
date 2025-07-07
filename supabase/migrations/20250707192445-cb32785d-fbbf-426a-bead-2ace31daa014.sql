-- CORREÇÃO DE AVISOS DE SEGURANÇA - DEFINIR SEARCH_PATH PARA FUNÇÕES

-- =====================================================
-- CORRIGIR SEARCH_PATH PARA TODAS AS FUNÇÕES
-- =====================================================

-- 1. update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path TO 'public';

-- 2. verify_user_access
CREATE OR REPLACE FUNCTION public.verify_user_access(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar se o usuário está autenticado
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar se o user_id corresponde ao usuário autenticado
  IF target_user_id != auth.uid() THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public';

-- 3. log_unauthorized_access
CREATE OR REPLACE FUNCTION public.log_unauthorized_access(table_name TEXT, attempted_user_id UUID, actual_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    reason,
    new_data
  ) VALUES (
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::UUID),
    'UNAUTHORIZED_ACCESS_ATTEMPT',
    table_name,
    attempted_user_id,
    'User attempted to access data from different user',
    jsonb_build_object(
      'attempted_user_id', attempted_user_id,
      'actual_user_id', actual_user_id,
      'timestamp', now()
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- 4. verify_data_integrity
CREATE OR REPLACE FUNCTION public.verify_data_integrity(check_user_id UUID)
RETURNS TABLE(table_name TEXT, total_records BIGINT, unauthorized_records BIGINT, status TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT 'clients'::TEXT, 
         COUNT(*)::BIGINT, 
         COUNT(*) FILTER (WHERE user_id != check_user_id)::BIGINT,
         CASE WHEN COUNT(*) FILTER (WHERE user_id != check_user_id) = 0 
              THEN 'SECURE' 
              ELSE 'BREACH DETECTED' 
         END::TEXT
  FROM public.clients 
  WHERE user_id = check_user_id;
  
  RETURN QUERY
  SELECT 'appointments'::TEXT, 
         COUNT(*)::BIGINT, 
         COUNT(*) FILTER (WHERE user_id != check_user_id)::BIGINT,
         CASE WHEN COUNT(*) FILTER (WHERE user_id != check_user_id) = 0 
              THEN 'SECURE' 
              ELSE 'BREACH DETECTED' 
         END::TEXT
  FROM public.appointments 
  WHERE user_id = check_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- 5. update_product_stock
CREATE OR REPLACE FUNCTION public.update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar o estoque do produto
  UPDATE public.products 
  SET stock_quantity = NEW.new_stock,
      updated_at = now()
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path TO 'public';

-- 6. validate_email
CREATE OR REPLACE FUNCTION public.validate_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  IF email IS NULL THEN
    RETURN TRUE; -- NULL é válido
  END IF;
  
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path TO 'public';

-- 7. validate_phone
CREATE OR REPLACE FUNCTION public.validate_phone(phone TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  IF phone IS NULL THEN
    RETURN TRUE; -- NULL é válido
  END IF;
  
  -- Remover caracteres especiais
  phone := regexp_replace(phone, '[^0-9]', '', 'g');
  
  -- Verificar formato brasileiro (10 ou 11 dígitos)
  RETURN phone ~ '^[1-9][0-9]{9,10}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path TO 'public';

-- 8. detect_sql_injection
CREATE OR REPLACE FUNCTION public.detect_sql_injection(input_text TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  malicious_patterns TEXT[] := ARRAY[
    'union\s+select', 'drop\s+table', 'delete\s+from', 'insert\s+into',
    'update\s+set', 'exec\s*\(', 'execute\s*\(', 'sp_executesql',
    'xp_cmdshell', 'script\s*>', '<\s*script', 'javascript:',
    'vbscript:', 'onload\s*=', 'onerror\s*=', 'eval\s*\(',
    'expression\s*\(', 'url\s*\(', 'import\s*\('
  ];
  pattern TEXT;
BEGIN
  IF input_text IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Converter para minúsculo para verificação
  input_text := lower(input_text);
  
  -- Verificar cada padrão malicioso
  FOREACH pattern IN ARRAY malicious_patterns
  LOOP
    IF input_text ~* pattern THEN
      RETURN TRUE;
    END IF;
  END LOOP;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path TO 'public';

-- 9. sanitize_input
CREATE OR REPLACE FUNCTION public.sanitize_input(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  IF input_text IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Remover caracteres perigosos
  input_text := regexp_replace(input_text, '[<>\"''%;()&+]', '', 'g');
  
  -- Limitar tamanho
  IF length(input_text) > 1000 THEN
    input_text := left(input_text, 1000);
  END IF;
  
  RETURN trim(input_text);
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path TO 'public';

-- 10. audit_trigger_function
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  old_data JSONB;
  new_data JSONB;
  operation_type TEXT;
BEGIN
  -- Determinar tipo de operação
  IF TG_OP = 'DELETE' THEN
    old_data := to_jsonb(OLD);
    operation_type := 'DELETE';
  ELSIF TG_OP = 'INSERT' THEN
    new_data := to_jsonb(NEW);
    operation_type := 'INSERT';
  ELSIF TG_OP = 'UPDATE' THEN
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
    operation_type := 'UPDATE';
  END IF;

  -- Inserir no log de auditoria (apenas se tiver usuário autenticado)
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO public.audit_logs (
      user_id,
      table_name,
      record_id,
      action,
      old_data,
      new_data,
      reason
    ) VALUES (
      auth.uid(),
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      operation_type,
      old_data,
      new_data,
      'Automatic audit trigger'
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- 11. clients_security_trigger
CREATE OR REPLACE FUNCTION public.clients_security_trigger()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SET search_path TO 'public';

-- 12. comprehensive_security_check
CREATE OR REPLACE FUNCTION public.comprehensive_security_check(check_user_id UUID)
RETURNS TABLE(table_name TEXT, check_type TEXT, status TEXT, details TEXT) AS $$
BEGIN
  -- Verificar integridade de dados por usuário
  RETURN QUERY
  SELECT 'clients'::TEXT, 'data_integrity'::TEXT,
         CASE WHEN COUNT(*) FILTER (WHERE user_id != check_user_id) = 0 
              THEN 'SECURE' ELSE 'BREACH_DETECTED' END::TEXT,
         'Found ' || COUNT(*) FILTER (WHERE user_id != check_user_id) || ' unauthorized records'::TEXT
  FROM public.clients WHERE user_id = check_user_id;

  -- Verificar valores suspeitos em payments
  RETURN QUERY
  SELECT 'payments'::TEXT, 'suspicious_amounts'::TEXT,
         CASE WHEN COUNT(*) = 0 THEN 'CLEAN' ELSE 'SUSPICIOUS' END::TEXT,
         'Found ' || COUNT(*) || ' payments with suspicious amounts'::TEXT
  FROM public.payments 
  WHERE user_id = check_user_id AND (amount <= 0 OR amount > 1000000);

  -- Verificar tentativas de injeção nos últimos 7 dias
  RETURN QUERY
  SELECT 'audit_logs'::TEXT, 'injection_attempts'::TEXT,
         CASE WHEN COUNT(*) = 0 THEN 'CLEAN' ELSE 'ATTACKS_DETECTED' END::TEXT,
         'Found ' || COUNT(*) || ' potential injection attempts'::TEXT
  FROM public.audit_logs 
  WHERE user_id = check_user_id 
    AND created_at >= NOW() - INTERVAL '7 days'
    AND reason LIKE '%injection%';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- 13. cleanup_old_audit_logs
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Manter apenas logs dos últimos 90 dias
  DELETE FROM public.audit_logs 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  INSERT INTO public.audit_logs (
    user_id, table_name, record_id, action, reason, new_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000'::UUID,
    'audit_logs', '00000000-0000-0000-0000-000000000000'::UUID,
    'CLEANUP', 'Automatic cleanup executed',
    jsonb_build_object('deleted_records', deleted_count)
  );
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Comentário final
COMMENT ON FUNCTION public.update_updated_at_column IS 'Função para atualizar automaticamente updated_at - com search_path seguro';
COMMENT ON FUNCTION public.verify_user_access IS 'Função para verificar acesso do usuário - com search_path seguro';
COMMENT ON FUNCTION public.log_unauthorized_access IS 'Função para log de acesso não autorizado - com search_path seguro';
COMMENT ON FUNCTION public.verify_data_integrity IS 'Função para verificar integridade de dados - com search_path seguro';
COMMENT ON FUNCTION public.update_product_stock IS 'Função para atualizar estoque de produtos - com search_path seguro';
COMMENT ON FUNCTION public.validate_email IS 'Função para validar email - com search_path seguro';
COMMENT ON FUNCTION public.validate_phone IS 'Função para validar telefone - com search_path seguro';
COMMENT ON FUNCTION public.detect_sql_injection IS 'Função para detectar injeção SQL - com search_path seguro';
COMMENT ON FUNCTION public.sanitize_input IS 'Função para sanitizar entrada - com search_path seguro';
COMMENT ON FUNCTION public.audit_trigger_function IS 'Função de trigger de auditoria - com search_path seguro';
COMMENT ON FUNCTION public.clients_security_trigger IS 'Função de trigger de segurança para clientes - com search_path seguro';
COMMENT ON FUNCTION public.comprehensive_security_check IS 'Função para verificação completa de segurança - com search_path seguro';
COMMENT ON FUNCTION public.cleanup_old_audit_logs IS 'Função para limpeza de logs antigos - com search_path seguro';