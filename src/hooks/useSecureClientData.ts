import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  cpf: string | null;
  address: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  cep: string | null;
  status: string;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
  last_visit: string | null;
};

interface UseSecureClientDataOptions {
  maskSensitive?: boolean;
}

export const useSecureClientData = (options: UseSecureClientDataOptions = {}) => {
  const { maskSensitive = false } = options;

  return useQuery({
    queryKey: ['clients', 'secure', { maskSensitive }],
    queryFn: async (): Promise<Client[]> => {
      // Use secure function with PII masking option
      const { data, error } = await supabase.rpc('get_clients_masked', {
        p_mask_sensitive: maskSensitive
      });

      if (error) {
        console.error('Error fetching secure client data:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });
};

// Hook for getting a single client with security validation
export const useSecureClientById = (clientId: string, maskSensitive = false) => {
  return useQuery({
    queryKey: ['client', clientId, { maskSensitive }],
    queryFn: async (): Promise<Client> => {
      const { data, error } = await supabase.rpc('get_client_data_secure', {
        p_client_id: clientId,
        p_mask_sensitive: maskSensitive
      });

      if (error) {
        console.error('Error fetching secure client:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('Client not found or access denied');
      }

      return data[0];
    },
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });
};