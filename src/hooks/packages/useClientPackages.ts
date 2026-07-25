import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ClientPackage {
  id: string;
  user_id: string;
  client_id: string;
  service_id: string;
  service_package_id: string | null;
  package_name: string;
  total_sessions: number;
  sessions_used: number;
  price: number;
  purchased_at: string;
  expires_at: string;
  status: 'active' | 'completed' | 'expired' | 'cancelled';
  created_at: string;
  updated_at: string;
}

// status='active' persistido não vira 'expired' automaticamente (sem cron) —
// aqui é sempre recalculado junto com expires_at ao consumir a lista.
export const isPackageUsable = (pkg: ClientPackage) =>
  pkg.status === 'active' && new Date(pkg.expires_at) > new Date() && pkg.sessions_used < pkg.total_sessions;

const SELECT_COLUMNS = 'id,user_id,client_id,service_id,service_package_id,package_name,total_sessions,sessions_used,price,purchased_at,expires_at,status,created_at,updated_at';

// clientId omitido: lista os pacotes de todos os clientes (tela "Pacotes Vendidos").
export const useClientPackages = (clientId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const queryKey = ['client-packages', user?.id, clientId ?? 'all'];

  const { data: clientPackages = [], isLoading: loading, refetch } = useQuery({
    queryKey,
    enabled: !!user?.id,
    queryFn: async (): Promise<ClientPackage[]> => {
      let query = supabase
        .from('client_packages')
        .select(SELECT_COLUMNS)
        .order('purchased_at', { ascending: false });

      if (clientId) query = query.eq('client_id', clientId);

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as ClientPackage[];
    },
    staleTime: 30_000,
  });

  const purchaseMutation = useMutation({
    mutationFn: async (args: { clientId: string; servicePackageId: string; paymentMethodId: string }) => {
      const { data, error } = await supabase.rpc('purchase_client_package', {
        p_client_id: args.clientId,
        p_service_package_id: args.servicePackageId,
        p_payment_method_id: args.paymentMethodId,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-packages'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast({ title: 'Sucesso', description: 'Pacote vendido com sucesso!' });
    },
    onError: (error: any) => {
      console.error('Erro ao vender pacote:', error);
      toast({ title: 'Erro', description: error?.message || 'Não foi possível vender o pacote.', variant: 'destructive' });
    },
  });

  return {
    clientPackages,
    loading,
    purchasePackage: (clientId: string, servicePackageId: string, paymentMethodId: string) =>
      purchaseMutation.mutateAsync({ clientId, servicePackageId, paymentMethodId }),
    refetch,
  };
};

// Uso pontual (ex: badge no diálogo de agendamento) sem carregar a lista
// completa de pacotes vendidos.
export const useClientPackageBalance = (clientId?: string, serviceId?: string) => {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['client-package-balance', user?.id, clientId, serviceId],
    enabled: !!user?.id && !!clientId && !!serviceId,
    queryFn: async (): Promise<ClientPackage | null> => {
      const { data, error } = await supabase
        .from('client_packages')
        .select(SELECT_COLUMNS)
        .eq('client_id', clientId!)
        .eq('service_id', serviceId!)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as ClientPackage | null;
    },
    staleTime: 30_000,
  });

  return { activePackage: data ?? null, isLoading };
};
