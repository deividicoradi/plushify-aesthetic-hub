import { supabase } from '@/integrations/supabase/client';
import type { Service } from '@/hooks/useServices';

export async function fetchServices(userId: string): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select('id, name, price, duration, description, category, active')
    .eq('user_id', userId)
    .order('name');
    
  if (error) throw error;
  return (data || []) as Service[];
}

export async function createService(userId: string, serviceData: Omit<Service, 'id'>): Promise<Service> {
  const { data, error } = await supabase
    .from('services')
    .insert({ ...serviceData, user_id: userId })
    .select()
    .single();
    
  if (error) throw error;
  return data as Service;
}

export async function updateService(userId: string, id: string, updates: Partial<Service>): Promise<Service> {
  const { data, error } = await supabase
    .from('services')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();
    
  if (error) throw error;
  return data as Service;
}

export async function deleteService(userId: string, id: string): Promise<void> {
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
    
  if (error) throw error;
}