
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface WeeklyOverviewData {
  appointmentsCompleted: number;
  appointmentsTotal: number;
  revenueActual: number;
  revenueGoal: number;
  averageServiceTime: number;
  clientSatisfaction: number;
  loading: boolean;
}

export const useWeeklyOverviewData = () => {
  const [data, setData] = useState<WeeklyOverviewData>({
    appointmentsCompleted: 0,
    appointmentsTotal: 0,
    revenueActual: 0,
    revenueGoal: 10000, // Meta fixa, pode ser configurável no futuro
    averageServiceTime: 0,
    clientSatisfaction: 94, // Valor fixo por enquanto, pode ser implementado sistema de avaliação
    loading: true
  });
  const { user } = useAuth();

  const fetchWeeklyData = async () => {
    if (!user) return;

    try {
      setData(prev => ({ ...prev, loading: true }));

      // Calcular início e fim da semana
      const now = new Date();
      const startOfWeek = new Date(now);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day;
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);

      // Buscar todos os agendamentos da semana
      const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_time', startOfWeek.toISOString())
        .lt('start_time', endOfWeek.toISOString());

      const appointmentsTotal = appointments?.length || 0;
      const appointmentsCompleted = appointments?.filter(apt => apt.status === 'concluido').length || 0;

      // Calcular tempo médio dos serviços concluídos
      const completedAppointments = appointments?.filter(apt => apt.status === 'concluido') || [];
      let averageServiceTime = 0;
      
      if (completedAppointments.length > 0) {
        const totalMinutes = completedAppointments.reduce((sum, apt) => {
          const start = new Date(apt.start_time);
          const end = new Date(apt.end_time);
          const duration = (end.getTime() - start.getTime()) / (1000 * 60); // em minutos
          return sum + duration;
        }, 0);
        averageServiceTime = Math.round(totalMinutes / completedAppointments.length);
      }

      // Buscar receita da semana (pagamentos)
      const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .eq('user_id', user.id)
        .eq('status', 'pago')
        .gte('payment_date', startOfWeek.toISOString())
        .lt('payment_date', endOfWeek.toISOString());

      const revenueActual = payments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;

      setData({
        appointmentsCompleted,
        appointmentsTotal,
        revenueActual,
        revenueGoal: 10000,
        averageServiceTime,
        clientSatisfaction: 94,
        loading: false
      });
    } catch (error) {
      console.error('Erro ao buscar dados da semana:', error);
      setData(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchWeeklyData();
  }, [user]);

  return {
    ...data,
    refetch: fetchWeeklyData
  };
};
