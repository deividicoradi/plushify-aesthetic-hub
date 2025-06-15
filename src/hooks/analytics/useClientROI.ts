
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ClientROI {
  client_name: string;
  total_spent: number;
  total_appointments: number;
  average_per_visit: number;
  lifetime_value: number;
  roi_score: number;
  last_visit: string;
  frequency_score: number;
}

export const useClientROI = (limit: number = 20) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['client-roi', user?.id, limit],
    queryFn: async () => {
      if (!user?.id) return [];

      // Buscar agendamentos com informações de cliente
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('client_name, price, appointment_date, created_at')
        .eq('user_id', user.id)
        .neq('status', 'cancelado')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Agrupar por cliente
      const clientStats = appointments.reduce((acc, appointment) => {
        const clientName = appointment.client_name || 'Cliente não informado';
        
        if (!acc[clientName]) {
          acc[clientName] = {
            total_spent: 0,
            total_appointments: 0,
            appointments_dates: [],
            last_visit: appointment.appointment_date
          };
        }
        
        acc[clientName].total_spent += Number(appointment.price || 0);
        acc[clientName].total_appointments++;
        acc[clientName].appointments_dates.push(new Date(appointment.appointment_date));
        
        // Atualizar última visita
        if (new Date(appointment.appointment_date) > new Date(acc[clientName].last_visit)) {
          acc[clientName].last_visit = appointment.appointment_date;
        }
        
        return acc;
      }, {} as Record<string, any>);

      // Converter para array e calcular ROI
      const clientROIData: ClientROI[] = Object.entries(clientStats)
        .map(([clientName, stats]) => {
          const avgPerVisit = stats.total_spent / stats.total_appointments;
          
          // Calcular frequência (appointments por mês)
          const firstVisit = new Date(Math.min(...stats.appointments_dates));
          const lastVisit = new Date(Math.max(...stats.appointments_dates));
          const monthsDiff = Math.max(1, (lastVisit.getTime() - firstVisit.getTime()) / (1000 * 60 * 60 * 24 * 30));
          const frequency = stats.total_appointments / monthsDiff;
          
          // Score ROI baseado em valor total e frequência
          const roiScore = (stats.total_spent * 0.7) + (frequency * 100);
          
          return {
            client_name: clientName,
            total_spent: stats.total_spent,
            total_appointments: stats.total_appointments,
            average_per_visit: avgPerVisit,
            lifetime_value: stats.total_spent + (frequency * avgPerVisit * 12), // Projeção anual
            roi_score: roiScore,
            last_visit: stats.last_visit,
            frequency_score: frequency
          };
        })
        .sort((a, b) => b.roi_score - a.roi_score)
        .slice(0, limit);

      return clientROIData;
    },
    enabled: !!user?.id,
  });
};
