import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface WorkingHoursEnhanced {
  id: string;
  user_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  auto_confirm_appointments: boolean;
  auto_complete_appointments: boolean;
  created_at: string;
  updated_at: string;
}

export const useWorkingHoursEnhanced = () => {
  const [workingHours, setWorkingHours] = useState<WorkingHoursEnhanced[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWorkingHours = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('working_hours')
        .select('*')
        .order('day_of_week');

      if (error) throw error;
      setWorkingHours(data || []);
    } catch (error) {
      console.error('Error fetching working hours:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar horários de trabalho",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateWorkingHours = async (id: string, updates: Partial<WorkingHoursEnhanced>) => {
    try {
      const { data, error } = await supabase
        .from('working_hours')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setWorkingHours(prev => prev.map(wh => wh.id === id ? data : wh));
      return data;
    } catch (error) {
      console.error('Error updating working hours:', error);
      throw error;
    }
  };

  const saveAllWorkingHours = async (updatedHours: WorkingHoursEnhanced[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // upsert (não update): dias configurados pela primeira vez ainda não
      // têm linha em working_hours, então não têm id para dar match num update.
      const { data, error } = await supabase
        .from('working_hours')
        .upsert(
          updatedHours.map(hour => ({
            id: hour.id,
            user_id: user.id,
            day_of_week: hour.day_of_week,
            is_active: hour.is_active,
            start_time: hour.start_time,
            end_time: hour.end_time,
            auto_confirm_appointments: hour.auto_confirm_appointments,
            auto_complete_appointments: hour.auto_complete_appointments
          })),
          { onConflict: 'user_id,day_of_week' }
        )
        .select();

      if (error) throw error;

      setWorkingHours(data || updatedHours);
      toast({
        title: "Sucesso",
        description: "Configurações de horário salvas com sucesso"
      });
      return true;
    } catch (error) {
      console.error('Error saving all working hours:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações",
        variant: "destructive"
      });
      return false;
    }
  };

  const checkPendingAppointments = async (dayOfWeek: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .rpc('check_pending_appointments_for_day', {
          p_user_id: user.id,
          p_day_of_week: dayOfWeek
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error checking pending appointments:', error);
      return false;
    }
  };

  const deactivateDay = async (id: string, dayOfWeek: number) => {
    try {
      const hasPendingAppointments = await checkPendingAppointments(dayOfWeek);
      
      if (hasPendingAppointments) {
        toast({
          title: "Não é possível desativar",
          description: "Não é possível desativar o dia de trabalho com agendamentos pendentes.",
          variant: "destructive"
        });
        return false;
      }

      return await updateWorkingHours(id, { is_active: false });
    } catch (error) {
      console.error('Error deactivating day:', error);
      toast({
        title: "Erro",
        description: "Erro ao desativar dia de trabalho",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchWorkingHours();
  }, []);

  return {
    workingHours,
    isLoading,
    fetchWorkingHours,
    updateWorkingHours,
    saveAllWorkingHours,
    checkPendingAppointments,
    deactivateDay
  };
};