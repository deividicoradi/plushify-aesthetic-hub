
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import * as appointmentsApi from '@/api/appointments';

export interface Appointment {
  id: string;
  user_id: string;
  client_id?: string;
  service_id?: string;
  client_name: string;
  service_name: string;
  appointment_date: string;
  appointment_time: string;
  duration: number;
  status: 'agendado' | 'confirmado' | 'concluido' | 'cancelado';
  price: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useAppointments = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading, refetch } = useQuery({
    queryKey: ['appointments', user?.id],
    enabled: !!user?.id,
    queryFn: () => appointmentsApi.fetchAppointments(user!.id),
    staleTime: 60_000,
  });

  const createAppointmentMutation = useMutation({
    mutationFn: (appointmentData: Omit<Appointment, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => 
      appointmentsApi.createAppointment(user!.id, appointmentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', user?.id] });
      toast({ title: "Sucesso", description: "Agendamento criado com sucesso!" });
    },
    onError: (error: any) => {
      console.error('Erro ao criar agendamento:', error);
      toast({ title: "Erro", description: "Não foi possível criar o agendamento.", variant: "destructive" });
    }
  });

  const createAppointment = async (appointmentData: Omit<Appointment, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;
    try {
      const result = await createAppointmentMutation.mutateAsync(appointmentData);
      return result;
    } catch {
      return null;
    }
  };

  const updateAppointmentMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Appointment> }) => 
      appointmentsApi.updateAppointment(user!.id, id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', user?.id] });
      toast({ title: "Sucesso", description: "Agendamento atualizado com sucesso!" });
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar agendamento:', error);
      toast({ title: "Erro", description: "Não foi possível atualizar o agendamento.", variant: "destructive" });
    }
  });

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    if (!user) return null;
    try {
      const result = await updateAppointmentMutation.mutateAsync({ id, updates });
      return result;
    } catch {
      return null;
    }
  };

  const deleteAppointmentMutation = useMutation({
    mutationFn: (id: string) => appointmentsApi.deleteAppointment(user!.id, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', user?.id] });
      toast({ title: "Sucesso", description: "Agendamento excluído com sucesso!" });
    },
    onError: (error: any) => {
      console.error('Erro ao excluir agendamento:', error);
      toast({ title: "Erro", description: "Não foi possível excluir o agendamento.", variant: "destructive" });
    }
  });

  const deleteAppointment = async (id: string) => {
    if (!user) return false;
    try {
      await deleteAppointmentMutation.mutateAsync(id);
      return true;
    } catch {
      return false;
    }
  };

  return {
    appointments,
    isLoading,
    isCreating: createAppointmentMutation.isPending,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    refetch
  };
};
