-- CORREÇÃO DE AVISOS DE DESEMPENHO E SEGURANÇA DO SUPABASE

-- =====================================================
-- 1. CORRIGIR POLÍTICAS RLS PARA FINANCIAL_TRANSACTIONS
-- =====================================================

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "financial_transactions_select_policy" ON public.financial_transactions;
DROP POLICY IF EXISTS "financial_transactions_insert_policy" ON public.financial_transactions;
DROP POLICY IF EXISTS "financial_transactions_update_policy" ON public.financial_transactions;
DROP POLICY IF EXISTS "financial_transactions_delete_policy" ON public.financial_transactions;

-- Criar políticas RLS otimizadas para financial_transactions
CREATE POLICY "financial_transactions_select_policy" ON public.financial_transactions
FOR SELECT USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "financial_transactions_insert_policy" ON public.financial_transactions
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "financial_transactions_update_policy" ON public.financial_transactions
FOR UPDATE USING (auth.uid() IS NOT NULL AND user_id = auth.uid())
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "financial_transactions_delete_policy" ON public.financial_transactions
FOR DELETE USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- =====================================================
-- 2. CORRIGIR POLÍTICAS RLS PARA NOTES
-- =====================================================

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "notes_select_policy" ON public.notes;
DROP POLICY IF EXISTS "notes_insert_policy" ON public.notes;
DROP POLICY IF EXISTS "notes_update_policy" ON public.notes;
DROP POLICY IF EXISTS "notes_delete_policy" ON public.notes;

-- Criar políticas RLS otimizadas para notes
CREATE POLICY "notes_select_policy" ON public.notes
FOR SELECT USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "notes_insert_policy" ON public.notes
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "notes_update_policy" ON public.notes
FOR UPDATE USING (auth.uid() IS NOT NULL AND user_id = auth.uid())
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "notes_delete_policy" ON public.notes
FOR DELETE USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- =====================================================
-- 3. ADICIONAR ÍNDICES DE PERFORMANCE OTIMIZADOS
-- =====================================================

-- Índices para financial_transactions
CREATE INDEX IF NOT EXISTS idx_financial_transactions_user_date 
ON public.financial_transactions(user_id, transaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_financial_transactions_type_category 
ON public.financial_transactions(user_id, type, category);

CREATE INDEX IF NOT EXISTS idx_financial_transactions_appointment 
ON public.financial_transactions(appointment_id) WHERE appointment_id IS NOT NULL;

-- Índices para notes
CREATE INDEX IF NOT EXISTS idx_notes_user_updated 
ON public.notes(user_id, updated_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_notes_title_search 
ON public.notes USING gin(to_tsvector('portuguese', title)) WHERE user_id IS NOT NULL;

-- Índices para clients (otimização)
CREATE INDEX IF NOT EXISTS idx_clients_name_search 
ON public.clients USING gin(to_tsvector('portuguese', name)) WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_clients_email_unique 
ON public.clients(user_id, email) WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_clients_phone_search 
ON public.clients(user_id, phone) WHERE phone IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_clients_status_active 
ON public.clients(user_id, status) WHERE status = 'Ativo';

-- Índices para payments (otimização)
CREATE INDEX IF NOT EXISTS idx_payments_client_status 
ON public.payments(user_id, client_id, status) WHERE client_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payments_due_date_pending 
ON public.payments(due_date ASC) WHERE status = 'pendente' AND due_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payments_amount_range 
ON public.payments(user_id, amount) WHERE amount > 0;

-- Índices para expenses (otimização)
CREATE INDEX IF NOT EXISTS idx_expenses_category_date 
ON public.expenses(user_id, category, expense_date DESC);

CREATE INDEX IF NOT EXISTS idx_expenses_payment_method 
ON public.expenses(user_id, payment_method_id) WHERE payment_method_id IS NOT NULL;

-- Índices para appointments (otimização)
CREATE INDEX IF NOT EXISTS idx_appointments_client_date 
ON public.appointments(user_id, client_id, appointment_date DESC) WHERE client_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_service_date 
ON public.appointments(user_id, service_id, appointment_date DESC) WHERE service_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_status_date 
ON public.appointments(user_id, status, appointment_date DESC);

-- Índices para services (otimização)
CREATE INDEX IF NOT EXISTS idx_services_active_price 
ON public.services(user_id, active, price DESC) WHERE active = true;

CREATE INDEX IF NOT EXISTS idx_services_category_active 
ON public.services(user_id, category) WHERE active = true AND category IS NOT NULL;

-- Índices para products (otimização)
CREATE INDEX IF NOT EXISTS idx_products_stock_low 
ON public.products(user_id, stock_quantity) WHERE active = true AND stock_quantity <= min_stock_level;

CREATE INDEX IF NOT EXISTS idx_products_category_active 
ON public.products(user_id, category) WHERE active = true AND category IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_products_sku_unique 
ON public.products(user_id, sku) WHERE sku IS NOT NULL;

-- Índices para cash_openings (otimização)
CREATE INDEX IF NOT EXISTS idx_cash_openings_status_date 
ON public.cash_openings(user_id, status, opening_date DESC);

-- Índices para cash_closures (otimização)
CREATE INDEX IF NOT EXISTS idx_cash_closures_status_date 
ON public.cash_closures(user_id, status, closure_date DESC);

-- Índices para installments (otimização)
CREATE INDEX IF NOT EXISTS idx_installments_payment_number 
ON public.installments(payment_id, installment_number);

CREATE INDEX IF NOT EXISTS idx_installments_due_status 
ON public.installments(user_id, due_date ASC, status) WHERE status IN ('pendente', 'vencido');

-- =====================================================
-- 4. OTIMIZAÇÕES DE PERFORMANCE PARA CONSULTAS
-- =====================================================

-- Função otimizada para busca de dados do dashboard
CREATE OR REPLACE FUNCTION public.get_dashboard_summary(target_user_id UUID)
RETURNS TABLE(
  total_clients BIGINT,
  total_payments NUMERIC,
  pending_payments BIGINT,
  total_expenses NUMERIC,
  active_services BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.clients WHERE user_id = target_user_id AND status = 'Ativo') as total_clients,
    (SELECT COALESCE(SUM(amount), 0) FROM public.payments WHERE user_id = target_user_id AND status = 'pago') as total_payments,
    (SELECT COUNT(*) FROM public.payments WHERE user_id = target_user_id AND status = 'pendente') as pending_payments,
    (SELECT COALESCE(SUM(amount), 0) FROM public.expenses WHERE user_id = target_user_id) as total_expenses,
    (SELECT COUNT(*) FROM public.services WHERE user_id = target_user_id AND active = true) as active_services;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public';

-- Função para busca otimizada de clientes
CREATE OR REPLACE FUNCTION public.search_clients(target_user_id UUID, search_term TEXT DEFAULT NULL)
RETURNS TABLE(
  id UUID,
  name TEXT,
  email TEXT,
  phone TEXT,
  status TEXT,
  last_visit TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.name, c.email, c.phone, c.status, c.last_visit
  FROM public.clients c
  WHERE c.user_id = target_user_id
    AND (search_term IS NULL OR c.name ILIKE '%' || search_term || '%' OR c.email ILIKE '%' || search_term || '%')
  ORDER BY c.name ASC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public';

-- =====================================================
-- 5. CONFIGURAÇÕES DE PERFORMANCE
-- =====================================================

-- Configurar VACUUM automático para tabelas principais
ALTER TABLE public.clients SET (autovacuum_vacuum_scale_factor = 0.1);
ALTER TABLE public.payments SET (autovacuum_vacuum_scale_factor = 0.1);
ALTER TABLE public.appointments SET (autovacuum_vacuum_scale_factor = 0.1);
ALTER TABLE public.expenses SET (autovacuum_vacuum_scale_factor = 0.1);

-- Configurar análises automáticas para otimização de consultas
ALTER TABLE public.clients SET (autovacuum_analyze_scale_factor = 0.05);
ALTER TABLE public.payments SET (autovacuum_analyze_scale_factor = 0.05);
ALTER TABLE public.appointments SET (autovacuum_analyze_scale_factor = 0.05);
ALTER TABLE public.expenses SET (autovacuum_analyze_scale_factor = 0.05);

-- =====================================================
-- 6. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON INDEX idx_financial_transactions_user_date IS 'Índice otimizado para consultas de transações por usuário e data';
COMMENT ON INDEX idx_notes_user_updated IS 'Índice otimizado para consultas de notas por usuário e data de atualização';
COMMENT ON INDEX idx_clients_name_search IS 'Índice de busca de texto completo para nomes de clientes';
COMMENT ON INDEX idx_payments_due_date_pending IS 'Índice otimizado para consultas de pagamentos pendentes por data de vencimento';
COMMENT ON FUNCTION public.get_dashboard_summary IS 'Função otimizada para buscar dados resumidos do dashboard';
COMMENT ON FUNCTION public.search_clients IS 'Função otimizada para busca de clientes com filtro de texto';