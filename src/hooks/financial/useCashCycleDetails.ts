import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CashCyclePaymentRow {
  id: string;
  description: string | null;
  paid_amount: number;
  payment_date: string | null;
  client_name?: string | null;
  payment_method_name?: string | null;
}

export interface CashCycleExpenseRow {
  id: string;
  description: string;
  amount: number;
  category: string;
  expense_date: string;
  payment_method_name?: string | null;
}

/**
 * Lista os pagamentos e despesas de um dia específico (o dia de um ciclo de
 * caixa), pra dar visibilidade do que compôs os totais do fechamento —
 * antes o fechamento só mostrava os agregados, sem o detalhe de cada
 * lançamento.
 */
export function useCashCycleDetails(date: string | null, open: boolean) {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['cash-cycle-details', user?.id, date],
    enabled: open && !!date && !!user,
    staleTime: 60_000,
    queryFn: async () => {
      // date é "yyyy-MM-dd" (local); payment_date/expense_date são
      // timestamptz, então o filtro precisa ser pelo intervalo do dia
      // local, não pela string bruta.
      const dayStart = new Date(`${date}T00:00:00`);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const [paymentsRes, expensesRes, clientsRes, methodsRes] = await Promise.all([
        supabase
          .from('payments')
          .select('id, description, paid_amount, payment_date, client_id, payment_method_id')
          .eq('user_id', user!.id)
          .eq('status', 'pago')
          .gte('payment_date', dayStart.toISOString())
          .lt('payment_date', dayEnd.toISOString()),
        supabase
          .from('expenses')
          .select('id, description, amount, category, expense_date, payment_method_id')
          .eq('user_id', user!.id)
          .gte('expense_date', dayStart.toISOString())
          .lt('expense_date', dayEnd.toISOString()),
        supabase.from('clients').select('id, name').eq('user_id', user!.id),
        supabase.from('payment_methods').select('id, name').eq('user_id', user!.id),
      ]);

      const clientMap = new Map<string, string>();
      (clientsRes.data || []).forEach((c: any) => clientMap.set(c.id, c.name));
      const methodMap = new Map<string, string>();
      (methodsRes.data || []).forEach((m: any) => methodMap.set(m.id, m.name));

      const payments: CashCyclePaymentRow[] = (paymentsRes.data || []).map((p: any) => ({
        ...p,
        client_name: p.client_id ? clientMap.get(p.client_id) ?? null : null,
        payment_method_name: methodMap.get(p.payment_method_id) ?? null,
      }));
      const expenses: CashCycleExpenseRow[] = (expensesRes.data || []).map((e: any) => ({
        ...e,
        payment_method_name: e.payment_method_id ? methodMap.get(e.payment_method_id) ?? null : null,
      }));

      return { payments, expenses };
    },
  });

  return {
    payments: data?.payments ?? [],
    expenses: data?.expenses ?? [],
    loading: isLoading,
  };
}
