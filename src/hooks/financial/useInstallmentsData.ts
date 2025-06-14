
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useInstallmentsData = () => {
  const { user } = useAuth();

  const { data: installments, isLoading, refetch } = useQuery({
    queryKey: ['installments', user?.id],
    queryFn: async () => {
      console.log('🔍 Buscando parcelamentos para usuário:', user?.id);
      const { data, error } = await supabase
        .from('installments')
        .select('*')
        .eq('user_id', user?.id)
        .order('due_date', { ascending: true });

      if (error) {
        console.error('❌ Erro ao buscar parcelamentos:', error);
        throw error;
      }
      
      console.log('📋 Parcelamentos encontrados:', data?.length || 0);
      return data;
    },
    enabled: !!user?.id,
  });

  // Buscar dados dos pagamentos com informações dos clientes
  const { data: payments } = useQuery({
    queryKey: ['payments-for-installments', user?.id],
    queryFn: async () => {
      console.log('🔍 Buscando pagamentos para parcelamentos');
      const { data, error } = await supabase
        .from('payments')
        .select(`
          id, 
          description, 
          amount, 
          client_id,
          status,
          payment_methods(name)
        `)
        .eq('user_id', user?.id);

      if (error) {
        console.error('❌ Erro ao buscar pagamentos:', error);
        throw error;
      }
      
      console.log('💰 Pagamentos encontrados:', data?.length || 0);
      return data;
    },
    enabled: !!user?.id,
  });

  // Buscar dados dos clientes
  const { data: clients } = useQuery({
    queryKey: ['clients-for-installments', user?.id],
    queryFn: async () => {
      console.log('🔍 Buscando clientes para parcelamentos');
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, email, phone')
        .eq('user_id', user?.id);

      if (error) {
        console.error('❌ Erro ao buscar clientes:', error);
        throw error;
      }
      
      console.log('👥 Clientes encontrados:', data?.length || 0);
      return data;
    },
    enabled: !!user?.id,
  });

  const getPaymentData = (paymentId: string) => {
    return payments?.find(p => p.id === paymentId);
  };

  const getClientData = (clientId: string | null) => {
    if (!clientId || !clients) return null;
    return clients.find(c => c.id === clientId);
  };

  const groupedInstallments = installments?.reduce((acc, installment) => {
    const paymentId = installment.payment_id;
    if (!acc[paymentId]) {
      const paymentData = getPaymentData(paymentId);
      const clientData = paymentData?.client_id ? getClientData(paymentData.client_id) : null;
      
      console.log(`🔗 Agrupando parcelamento para pagamento ${paymentId}:`, {
        payment: paymentData?.description,
        client: clientData?.name,
        installmentCount: 1
      });
      
      acc[paymentId] = {
        payment: paymentData,
        client: clientData,
        installments: []
      };
    }
    acc[paymentId].installments.push(installment);
    return acc;
  }, {} as any);

  console.log('📊 Parcelamentos agrupados:', Object.keys(groupedInstallments || {}).length, 'grupos');

  return {
    installments,
    groupedInstallments,
    isLoading,
    refetch
  };
};
