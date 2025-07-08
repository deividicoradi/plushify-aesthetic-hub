import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface TimeSlot {
  slot_time: string;
  is_available: boolean;
}

export const useAvailableSlots = () => {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const fetchAvailableSlots = useCallback(async (
    date: string,
    serviceDuration: number = 60,
    slotInterval: number = 30
  ) => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .rpc('get_available_slots', {
          p_user_id: user.id,
          p_date: date,
          p_service_duration: serviceDuration,
          p_slot_interval: slotInterval
        });

      if (error) throw error;
      
      setSlots(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar horários disponíveis:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os horários disponíveis.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const checkAvailability = useCallback(async (
    date: string,
    time: string,
    duration: number,
    excludeAppointmentId?: string
  ) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .rpc('check_appointment_availability', {
          p_user_id: user.id,
          p_appointment_date: date,
          p_appointment_time: time,
          p_duration: duration,
          p_exclude_appointment_id: excludeAppointmentId || null
        });

      if (error) throw error;
      
      return data;
    } catch (error: any) {
      console.error('Erro ao verificar disponibilidade:', error);
      return false;
    }
  }, [user]);

  return {
    slots,
    isLoading,
    fetchAvailableSlots,
    checkAvailability
  };
};