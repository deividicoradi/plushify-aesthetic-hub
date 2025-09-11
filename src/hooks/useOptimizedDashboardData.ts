import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardData {
  stats: {
    totalClients: number;
    activeClients: number;
    newThisMonth: number;
    totalAppointments: number;
    weeklyAppointments: number;
    monthlyRevenue: number;
  };
  chartData: Array<{
    day: string;
    agendamentos: number;
    faturamento: number;
    clientes: number;
  }>;
}

export const useOptimizedDashboardData = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dashboard-data', user?.id],
    queryFn: async (): Promise<DashboardData> => {
      if (!user) throw new Error('User not authenticated');

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfWeek = new Date();
      const dayOfWeek = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - dayOfWeek;
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);

      // Fetch all data in parallel for better performance
      const [
        clientsData,
        appointmentsData,
        paymentsData,
        newClientsData,
        weeklyAppointmentsData
      ] = await Promise.all([
        // Total clients and active clients
        supabase
          .from('clients')
          .select('status')
          .eq('user_id', user.id),
        
        // Total appointments
        supabase
          .from('appointments')
          .select('appointment_date')
          .eq('user_id', user.id),
          
        // Monthly payments
        supabase
          .from('payments')
          .select('amount, payment_date')
          .eq('user_id', user.id)
          .eq('status', 'pago')
          .gte('payment_date', startOfMonth.toISOString()),
          
        // New clients this month
        supabase
          .from('clients')
          .select('created_at')
          .eq('user_id', user.id)
          .gte('created_at', startOfMonth.toISOString()),
          
        // Weekly appointments
        supabase
          .from('appointments')
          .select('appointment_date')
          .eq('user_id', user.id)
          .gte('appointment_date', startOfWeek.toISOString().split('T')[0])
      ]);

      // Process stats
      const totalClients = clientsData.data?.length || 0;
      const activeClients = clientsData.data?.filter(c => c.status === 'Ativo').length || 0;
      const newThisMonth = newClientsData.data?.length || 0;
      const totalAppointments = appointmentsData.data?.length || 0;
      const weeklyAppointments = weeklyAppointmentsData.data?.length || 0;
      const monthlyRevenue = paymentsData.data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      // Generate chart data for the last 7 days
      const chartData = [];
      const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      
      for (let i = 0; i < 7; i++) {
        const currentDay = new Date();
        currentDay.setDate(currentDay.getDate() - (6 - i));
        const dayString = currentDay.toISOString().split('T')[0];

        const agendamentos = appointmentsData.data?.filter(a => 
          a.appointment_date === dayString
        ).length || 0;

        const faturamento = paymentsData.data?.filter(p => {
          const paymentDate = new Date(p.payment_date);
          return paymentDate.toISOString().split('T')[0] === dayString;
        }).reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;

        const clientes = newClientsData.data?.filter(c => {
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

      return {
        stats: {
          totalClients,
          activeClients,
          newThisMonth,
          totalAppointments,
          weeklyAppointments,
          monthlyRevenue
        },
        chartData
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
    enabled: !!user,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1,
    retryDelay: 3000,
  });
};