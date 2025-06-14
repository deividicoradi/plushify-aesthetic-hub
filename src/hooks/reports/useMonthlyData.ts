
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface MonthlyData {
  month: string;
  revenue: number;
  appointments: number;
  newClients: number;
}

export const useMonthlyData = () => {
  const { user } = useAuth();
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMonthlyData = async () => {
    if (!user) return;

    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      // Buscar dados dos últimos 6 meses
      const { data: transactions } = await supabase
        .from('financial_transactions')
        .select('amount, type, transaction_date')
        .eq('user_id', user.id)
        .eq('type', 'receita')
        .gte('transaction_date', sixMonthsAgo.toISOString());

      const { data: clients } = await supabase
        .from('clients')
        .select('created_at')
        .eq('user_id', user.id)
        .gte('created_at', sixMonthsAgo.toISOString());

      const { data: appointments } = await supabase
        .from('appointments')
        .select('created_at')
        .eq('user_id', user.id)
        .gte('created_at', sixMonthsAgo.toISOString());

      // Agrupar por mês
      const monthlyDataMap = new Map<string, MonthlyData>();

      // Inicializar últimos 6 meses
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toISOString().slice(0, 7);
        const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
        
        monthlyDataMap.set(monthKey, {
          month: monthName,
          revenue: 0,
          appointments: 0,
          newClients: 0
        });
      }

      // Agregar receitas
      transactions?.forEach(t => {
        const monthKey = t.transaction_date.slice(0, 7);
        const existing = monthlyDataMap.get(monthKey);
        if (existing) {
          existing.revenue += Number(t.amount);
        }
      });

      // Agregar agendamentos
      appointments?.forEach(appointment => {
        const monthKey = appointment.created_at.slice(0, 7);
        const existing = monthlyDataMap.get(monthKey);
        if (existing) {
          existing.appointments += 1;
        }
      });

      // Agregar novos clientes
      clients?.forEach(client => {
        const monthKey = client.created_at.slice(0, 7);
        const existing = monthlyDataMap.get(monthKey);
        if (existing) {
          existing.newClients += 1;
        }
      });

      setMonthlyData(Array.from(monthlyDataMap.values()));

    } catch (err: any) {
      console.error('Erro ao buscar dados mensais:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMonthlyData();
    }
  }, [user]);

  return {
    monthlyData,
    loading,
    refetch: fetchMonthlyData
  };
};
