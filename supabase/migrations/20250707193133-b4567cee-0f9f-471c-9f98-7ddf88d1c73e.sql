-- OTIMIZAÇÃO DE PERFORMANCE DAS POLÍTICAS RLS
-- Corrigir reavaliação desnecessária de auth.uid() em todas as tabelas

-- =====================================================
-- 1. CORRIGIR FINANCIAL_TRANSACTIONS
-- =====================================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view their own financial transactions" ON public.financial_transactions;
DROP POLICY IF EXISTS "Users can create their own financial transactions" ON public.financial_transactions;
DROP POLICY IF EXISTS "Users can update their own financial transactions" ON public.financial_transactions;
DROP POLICY IF EXISTS "Users can delete their own financial transactions" ON public.financial_transactions;
DROP POLICY IF EXISTS "financial_transactions_select_policy" ON public.financial_transactions;
DROP POLICY IF EXISTS "financial_transactions_insert_policy" ON public.financial_transactions;
DROP POLICY IF EXISTS "financial_transactions_update_policy" ON public.financial_transactions;
DROP POLICY IF EXISTS "financial_transactions_delete_policy" ON public.financial_transactions;

-- Criar políticas otimizadas
CREATE POLICY "financial_transactions_select_optimized" ON public.financial_transactions
FOR SELECT USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "financial_transactions_insert_optimized" ON public.financial_transactions
FOR INSERT WITH CHECK ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "financial_transactions_update_optimized" ON public.financial_transactions
FOR UPDATE USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()))
WITH CHECK ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "financial_transactions_delete_optimized" ON public.financial_transactions
FOR DELETE USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

-- =====================================================
-- 2. CORRIGIR TODAS AS OUTRAS TABELAS PRINCIPAIS
-- =====================================================

-- CLIENTS
DROP POLICY IF EXISTS "clients_select_policy" ON public.clients;
DROP POLICY IF EXISTS "clients_insert_policy" ON public.clients;
DROP POLICY IF EXISTS "clients_update_policy" ON public.clients;
DROP POLICY IF EXISTS "clients_delete_policy" ON public.clients;

CREATE POLICY "clients_select_optimized" ON public.clients
FOR SELECT USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "clients_insert_optimized" ON public.clients
FOR INSERT WITH CHECK ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "clients_update_optimized" ON public.clients
FOR UPDATE USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()))
WITH CHECK ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "clients_delete_optimized" ON public.clients
FOR DELETE USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

-- PAYMENTS
DROP POLICY IF EXISTS "payments_select_policy" ON public.payments;
DROP POLICY IF EXISTS "payments_insert_policy" ON public.payments;
DROP POLICY IF EXISTS "payments_update_policy" ON public.payments;
DROP POLICY IF EXISTS "payments_delete_policy" ON public.payments;

CREATE POLICY "payments_select_optimized" ON public.payments
FOR SELECT USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "payments_insert_optimized" ON public.payments
FOR INSERT WITH CHECK ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "payments_update_optimized" ON public.payments
FOR UPDATE USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()))
WITH CHECK ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "payments_delete_optimized" ON public.payments
FOR DELETE USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

-- EXPENSES
DROP POLICY IF EXISTS "Users can view their own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can create their own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can update their own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete their own expenses" ON public.expenses;

CREATE POLICY "expenses_select_optimized" ON public.expenses
FOR SELECT USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "expenses_insert_optimized" ON public.expenses
FOR INSERT WITH CHECK ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "expenses_update_optimized" ON public.expenses
FOR UPDATE USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()))
WITH CHECK ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "expenses_delete_optimized" ON public.expenses
FOR DELETE USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

-- APPOINTMENTS
DROP POLICY IF EXISTS "appointments_select_policy" ON public.appointments;
DROP POLICY IF EXISTS "appointments_insert_policy" ON public.appointments;
DROP POLICY IF EXISTS "appointments_update_policy" ON public.appointments;
DROP POLICY IF EXISTS "appointments_delete_policy" ON public.appointments;

CREATE POLICY "appointments_select_optimized" ON public.appointments
FOR SELECT USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "appointments_insert_optimized" ON public.appointments
FOR INSERT WITH CHECK ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "appointments_update_optimized" ON public.appointments
FOR UPDATE USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()))
WITH CHECK ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "appointments_delete_optimized" ON public.appointments
FOR DELETE USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

-- SERVICES
DROP POLICY IF EXISTS "services_select_policy" ON public.services;
DROP POLICY IF EXISTS "services_insert_policy" ON public.services;
DROP POLICY IF EXISTS "services_update_policy" ON public.services;
DROP POLICY IF EXISTS "services_delete_policy" ON public.services;

CREATE POLICY "services_select_optimized" ON public.services
FOR SELECT USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "services_insert_optimized" ON public.services
FOR INSERT WITH CHECK ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "services_update_optimized" ON public.services
FOR UPDATE USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()))
WITH CHECK ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "services_delete_optimized" ON public.services
FOR DELETE USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

-- PRODUCTS
DROP POLICY IF EXISTS "products_select_policy" ON public.products;
DROP POLICY IF EXISTS "products_insert_policy" ON public.products;
DROP POLICY IF EXISTS "products_update_policy" ON public.products;
DROP POLICY IF EXISTS "products_delete_policy" ON public.products;

CREATE POLICY "products_select_optimized" ON public.products
FOR SELECT USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "products_insert_optimized" ON public.products
FOR INSERT WITH CHECK ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "products_update_optimized" ON public.products
FOR UPDATE USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()))
WITH CHECK ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "products_delete_optimized" ON public.products
FOR DELETE USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

-- PAYMENT_METHODS
DROP POLICY IF EXISTS "payment_methods_select_policy" ON public.payment_methods;
DROP POLICY IF EXISTS "payment_methods_insert_policy" ON public.payment_methods;
DROP POLICY IF EXISTS "payment_methods_update_policy" ON public.payment_methods;
DROP POLICY IF EXISTS "payment_methods_delete_policy" ON public.payment_methods;
DROP POLICY IF EXISTS "Users can view their own payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Users can create their own payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Users can update their own payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Users can delete their own payment methods" ON public.payment_methods;

CREATE POLICY "payment_methods_select_optimized" ON public.payment_methods
FOR SELECT USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "payment_methods_insert_optimized" ON public.payment_methods
FOR INSERT WITH CHECK ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "payment_methods_update_optimized" ON public.payment_methods
FOR UPDATE USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()))
WITH CHECK ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "payment_methods_delete_optimized" ON public.payment_methods
FOR DELETE USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

-- NOTES
DROP POLICY IF EXISTS "notes_select_policy" ON public.notes;
DROP POLICY IF EXISTS "notes_insert_policy" ON public.notes;
DROP POLICY IF EXISTS "notes_update_policy" ON public.notes;
DROP POLICY IF EXISTS "notes_delete_policy" ON public.notes;
DROP POLICY IF EXISTS "Users can view their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can create their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON public.notes;

CREATE POLICY "notes_select_optimized" ON public.notes
FOR SELECT USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "notes_insert_optimized" ON public.notes
FOR INSERT WITH CHECK ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "notes_update_optimized" ON public.notes
FOR UPDATE USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()))
WITH CHECK ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "notes_delete_optimized" ON public.notes
FOR DELETE USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

-- INSTALLMENTS
DROP POLICY IF EXISTS "Users can view their own installments" ON public.installments;
DROP POLICY IF EXISTS "Users can create their own installments" ON public.installments;
DROP POLICY IF EXISTS "Users can update their own installments" ON public.installments;
DROP POLICY IF EXISTS "Users can delete their own installments" ON public.installments;

CREATE POLICY "installments_select_optimized" ON public.installments
FOR SELECT USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "installments_insert_optimized" ON public.installments
FOR INSERT WITH CHECK ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "installments_update_optimized" ON public.installments
FOR UPDATE USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()))
WITH CHECK ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "installments_delete_optimized" ON public.installments
FOR DELETE USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

-- CASH_OPENINGS
DROP POLICY IF EXISTS "Users can view their own cash openings" ON public.cash_openings;
DROP POLICY IF EXISTS "Users can create their own cash openings" ON public.cash_openings;
DROP POLICY IF EXISTS "Users can update their own cash openings" ON public.cash_openings;
DROP POLICY IF EXISTS "Users can delete their own cash openings" ON public.cash_openings;

CREATE POLICY "cash_openings_select_optimized" ON public.cash_openings
FOR SELECT USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "cash_openings_insert_optimized" ON public.cash_openings
FOR INSERT WITH CHECK ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "cash_openings_update_optimized" ON public.cash_openings
FOR UPDATE USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()))
WITH CHECK ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "cash_openings_delete_optimized" ON public.cash_openings
FOR DELETE USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

-- CASH_CLOSURES
DROP POLICY IF EXISTS "Users can view their own cash closures" ON public.cash_closures;
DROP POLICY IF EXISTS "Users can create their own cash closures" ON public.cash_closures;
DROP POLICY IF EXISTS "Users can update their own cash closures" ON public.cash_closures;
DROP POLICY IF EXISTS "Users can delete their own cash closures" ON public.cash_closures;

CREATE POLICY "cash_closures_select_optimized" ON public.cash_closures
FOR SELECT USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "cash_closures_insert_optimized" ON public.cash_closures
FOR INSERT WITH CHECK ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "cash_closures_update_optimized" ON public.cash_closures
FOR UPDATE USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()))
WITH CHECK ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "cash_closures_delete_optimized" ON public.cash_closures
FOR DELETE USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

-- DASHBOARD_ANALYTICS
DROP POLICY IF EXISTS "Users can view their own analytics" ON public.dashboard_analytics;
DROP POLICY IF EXISTS "Users can create their own analytics" ON public.dashboard_analytics;
DROP POLICY IF EXISTS "Users can update their own analytics" ON public.dashboard_analytics;
DROP POLICY IF EXISTS "Users can delete their own analytics" ON public.dashboard_analytics;

CREATE POLICY "dashboard_analytics_select_optimized" ON public.dashboard_analytics
FOR SELECT USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "dashboard_analytics_insert_optimized" ON public.dashboard_analytics
FOR INSERT WITH CHECK ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "dashboard_analytics_update_optimized" ON public.dashboard_analytics
FOR UPDATE USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()))
WITH CHECK ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "dashboard_analytics_delete_optimized" ON public.dashboard_analytics
FOR DELETE USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

-- INVENTORY_TRANSACTIONS
DROP POLICY IF EXISTS "Users can view their own inventory transactions" ON public.inventory_transactions;
DROP POLICY IF EXISTS "Users can create their own inventory transactions" ON public.inventory_transactions;

CREATE POLICY "inventory_transactions_select_optimized" ON public.inventory_transactions
FOR SELECT USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "inventory_transactions_insert_optimized" ON public.inventory_transactions
FOR INSERT WITH CHECK ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

-- USER_SUBSCRIPTIONS
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can delete own subscriptions" ON public.user_subscriptions;

CREATE POLICY "user_subscriptions_select_optimized" ON public.user_subscriptions
FOR SELECT USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "user_subscriptions_insert_optimized" ON public.user_subscriptions
FOR INSERT WITH CHECK ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "user_subscriptions_update_optimized" ON public.user_subscriptions
FOR UPDATE USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()))
WITH CHECK ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "user_subscriptions_delete_optimized" ON public.user_subscriptions
FOR DELETE USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

-- AUTHORIZATION_PASSWORDS
DROP POLICY IF EXISTS "Users can manage their own authorization password" ON public.authorization_passwords;

CREATE POLICY "authorization_passwords_optimized" ON public.authorization_passwords
FOR ALL USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()))
WITH CHECK ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

-- AUDIT_LOGS
DROP POLICY IF EXISTS "Users can view their own audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Users can create audit logs" ON public.audit_logs;

CREATE POLICY "audit_logs_select_optimized" ON public.audit_logs
FOR SELECT USING ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

CREATE POLICY "audit_logs_insert_optimized" ON public.audit_logs
FOR INSERT WITH CHECK ((select auth.uid()) IS NOT NULL AND user_id = (select auth.uid()));

-- =====================================================
-- 3. COMENTÁRIOS DE DOCUMENTAÇÃO
-- =====================================================

COMMENT ON POLICY "financial_transactions_select_optimized" ON public.financial_transactions IS 'Política RLS otimizada - auth.uid() executado uma vez por consulta';
COMMENT ON POLICY "clients_select_optimized" ON public.clients IS 'Política RLS otimizada - auth.uid() executado uma vez por consulta';
COMMENT ON POLICY "payments_select_optimized" ON public.payments IS 'Política RLS otimizada - auth.uid() executado uma vez por consulta';