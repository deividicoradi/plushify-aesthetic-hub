import { supabase } from '@/integrations/supabase/client';
import type { Appointment } from '@/hooks/useAppointments';

export async function fetchAppointments(userId: string): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('user_id', userId)
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true });

  if (error) throw error;
  
  return (data || []).map(appointment => ({
    ...appointment,
    status: appointment.status as 'agendado' | 'confirmado' | 'concluido' | 'cancelado'
  }));
}

export async function createAppointment(userId: string, appointmentData: Omit<Appointment, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Appointment> {
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      ...appointmentData,
      user_id: userId
    })
    .select()
    .single();

  if (error) throw error;

  return {
    ...data,
    status: data.status as 'agendado' | 'confirmado' | 'concluido' | 'cancelado'
  };
}

export async function updateAppointment(userId: string, id: string, updates: Partial<Appointment>): Promise<Appointment> {
  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;

  return {
    ...data,
    status: data.status as 'agendado' | 'confirmado' | 'concluido' | 'cancelado'
  };
}

export async function deleteAppointment(userId: string, id: string): Promise<void> {
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
}