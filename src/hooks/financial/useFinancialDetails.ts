import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DateRange {
  startDate: Date;
  endDate: Date;
  period: string;
}

export interface PaymentRow {
  id: string;
  description: string | null;
  amount: number;
  paid_amount: number | null;
  status: string;
  payment_date: string | null;
  created_at: string;
}

export interface CashClosureRow {
  id: string;
  closure_date: string;
  total_income: number;
}

export interface ExpenseRow {
  id: string;
  description: string | null;
  amount: number;
  category: string | null;
  expense_date: string;
}

export interface InstallmentRow {
  id: string;
  installment_number: number | null;
  total_installments: number | null;
  amount: number;
  due_date: string;
  status: string;
  payment_date: string | null;
}

export interface FinancialDetails {
  paidPayments: PaymentRow[];
  cashClosures: CashClosureRow[];
  expenses: ExpenseRow[];
  overdueInstallments: InstallmentRow[];
  currentMonthPaidPayments: PaymentRow[];
  currentMonthCashClosures: CashClosureRow[];
}

export const useFinancialDetails = (dateRange: DateRange) => {
  const { user } = useAuth();
  const [details, setDetails] = useState<FinancialDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      const { startDate, endDate } = dateRange;
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const [paymentsResult, cashClosuresResult, expensesResult, installmentsResult] = await Promise.all([
        supabase
          .from('payments')
          .select('id, description, amount, paid_amount, created_at, status, payment_date')
          .eq('user_id', user.id)
          .gte('payment_date', startDate.toISOString())
          .lte('payment_date', endDate.toISOString()),
        supabase
          .from('cash_closures')
          .select('id, total_income, closure_date')
          .eq('user_id', user.id)
          .gte('closure_date', startDate.toISOString().split('T')[0])
          .lte('closure_date', endDate.toISOString().split('T')[0]),
        supabase
          .from('expenses')
          .select('id, description, amount, expense_date, category')
          .eq('user_id', user.id)
          .gte('expense_date', startDate.toISOString())
          .lte('expense_date', endDate.toISOString()),
        supabase
          .from('installments')
          .select('id, installment_number, total_installments, amount, due_date, status, payment_date')
          .eq('user_id', user.id)
          .gte('due_date', startDate.toISOString())
          .lte('due_date', endDate.toISOString()),
      ]);

      if (cancelled) return;

      const payments = (paymentsResult.data || []) as PaymentRow[];
      const cashClosures = (cashClosuresResult.data || []) as CashClosureRow[];
      const expenses = (expensesResult.data || []) as ExpenseRow[];
      const installments = (installmentsResult.data || []) as InstallmentRow[];

      const paidPayments = payments.filter(p => p.status === 'pago');
      const overdueInstallments = installments.filter(
        i => new Date(i.due_date) < now && i.status === 'pendente'
      );
      const currentMonthPaidPayments = paidPayments.filter(
        p => p.payment_date && new Date(p.payment_date) >= currentMonthStart
      );
      const currentMonthCashClosures = cashClosures.filter(
        c => new Date(c.closure_date) >= currentMonthStart
      );

      setDetails({
        paidPayments,
        cashClosures,
        expenses,
        overdueInstallments,
        currentMonthPaidPayments,
        currentMonthCashClosures,
      });
      setLoading(false);
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [user, dateRange.startDate, dateRange.endDate]);

  return { details, loading };
};