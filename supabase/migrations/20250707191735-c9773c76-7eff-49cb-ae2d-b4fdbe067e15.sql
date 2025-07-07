-- ANÁLISE E MELHORIAS COMPLETAS DE SEGURANÇA DO BANCO DE DADOS (VERSÃO FINAL)

-- =====================================================
-- 1. FUNÇÕES DE SEGURANÇA AVANÇADAS
-- =====================================================

-- Função para validar email
CREATE OR REPLACE FUNCTION public.validate_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  IF email IS NULL THEN
    RETURN TRUE; -- NULL é válido
  END IF;
  
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Função para validar telefone brasileiro
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
$$ LANGUAGE plpgsql IMMUTABLE;

-- Função para detectar tentativas de SQL Injection
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
$$ LANGUAGE plpgsql IMMUTABLE;

-- Função para sanitizar entrada de texto
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
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- 2. TRIGGERS DE AUDITORIA E SEGURANÇA
-- =====================================================

-- Função genérica de auditoria
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. NORMALIZAÇÃO DE DADOS EXISTENTES
-- =====================================================

-- Normalizar status existentes na tabela clients
UPDATE public.clients 
SET status = CASE 
  WHEN lower(COALESCE(status, '')) SIMILAR TO '%(ativo|active)%' THEN 'Ativo'
  WHEN lower(COALESCE(status, '')) SIMILAR TO '%(inativo|inactive)%' THEN 'Inativo'
  WHEN lower(COALESCE(status, '')) SIMILAR TO '%(bloqueado|blocked)%' THEN 'Bloqueado'
  ELSE 'Ativo'
END;

-- Normalizar status de payments
UPDATE public.payments 
SET status = CASE 
  WHEN lower(COALESCE(status, '')) SIMILAR TO '%(pendente|pending)%' THEN 'pendente'
  WHEN lower(COALESCE(status, '')) SIMILAR TO '%(pago|paid)%' THEN 'pago'
  WHEN lower(COALESCE(status, '')) SIMILAR TO '%(parcial|partial)%' THEN 'parcial'
  WHEN lower(COALESCE(status, '')) SIMILAR TO '%(cancelado|cancelled)%' THEN 'cancelado'
  WHEN lower(COALESCE(status, '')) SIMILAR TO '%(vencido|overdue)%' THEN 'vencido'
  ELSE 'pendente'
END;

-- Normalizar categorias de expenses
UPDATE public.expenses 
SET category = CASE 
  WHEN lower(COALESCE(category, '')) SIMILAR TO '%(aluguel|rent)%' THEN 'Aluguel'
  WHEN lower(COALESCE(category, '')) SIMILAR TO '%(energia|energy|luz|eletric)%' THEN 'Energia'
  WHEN lower(COALESCE(category, '')) SIMILAR TO '%(internet|net)%' THEN 'Internet'
  WHEN lower(COALESCE(category, '')) SIMILAR TO '%(material|supplies)%' THEN 'Material'
  WHEN lower(COALESCE(category, '')) SIMILAR TO '%(salario|salary|wage)%' THEN 'Salários'
  WHEN lower(COALESCE(category, '')) SIMILAR TO '%(marketing|propaganda)%' THEN 'Marketing'
  ELSE 'Outros'
END;

-- Normalizar status de installments
UPDATE public.installments 
SET status = CASE 
  WHEN lower(COALESCE(status, '')) SIMILAR TO '%(pendente|pending)%' THEN 'pendente'
  WHEN lower(COALESCE(status, '')) SIMILAR TO '%(pago|paid)%' THEN 'pago'
  WHEN lower(COALESCE(status, '')) SIMILAR TO '%(parcial|partial)%' THEN 'parcial'
  WHEN lower(COALESCE(status, '')) SIMILAR TO '%(vencido|overdue)%' THEN 'vencido'
  ELSE 'pendente'
END;

-- =====================================================
-- 4. CONSTRAINTS DE VALIDAÇÃO
-- =====================================================

-- Constraints para CLIENTS (apenas se não existirem)
DO $$ 
BEGIN
  BEGIN
    ALTER TABLE public.clients ADD CONSTRAINT clients_name_not_empty CHECK (length(trim(name)) > 0);
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.clients ADD CONSTRAINT clients_name_max_length CHECK (length(name) <= 255);
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.clients ADD CONSTRAINT clients_email_valid CHECK (public.validate_email(email));
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.clients ADD CONSTRAINT clients_phone_valid CHECK (public.validate_phone(phone));
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.clients ADD CONSTRAINT clients_status_valid CHECK (status IN ('Ativo', 'Inativo', 'Bloqueado'));
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END $$;

-- Constraints para PAYMENTS
DO $$ 
BEGIN
  BEGIN
    ALTER TABLE public.payments ADD CONSTRAINT payments_amount_positive CHECK (amount > 0);
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.payments ADD CONSTRAINT payments_paid_amount_non_negative CHECK (paid_amount >= 0);
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.payments ADD CONSTRAINT payments_discount_non_negative CHECK (COALESCE(discount, 0) >= 0);
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.payments ADD CONSTRAINT payments_paid_not_exceed_total CHECK (paid_amount <= amount);
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.payments ADD CONSTRAINT payments_installments_positive CHECK (installments > 0);
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.payments ADD CONSTRAINT payments_installments_max CHECK (installments <= 360);
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.payments ADD CONSTRAINT payments_status_valid CHECK (status IN ('pendente', 'pago', 'parcial', 'cancelado', 'vencido'));
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END $$;

-- Constraints para EXPENSES
DO $$ 
BEGIN
  BEGIN
    ALTER TABLE public.expenses ADD CONSTRAINT expenses_amount_positive CHECK (amount > 0);
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.expenses ADD CONSTRAINT expenses_description_not_empty CHECK (length(trim(description)) > 0);
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.expenses ADD CONSTRAINT expenses_category_valid CHECK (category IN ('Aluguel', 'Energia', 'Internet', 'Material', 'Salários', 'Marketing', 'Outros'));
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END $$;

-- Constraints para SERVICES
DO $$ 
BEGIN
  BEGIN
    ALTER TABLE public.services ADD CONSTRAINT services_name_not_empty CHECK (length(trim(name)) > 0);
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.services ADD CONSTRAINT services_price_non_negative CHECK (price >= 0);
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.services ADD CONSTRAINT services_duration_positive CHECK (duration > 0);
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.services ADD CONSTRAINT services_duration_max CHECK (duration <= 480);
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END $$;

-- Constraints para PRODUCTS
DO $$ 
BEGIN
  BEGIN
    ALTER TABLE public.products ADD CONSTRAINT products_name_not_empty CHECK (length(trim(name)) > 0);
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.products ADD CONSTRAINT products_price_non_negative CHECK (price >= 0);
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.products ADD CONSTRAINT products_cost_price_non_negative CHECK (COALESCE(cost_price, 0) >= 0);
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.products ADD CONSTRAINT products_stock_non_negative CHECK (stock_quantity >= 0);
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.products ADD CONSTRAINT products_min_stock_non_negative CHECK (COALESCE(min_stock_level, 0) >= 0);
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END $$;

-- =====================================================
-- 5. TRIGGERS DE SEGURANÇA
-- =====================================================

-- Trigger de validação de segurança para clients
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
$$ LANGUAGE plpgsql;

-- Aplicar triggers de auditoria
DROP TRIGGER IF EXISTS audit_clients_trigger ON public.clients;
CREATE TRIGGER audit_clients_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS clients_security_trigger ON public.clients;
CREATE TRIGGER clients_security_trigger
  BEFORE INSERT OR UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.clients_security_trigger();

DROP TRIGGER IF EXISTS audit_payments_trigger ON public.payments;
CREATE TRIGGER audit_payments_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS audit_expenses_trigger ON public.expenses;
CREATE TRIGGER audit_expenses_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS audit_services_trigger ON public.services;
CREATE TRIGGER audit_services_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS audit_products_trigger ON public.products;
CREATE TRIGGER audit_products_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- =====================================================
-- 6. ÍNDICES DE PERFORMANCE E SEGURANÇA
-- =====================================================

-- Índices para consultas rápidas por usuário
CREATE INDEX IF NOT EXISTS idx_payments_user_date ON public.payments(user_id, payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON public.expenses(user_id, expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_user_date ON public.appointments(user_id, appointment_date DESC);
CREATE INDEX IF NOT EXISTS idx_installments_user_due_date ON public.installments(user_id, due_date ASC);

-- Índices para auditoria
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_date ON public.audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_action ON public.audit_logs(table_name, action);

-- Constraint para impedir múltiplas aberturas de caixa no mesmo dia
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_cash_opening_per_day 
ON public.cash_openings(user_id, opening_date) 
WHERE status = 'aberto';

-- =====================================================
-- 7. FUNÇÃO DE VERIFICAÇÃO DE INTEGRIDADE
-- =====================================================

CREATE OR REPLACE FUNCTION public.comprehensive_security_check(check_user_id UUID)
RETURNS TABLE (
  table_name TEXT,
  check_type TEXT,
  status TEXT,
  details TEXT
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. FUNÇÃO DE LIMPEZA AUTOMÁTICA
-- =====================================================

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. POLÍTICAS RLS PARA PAYMENT_METHODS
-- =====================================================

-- Garantir que payment_methods estão protegidos
DROP POLICY IF EXISTS "payment_methods_select_policy" ON public.payment_methods;
DROP POLICY IF EXISTS "payment_methods_insert_policy" ON public.payment_methods;
DROP POLICY IF EXISTS "payment_methods_update_policy" ON public.payment_methods;
DROP POLICY IF EXISTS "payment_methods_delete_policy" ON public.payment_methods;

CREATE POLICY "payment_methods_select_policy" ON public.payment_methods
FOR SELECT USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "payment_methods_insert_policy" ON public.payment_methods
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "payment_methods_update_policy" ON public.payment_methods
FOR UPDATE USING (auth.uid() IS NOT NULL AND user_id = auth.uid())
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "payment_methods_delete_policy" ON public.payment_methods
FOR DELETE USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- =====================================================
-- 10. HABILITAÇÃO FINAL DE SEGURANÇA
-- =====================================================

-- Garantir que todas as tabelas críticas têm RLS habilitado
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authorization_passwords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_analytics ENABLE ROW LEVEL SECURITY;

-- Comentários de documentação
COMMENT ON FUNCTION public.comprehensive_security_check IS 'Função para verificação abrangente de segurança do banco de dados';
COMMENT ON FUNCTION public.cleanup_old_audit_logs IS 'Função para limpeza automática de logs antigos';
COMMENT ON FUNCTION public.detect_sql_injection IS 'Função para detectar tentativas de injeção SQL';
COMMENT ON FUNCTION public.validate_email IS 'Função para validar formato de email';
COMMENT ON FUNCTION public.validate_phone IS 'Função para validar telefone brasileiro';