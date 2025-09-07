
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

      // Buscar dados da última semana em paralelo
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - 6);
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(today);
      endOfWeek.setHours(23, 59, 59, 999);

      // Fazer todas as consultas em paralelo
      const [appointmentsResult, paymentsResult, clientsResult] = await Promise.all([
        supabase
          .from('appointments')
          .select('appointment_date')
          .eq('user_id', user.id)
          .gte('appointment_date', startOfWeek.toISOString().split('T')[0])
          .lte('appointment_date', endOfWeek.toISOString().split('T')[0]),
        
        supabase
          .from('payments')
          .select('amount, payment_date')
          .eq('user_id', user.id)
          .eq('status', 'pago')
          .gte('payment_date', startOfWeek.toISOString())
          .lte('payment_date', endOfWeek.toISOString()),
          
        supabase
          .from('clients')
          .select('created_at')
          .eq('user_id', user.id)
          .gte('created_at', startOfWeek.toISOString())
          .lte('created_at', endOfWeek.toISOString())
      ]);

      const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const chartData: ChartData[] = [];

      // Processar dados uma vez só
      for (let i = 0; i < 7; i++) {
        const currentDay = new Date(startOfWeek);
        currentDay.setDate(startOfWeek.getDate() + i);
        const dayString = currentDay.toISOString().split('T')[0];

        // Contar agendamentos do dia
        const agendamentos = appointmentsResult.data?.filter(a => 
          a.appointment_date === dayString
        ).length || 0;

        // Somar faturamento do dia
        const faturamento = paymentsResult.data?.filter(p => {
          const paymentDate = new Date(p.payment_date);
          return paymentDate.toISOString().split('T')[0] === dayString;
        }).reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;

        // Contar novos clientes do dia
        const clientes = clientsResult.data?.filter(c => {
          const clientDate = new Date(c.created_at);
          return clientDate.toISOString().split('T')[0] === dayString;
        }).length || 0;

        chartData.push({
          day: days[currentDay.getDay()],
          agendamentos,
          faturamento,
          clientes
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
    if (!user) return;
    
    fetchChartData();

    // Debounce para evitar atualizações muito frequentes
    let refreshTimeout: NodeJS.Timeout;
    
    const debouncedRefresh = () => {
      clearTimeout(refreshTimeout);
      refreshTimeout = setTimeout(() => {
        fetchChartData();
      }, 2000); // Aguardar 2 segundos
    };

    // Single channel para todas as mudanças
    const chartChannel = supabase
      .channel('interactive-chart')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `user_id=eq.${user.id}`
        },
        debouncedRefresh
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients',
          filter: `user_id=eq.${user.id}`
        },
        debouncedRefresh
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
          filter: `user_id=eq.${user.id}`
        },
        debouncedRefresh
      )
      .subscribe();

    return () => {
      clearTimeout(refreshTimeout);
      supabase.removeChannel(chartChannel);
    };
  }, [user]);

  return {
    data,
    loading,
    refetch: fetchChartData
  };
};
