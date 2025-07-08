import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface WorkingHour {
  id: string;
  user_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useWorkingHours = () => {
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchWorkingHours = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('working_hours')
        .select('*')
        .eq('user_id', user.id)
        .order('day_of_week', { ascending: true });

      if (error) throw error;
      
      setWorkingHours(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar horários de trabalho:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os horários de trabalho.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const createOrUpdateWorkingHour = async (workingHour: Omit<WorkingHour, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      // Verificar se já existe um horário para este dia
      const existingHour = workingHours.find(wh => wh.day_of_week === workingHour.day_of_week);

      let result;
      if (existingHour) {
        // Atualizar existente
        const { data, error } = await supabase
          .from('working_hours')
          .update(workingHour)
          .eq('id', existingHour.id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Criar novo
        const { data, error } = await supabase
          .from('working_hours')
          .insert({
            ...workingHour,
            user_id: user.id
          })
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      await fetchWorkingHours();
      
      toast({
        title: "Sucesso",
        description: "Horário de trabalho salvo com sucesso!"
      });

      return result;
    } catch (error: any) {
      console.error('Erro ao salvar horário de trabalho:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o horário de trabalho.",
        variant: "destructive"
      });
      return null;
    }
  };

  const deleteWorkingHour = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('working_hours')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchWorkingHours();
      
      toast({
        title: "Sucesso",
        description: "Horário de trabalho removido com sucesso!"
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao remover horário de trabalho:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o horário de trabalho.",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchWorkingHours();
  }, [fetchWorkingHours]);

  return {
    workingHours,
    isLoading,
    createOrUpdateWorkingHour,
    deleteWorkingHour,
    refetch: fetchWorkingHours
  };
};