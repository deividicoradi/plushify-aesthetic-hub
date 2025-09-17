
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import * as clientsApi from '@/api/clients';

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status?: string;
}

export const useClients = () => {
  const { user } = useAuth();

  const { data: clients = [], isLoading, refetch } = useQuery({
    queryKey: ['clients', user?.id],
    enabled: !!user?.id,
    queryFn: () => clientsApi.fetchClients(user!.id),
    staleTime: 60_000,
  });

  return { clients, isLoading, refetch };
};
