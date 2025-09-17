
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import * as servicesApi from '@/api/services';

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
  category?: string;
  active: boolean;
}

export const useServices = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['services', user?.id],
    enabled: !!user?.id,
    queryFn: () => servicesApi.fetchServices(user!.id),
    staleTime: 60_000,
  });

  const createServiceMutation = useMutation({
    mutationFn: (serviceData: Omit<Service, 'id'>) => servicesApi.createService(user!.id, serviceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services', user?.id] });
      toast({ title: 'Sucesso', description: 'Serviço criado com sucesso!' });
    },
    onError: (error: any) => {
      console.error('Erro ao criar serviço:', error);
      toast({ title: 'Erro', description: 'Não foi possível criar o serviço.', variant: 'destructive' });
    }
  });

  const createService = async (serviceData: Omit<Service, 'id'>) => {
    if (!user) return false;
    try {
      await createServiceMutation.mutateAsync(serviceData);
      return true;
    } catch {
      return false;
    }
  };

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Service> }) => 
      servicesApi.updateService(user!.id, id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services', user?.id] });
      toast({ title: 'Sucesso', description: 'Serviço atualizado com sucesso!' });
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar serviço:', error);
      toast({ title: 'Erro', description: 'Não foi possível atualizar o serviço.', variant: 'destructive' });
    }
  });

  const updateService = async (id: string, updates: Partial<Service>) => {
    if (!user) return false;
    try {
      await updateServiceMutation.mutateAsync({ id, updates });
      return true;
    } catch {
      return false;
    }
  };

  const deleteServiceMutation = useMutation({
    mutationFn: (id: string) => servicesApi.deleteService(user!.id, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services', user?.id] });
      toast({ title: 'Sucesso', description: 'Serviço excluído com sucesso!' });
    },
    onError: (error: any) => {
      console.error('Erro ao excluir serviço:', error);
      toast({ title: 'Erro', description: 'Não foi possível excluir o serviço.', variant: 'destructive' });
    }
  });

  const deleteService = async (id: string) => {
    if (!user) return false;
    try {
      await deleteServiceMutation.mutateAsync(id);
      return true;
    } catch {
      return false;
    }
  };

  const toggleServiceStatus = async (id: string, active: boolean) => updateService(id, { active });

  return {
    services: data || [],
    isLoading,
    createService,
    updateService,
    deleteService,
    toggleServiceStatus,
    refetch,
  };
};
