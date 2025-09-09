
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status?: string;
}

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchClients = async () => {
    if (!user) return;

    try {
      // Use secure function to fetch client data with proper access control
      const { data, error } = await supabase.rpc('get_clients_masked', {
        p_mask_sensitive: false // Show full data for owner
      });

      if (error) throw error;
      
      // Map the secure data to the expected Client interface
      const mappedClients: Client[] = (data || []).map((client: any) => ({
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        status: client.status
      }));
      
      setClients(mappedClients);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [user]);

  return { clients, isLoading, refetch: fetchClients };
};
