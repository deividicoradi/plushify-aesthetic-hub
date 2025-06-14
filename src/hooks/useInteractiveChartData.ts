
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ChartData {
  day: string;
  agendamentos: number;
  faturamento: number;
  clientes: number;
}

export const useInteractiveChartData = () => {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchChartData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Buscar dados da última semana
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - 6);
      startOfWeek.setHours(0, 0, 0, 0);

      const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const chartData: ChartData[] = [];

      for (let i = 0; i < 7; i++) {
        const currentDay = new Date(startOfWeek);
        currentDay.setDate(startOfWeek.getDate() + i);
        const nextDay = new Date(currentDay);
        nextDay.setDate(currentDay.getDate() + 1);

        // Buscar agendamentos do dia
        const { count: agendamentos } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('start_time', currentDay.toISOString())
          .lt('start_time', nextDay.toISOString());

        // Buscar faturamento do dia (pagamentos)
        const { data: payments } = await supabase
          .from('payments')
          .select('amount')
          .eq('user_id', user.id)
          .eq('status', 'pago')
          .gte('payment_date', currentDay.toISOString())
          .lt('payment_date', nextDay.toISOString());

        const faturamento = payments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;

        // Buscar novos clientes do dia
        const { count: clientes } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', currentDay.toISOString())
          .lt('created_at', nextDay.toISOString());

        chartData.push({
          day: days[currentDay.getDay()],
          agendamentos: agendamentos || 0,
          faturamento,
          clientes: clientes || 0
        });
      }

      setData(chartData);
    } catch (error) {
      console.error('Erro ao buscar dados do gráfico:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, [user]);

  return {
    data,
    loading,
    refetch: fetchChartData
  };
};
