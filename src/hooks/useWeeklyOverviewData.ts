
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
    revenueGoal: 5000,
    averageServiceTime: 0,
    clientSatisfaction: 95,
    loading: true
  });
  const { user } = useAuth();

  const fetchWeeklyData = async () => {
    if (!user) return;

    try {
      setData(prev => ({ ...prev, loading: true }));

      // Calcular início da semana
      const startOfWeek = new Date();
      const dayOfWeek = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - dayOfWeek;
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      // Buscar agendamentos da semana
      const { data: weeklyAppointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .gte('appointment_date', startOfWeek.toISOString().split('T')[0])
        .lte('appointment_date', endOfWeek.toISOString().split('T')[0]);

      const appointmentsTotal = weeklyAppointments?.length || 0;
      const appointmentsCompleted = weeklyAppointments?.filter(apt => apt.status === 'concluido').length || 0;

      // Calcular receita da semana
      const { data: weeklyPayments } = await supabase
        .from('payments')
        .select('amount')
        .eq('user_id', user.id)
        .eq('status', 'pago')
        .gte('payment_date', startOfWeek.toISOString())
        .lte('payment_date', endOfWeek.toISOString());

      const revenueActual = weeklyPayments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;

      // Calcular tempo médio dos serviços
      const totalDuration = weeklyAppointments?.reduce((sum, apt) => sum + apt.duration, 0) || 0;
      const averageServiceTime = appointmentsTotal > 0 ? Math.round(totalDuration / appointmentsTotal) : 0;

      console.log('Weekly overview data updated:', {
        appointmentsTotal,
        appointmentsCompleted,
        revenueActual,
        averageServiceTime
      });

      setData({
        appointmentsCompleted,
        appointmentsTotal,
        revenueActual,
        revenueGoal: 5000,
        averageServiceTime,
        clientSatisfaction: 95,
        loading: false
      });
    } catch (error) {
      console.error('Erro ao buscar dados semanais:', error);
      setData(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchWeeklyData();

    if (!user) return;

    // Configurar listener em tempo real para agendamentos
    const appointmentsChannel = supabase
      .channel('weekly-overview-appointments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Appointments changed, refreshing weekly overview:', payload);
          fetchWeeklyData();
        }
      )
      .subscribe();

    // Configurar listener em tempo real para pagamentos
    const paymentsChannel = supabase
      .channel('weekly-overview-payments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Payments changed, refreshing weekly overview:', payload);
          fetchWeeklyData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(appointmentsChannel);
      supabase.removeChannel(paymentsChannel);
    };
  }, [user]);

  return {
    ...data,
    refetch: fetchWeeklyData
  };
};
