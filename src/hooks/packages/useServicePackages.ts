import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ServicePackage {
  id: string;
  user_id: string;
  service_id: string;
  name: string;
  total_sessions: number;
  price: number;
  validity_days: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServicePackageInput {
  service_id: string;
  name: string;
  total_sessions: number;
  price: number;
  validity_days: number;
  active?: boolean;
}

export const useServicePackages = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const queryKey = ['service-packages', user?.id];

  const { data: servicePackages = [], isLoading: loading, refetch } = useQuery({
    queryKey,
    enabled: !!user?.id,
    queryFn: async (): Promise<ServicePackage[]> => {
      const { data, error } = await supabase
        .from('service_packages')
        .select('id,user_id,service_id,name,total_sessions,price,validity_days,active,created_at,updated_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 60_000,
  });

  const createMutation = useMutation({
    mutationFn: async (input: ServicePackageInput) => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('service_packages')
        .insert({ ...input, user_id: authUser.id })
        .select()
        .single();

      if (error) throw error;
      return data as ServicePackage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: 'Sucesso', description: 'Modelo de pacote criado com sucesso!' });
    },
    onError: (error: any) => {
      console.error('Erro ao criar modelo de pacote:', error);
      toast({ title: 'Erro', description: error?.message || 'Não foi possível criar o pacote.', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<ServicePackageInput> }) => {
      const { data, error } = await supabase
        .from('service_packages')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as ServicePackage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: 'Sucesso', description: 'Modelo de pacote atualizado com sucesso!' });
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar modelo de pacote:', error);
      toast({ title: 'Erro', description: error?.message || 'Não foi possível atualizar o pacote.', variant: 'destructive' });
    },
  });

  return {
    servicePackages,
    loading,
    createServicePackage: (input: ServicePackageInput) => createMutation.mutateAsync(input),
    updateServicePackage: (id: string, input: Partial<ServicePackageInput>) =>
      updateMutation.mutateAsync({ id, input }),
    refetch,
  };
};
