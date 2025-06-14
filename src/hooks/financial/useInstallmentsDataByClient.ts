
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useInstallmentsDataByClient = () => {
  const { user } = useAuth();

  const { data: installmentsData, isLoading, refetch } = useQuery({
    queryKey: ['installments-by-client', user?.id],
    queryFn: async () => {
      console.log('🔍 Buscando parcelamentos agrupados por cliente para usuário:', user?.id);
      
      // Buscar todos os parcelamentos com dados dos pagamentos e clientes
      const { data: installments, error } = await supabase
        .from('installments')
        .select(`
          *,
          payments (
            id,
            description,
            amount,
            client_id,
            payment_methods (name)
          )
        `)
        .eq('user_id', user?.id)
        .order('due_date', { ascending: true });

      if (error) {
        console.error('❌ Erro ao buscar parcelamentos:', error);
        throw error;
      }

      // Buscar dados dos clientes
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id, name, email, phone')
        .eq('user_id', user?.id);

      if (clientsError) {
        console.error('❌ Erro ao buscar clientes:', clientsError);
        throw clientsError;
      }

      console.log('📋 Parcelamentos encontrados:', installments?.length || 0);
      console.log('👥 Clientes encontrados:', clients?.length || 0);

      // Agrupar parcelamentos por cliente
      const installmentsByClient = new Map();
      const installmentsWithoutClient = [];

      installments?.forEach(installment => {
        const clientId = installment.payments?.client_id;
        
        if (clientId) {
          const client = clients?.find(c => c.id === clientId);
          if (client) {
            if (!installmentsByClient.has(clientId)) {
              installmentsByClient.set(clientId, {
                ...client,
                installments: []
              });
            }
            installmentsByClient.get(clientId).installments.push({
              ...installment,
              payment: installment.payments
            });
          } else {
            installmentsWithoutClient.push({
              ...installment,
              payment: installment.payments
            });
          }
        } else {
          installmentsWithoutClient.push({
            ...installment,
            payment: installment.payments
          });
        }
      });

      const clientGroups = Array.from(installmentsByClient.values());
      console.log('📊 Parcelamentos agrupados por cliente:', clientGroups.length, 'grupos');
      console.log('🔍 Parcelamentos sem cliente:', installmentsWithoutClient.length);

      return {
        clientGroups,
        installmentsWithoutClient,
        totalInstallments: installments?.length || 0
      };
    },
    enabled: !!user?.id,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  return {
    clientGroups: installmentsData?.clientGroups || [],
    installmentsWithoutClient: installmentsData?.installmentsWithoutClient || [],
    totalInstallments: installmentsData?.totalInstallments || 0,
    isLoading,
    refetch
  };
};
