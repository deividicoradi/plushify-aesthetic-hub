
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface DateRange {
  startDate: Date;
  endDate: Date;
  period: string;
}

export const useCategoryData = (dateRange: DateRange) => {
  const { user } = useAuth();
  const [expensesByCategory, setExpensesByCategory] = useState<CategoryData[]>([]);
  const [revenueByMethod, setRevenueByMethod] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategoryData = async () => {
    if (!user) return;

    try {
      const { startDate, endDate } = dateRange;
      
      // Despesas por categoria
      const { data: expenses } = await supabase
        .from('expenses')
        .select('amount, category')
        .eq('user_id', user.id)
        .gte('expense_date', startDate.toISOString())
        .lte('expense_date', endDate.toISOString());

      const expenseCategoryMap = new Map<string, number>();
      expenses?.forEach(e => {
        const current = expenseCategoryMap.get(e.category) || 0;
        expenseCategoryMap.set(e.category, current + Number(e.amount));
      });

      const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00c49f'];
      const expenseCategories: CategoryData[] = Array.from(expenseCategoryMap.entries()).map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length]
      }));

      setExpensesByCategory(expenseCategories);

      // Receitas por método de pagamento
      const { data: payments } = await supabase
        .from('payments')
        .select(`
          paid_amount,
          payment_methods(name)
        `)
        .eq('user_id', user.id)
        .gte('payment_date', startDate.toISOString())
        .lte('payment_date', endDate.toISOString())
        .not('payment_methods', 'is', null);

      const revenueMethodMap = new Map<string, number>();
      payments?.forEach(p => {
        const methodName = p.payment_methods?.name || 'Outros';
        const current = revenueMethodMap.get(methodName) || 0;
        revenueMethodMap.set(methodName, current + Number(p.paid_amount || 0));
      });

      const revenueMethods: CategoryData[] = Array.from(revenueMethodMap.entries()).map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length]
      }));

      setRevenueByMethod(revenueMethods);

    } catch (err: any) {
      console.error('Erro ao buscar dados por categoria:', err);
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchCategoryData().finally(() => setLoading(false));
    }
  }, [user, dateRange.startDate, dateRange.endDate]);

  return {
    expensesByCategory,
    revenueByMethod,
    loading,
    refetch: fetchCategoryData
  };
};
