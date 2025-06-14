
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

        // Buscar agendamentos do dia (agora usando dados reais)
        const { count: agendamentos } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('appointment_date', currentDay.toISOString().split('T')[0]);

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

      console.log('Interactive chart data updated:', chartData);
      setData(chartData);
    } catch (error) {
      console.error('Erro ao buscar dados do gráfico:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();

    // Configurar listeners em tempo real para agendamentos
    const appointmentsChannel = supabase
      .channel('interactive-chart-appointments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          console.log('Appointments changed, refreshing interactive chart');
          fetchChartData();
        }
      )
      .subscribe();

    // Configurar listeners em tempo real para clientes
    const clientsChannel = supabase
      .channel('interactive-chart-clients')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          console.log('Clients changed, refreshing interactive chart');
          fetchChartData();
        }
      )
      .subscribe();

    // Configurar listeners em tempo real para pagamentos
    const paymentsChannel = supabase
      .channel('interactive-chart-payments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          console.log('Payments changed, refreshing interactive chart');
          fetchChartData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(appointmentsChannel);
      supabase.removeChannel(clientsChannel);
      supabase.removeChannel(paymentsChannel);
    };
  }, [user]);

  return {
    data,
    loading,
    refetch: fetchChartData
  };
};
