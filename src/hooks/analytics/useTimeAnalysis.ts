
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface HourlyMovement {
  hour: number;
  appointments_count: number;
  revenue: number;
  day_of_week?: string;
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

  return {
    hourlyMovement
  };
};
