import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ExpenseTypeData {
  name: string;
  value: number;
  color: string;
}

interface DateRange {
  startDate: Date;
  endDate: Date;
  period: string;
}

// Categorias consideradas fixas (você pode ajustar conforme necessário)
const FIXED_CATEGORIES = [
  'Aluguel',
  'Salários',
  'Água',
  'Luz',
  'Internet',
  'Telefone',
  'Seguros',
  'Financiamento',
  'Empréstimo',
  'Condomínio'
];

export const useExpensesByType = (fixedDateRange: DateRange, variableDateRange: DateRange) => {
  const { user } = useAuth();
  const [fixedExpenses, setFixedExpenses] = useState<ExpenseTypeData[]>([]);
  const [variableExpenses, setVariableExpenses] = useState<ExpenseTypeData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExpensesByType = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const colors = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5', '#ea580c'];
      const variableColors = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#2563eb'];

      // Buscar despesas fixas
      const { data: fixedData } = await supabase
        .from('expenses')
        .select('amount, category')
        .eq('user_id', user.id)
        .gte('expense_date', fixedDateRange.startDate.toISOString())
        .lte('expense_date', fixedDateRange.endDate.toISOString())
        .in('category', FIXED_CATEGORIES);

      const fixedMap = new Map<string, number>();
      fixedData?.forEach(e => {
        const current = fixedMap.get(e.category) || 0;
        fixedMap.set(e.category, current + Number(e.amount));
      });

      const fixedExpensesData: ExpenseTypeData[] = Array.from(fixedMap.entries()).map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length]
      }));

      setFixedExpenses(fixedExpensesData);

      // Buscar despesas variáveis
      const { data: variableData } = await supabase
        .from('expenses')
        .select('amount, category')
        .eq('user_id', user.id)
        .gte('expense_date', variableDateRange.startDate.toISOString())
        .lte('expense_date', variableDateRange.endDate.toISOString())
        .not('category', 'in', `(${FIXED_CATEGORIES.join(',')})`);

      const variableMap = new Map<string, number>();
      variableData?.forEach(e => {
        const current = variableMap.get(e.category) || 0;
        variableMap.set(e.category, current + Number(e.amount));
      });

      const variableExpensesData: ExpenseTypeData[] = Array.from(variableMap.entries()).map(([name, value], index) => ({
        name,
        value,
        color: variableColors[index % variableColors.length]
      }));

      setVariableExpenses(variableExpensesData);

    } catch (err: any) {
      console.error('Erro ao buscar despesas por tipo:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchExpensesByType();
    }
  }, [user, fixedDateRange.startDate, fixedDateRange.endDate, variableDateRange.startDate, variableDateRange.endDate]);

  return {
    fixedExpenses,
    variableExpenses,
    loading,
    refetch: fetchExpensesByType
  };
};
