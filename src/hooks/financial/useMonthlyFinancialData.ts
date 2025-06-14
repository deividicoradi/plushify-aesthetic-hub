
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface MonthlyFinancialData {
  month: string;
  receitas: number;
  despesas: number;
  saldoLiquido: number;
}

export const useMonthlyFinancialData = () => {
  const { user } = useAuth();
  const [monthlyData, setMonthlyData] = useState<MonthlyFinancialData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMonthlyData = async () => {
    if (!user) return;

    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: payments } = await supabase
        .from('payments')
        .select('paid_amount, created_at')
        .eq('user_id', user.id)
        .gte('created_at', sixMonthsAgo.toISOString());

      const { data: expenses } = await supabase
        .from('expenses')
        .select('amount, expense_date')
        .eq('user_id', user.id)
        .gte('expense_date', sixMonthsAgo.toISOString());

      const monthlyDataMap = new Map<string, MonthlyFinancialData>();

      // Inicializar últimos 6 meses
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toISOString().slice(0, 7);
        const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
        
        monthlyDataMap.set(monthKey, {
          month: monthName,
          receitas: 0,
          despesas: 0,
          saldoLiquido: 0
        });
      }

      // Agregar receitas
      payments?.forEach(p => {
        const monthKey = p.created_at.slice(0, 7);
        const existing = monthlyDataMap.get(monthKey);
        if (existing) {
          existing.receitas += Number(p.paid_amount || 0);
        }
      });

      // Agregar despesas
      expenses?.forEach(e => {
        const monthKey = e.expense_date.slice(0, 7);
        const existing = monthlyDataMap.get(monthKey);
        if (existing) {
          existing.despesas += Number(e.amount);
        }
      });

      // Calcular saldo líquido
      monthlyDataMap.forEach(data => {
        data.saldoLiquido = data.receitas - data.despesas;
      });

      setMonthlyData(Array.from(monthlyDataMap.values()));

    } catch (err: any) {
      console.error('Erro ao buscar dados mensais:', err);
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchMonthlyData().finally(() => setLoading(false));
    }
  }, [user]);

  return {
    monthlyData,
    loading,
    refetch: fetchMonthlyData
  };
};
