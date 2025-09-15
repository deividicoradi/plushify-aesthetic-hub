
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

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
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuth();

  const fetchAppointments = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      if (error) throw error;
      
      console.log('Fetched appointments:', data);
      
      const formattedData = (data || []).map(appointment => ({
        ...appointment,
        status: appointment.status as 'agendado' | 'confirmado' | 'concluido' | 'cancelado'
      }));
      
      setAppointments(formattedData);
    } catch (error: any) {
      console.error('Erro ao buscar agendamentos:', error);
      
      // Verificar tipo específico de erro para melhor feedback
      let errorMessage = "Não foi possível carregar os agendamentos.";
      
      if (error.message?.includes('Failed to fetch')) {
        errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
      } else if (error.message?.includes('NetworkError')) {
        errorMessage = "Erro de rede. Verifique sua conexão.";
      } else if (error.code === 'PGRST301') {
        errorMessage = "Erro de autorização. Faça login novamente.";
      } else if (error.details) {
        errorMessage = `Erro: ${error.details}`;
      }
      
      toast({
        title: "Erro ao carregar agendamentos",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const createAppointment = async (appointmentData: Omit<Appointment, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user || isCreating) return null;

    try {
      setIsCreating(true);
      console.log('Creating appointment with data:', appointmentData);
      
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          ...appointmentData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      console.log('Created appointment:', data);

      const formattedData = {
        ...data,
        status: data.status as 'agendado' | 'confirmado' | 'concluido' | 'cancelado'
      };

      setAppointments(prev => [...prev, formattedData]);

      toast({
        title: "Sucesso",
        description: "Agendamento criado com sucesso!"
      });

      return formattedData;
    } catch (error: any) {
      console.error('Erro ao criar agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o agendamento.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    if (!user) return null;

    try {
      console.log('Updating appointment:', id, updates);
      
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      console.log('Updated appointment:', data);

      const formattedData = {
        ...data,
        status: data.status as 'agendado' | 'confirmado' | 'concluido' | 'cancelado'
      };

      setAppointments(prev => 
        prev.map(appointment => 
          appointment.id === id ? formattedData : appointment
        )
      );

      toast({
        title: "Sucesso",
        description: "Agendamento atualizado com sucesso!"
      });

      return formattedData;
    } catch (error: any) {
      console.error('Erro ao atualizar agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o agendamento.",
        variant: "destructive"
      });
      return null;
    }
  };

  const deleteAppointment = async (id: string) => {
    if (!user) return false;

    console.log('Starting deletion process for appointment:', id);

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      console.log('Successfully deleted appointment from database:', id);

      // Forçar atualização imediata do estado
      setAppointments(prevAppointments => {
        const filteredAppointments = prevAppointments.filter(appointment => appointment.id !== id);
        console.log('Updated local state - removed appointment:', id);
        console.log('Remaining appointments:', filteredAppointments.length);
        return filteredAppointments;
      });
      
      toast({
        title: "Sucesso",
        description: "Agendamento excluído com sucesso!"
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao excluir agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o agendamento.",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return {
    appointments,
    isLoading,
    isCreating,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    refetch: fetchAppointments
  };
};
