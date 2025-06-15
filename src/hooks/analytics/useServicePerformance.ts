
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ServicePerformance {
  service_name: string;
  total_appointments: number;
  total_revenue: number;
  average_price: number;
  growth_rate: number;
  popularity_rank: number;
}

export const useServicePerformance = (dateFrom?: Date, dateTo?: Date) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['service-performance', user?.id, dateFrom, dateTo],
    queryFn: async () => {
      if (!user?.id) return [];

      const fromDate = dateFrom?.toISOString() || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
      const toDate = dateTo?.toISOString() || new Date().toISOString();

      // Buscar agendamentos com serviços
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('service_name, price, created_at, status')
        .eq('user_id', user.id)
        .gte('created_at', fromDate)
        .lte('created_at', toDate)
        .neq('status', 'cancelado');

      if (error) throw error;

      // Agrupar por serviço
      const serviceStats = appointments.reduce((acc, appointment) => {
        const serviceName = appointment.service_name || 'Serviço não informado';
        
        if (!acc[serviceName]) {
          acc[serviceName] = {
            total_appointments: 0,
            total_revenue: 0,
            prices: []
          };
        }
        
        acc[serviceName].total_appointments++;
        acc[serviceName].total_revenue += Number(appointment.price || 0);
        acc[serviceName].prices.push(Number(appointment.price || 0));
        
        return acc;
      }, {} as Record<string, any>);

      // Converter para array e calcular métricas
      const performanceData: ServicePerformance[] = Object.entries(serviceStats)
        .map(([serviceName, stats], index) => ({
          service_name: serviceName,
          total_appointments: stats.total_appointments,
          total_revenue: stats.total_revenue,
          average_price: stats.total_revenue / stats.total_appointments,
          growth_rate: Math.random() * 20 - 10, // Simulado por enquanto
          popularity_rank: index + 1
        }))
        .sort((a, b) => b.total_revenue - a.total_revenue)
        .map((item, index) => ({ ...item, popularity_rank: index + 1 }));

      return performanceData;
    },
    enabled: !!user?.id,
  });
};
