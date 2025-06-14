
import { useState, useEffect } from 'react';
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
  const { user } = useAuth();

  const fetchAppointments = async () => {
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
      
      // Garantir que o status está correto
      const formattedData = (data || []).map(appointment => ({
        ...appointment,
        status: appointment.status as 'agendado' | 'confirmado' | 'concluido' | 'cancelado'
      }));
      
      setAppointments(formattedData);
    } catch (error: any) {
      console.error('Erro ao buscar agendamentos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os agendamentos.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createAppointment = async (appointmentData: Omit<Appointment, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
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

      // Fazer refetch para garantir que temos os dados mais atualizados
      await fetchAppointments();

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
    }
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

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

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setAppointments(prev => prev.filter(appointment => appointment.id !== id));
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
  }, [user]);

  return {
    appointments,
    isLoading,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    refetch: fetchAppointments
  };
};
