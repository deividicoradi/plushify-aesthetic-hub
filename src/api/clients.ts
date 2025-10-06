import { supabase } from '@/integrations/supabase/client';
import type { Client } from '@/hooks/useClients';

export async function fetchClients(userId: string, maskSensitive = false): Promise<Client[]> {
  // Use secure RPC function with audit logging
  const { data, error } = await supabase.rpc('get_clients_masked', {
    p_mask_sensitive: maskSensitive
  });

  if (error) throw error;
  
  // Map to Client interface (only return necessary fields)
  return (data || []).map(client => ({
    id: client.id,
    name: client.name,
    email: client.email,
    phone: client.phone,
    status: client.status
  })) as Client[];
}

export async function createClient(userId: string, clientData: Omit<Client, 'id'>): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .insert({ ...clientData, user_id: userId })
    .select()
    .single();
    
  if (error) throw error;
  return data as Client;
}

export async function updateClient(userId: string, id: string, updates: Partial<Client>): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();
    
  if (error) throw error;
  return data as Client;
}

export async function deleteClient(userId: string, id: string): Promise<void> {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
    
  if (error) throw error;
}