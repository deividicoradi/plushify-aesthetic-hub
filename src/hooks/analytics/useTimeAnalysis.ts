
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface HourlyMovement {
  hour: number;
  appointments_count: number;
  revenue: number;
  day_of_week?: string;
}

export interface SeasonalData {
  month: string;
  appointments: number;
  revenue: number;
  growth_rate: number;
}

export const useTimeAnalysis = () => {
  const { user } = useAuth();

  const hourlyMovement = useQuery({
    queryKey: ['hourly-movement', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('appointment_time, price, appointment_date')
        .eq('user_id', user.id)
        .neq('status', 'cancelado');

      if (error) throw error;

      const hourlyStats = appointments.reduce((acc, appointment) => {
        const hour = parseInt(appointment.appointment_time?.split(':')[0] || '0');
        
        if (!acc[hour]) {
          acc[hour] = {
            appointments_count: 0,
            revenue: 0
          };
        }
        
        acc[hour].appointments_count++;
        acc[hour].revenue += Number(appointment.price || 0);
        
        return acc;
      }, {} as Record<number, any>);

      const hourlyData: HourlyMovement[] = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        appointments_count: hourlyStats[hour]?.appointments_count || 0,
        revenue: hourlyStats[hour]?.revenue || 0
      }));

      return hourlyData;
    },
    enabled: !!user?.id,
  });

  const seasonalAnalysis = useQuery({
    queryKey: ['seasonal-analysis', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('appointment_date, price, created_at')
        .eq('user_id', user.id)
        .gte('created_at', oneYearAgo.toISOString())
        .neq('status', 'cancelado');

      if (error) throw error;

      const monthlyStats = appointments.reduce((acc, appointment) => {
        const date = new Date(appointment.appointment_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!acc[monthKey]) {
          acc[monthKey] = {
            appointments: 0,
            revenue: 0
          };
        }
        
        acc[monthKey].appointments++;
        acc[monthKey].revenue += Number(appointment.price || 0);
        
        return acc;
      }, {} as Record<string, any>);

      const monthNames = [
        'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
        'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
      ];

      const seasonalData: SeasonalData[] = Object.entries(monthlyStats)
        .map(([monthKey, stats]) => {
          const [year, month] = monthKey.split('-');
          return {
            month: `${monthNames[parseInt(month) - 1]} ${year}`,
            appointments: stats.appointments,
            revenue: stats.revenue,
            growth_rate: Math.random() * 30 - 15 // Simulado
          };
        })
        .sort((a, b) => a.month.localeCompare(b.month));

      return seasonalData;
    },
    enabled: !!user?.id,
  });

  return {
    hourlyMovement,
    seasonalAnalysis
  };
};
