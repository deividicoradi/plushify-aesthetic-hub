
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useInstallmentsData = () => {
  const { user } = useAuth();

  const { data: installments, isLoading, refetch } = useQuery({
    queryKey: ['installments', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('installments')
        .select('*')
        .eq('user_id', user?.id)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Buscar dados dos pagamentos com informações dos clientes
  const { data: payments } = useQuery({
    queryKey: ['payments-for-installments', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          id, 
          description, 
          amount, 
          client_id,
          payment_methods(name)
        `)
        .eq('user_id', user?.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Buscar dados dos clientes
  const { data: clients } = useQuery({
    queryKey: ['clients-for-installments', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, email, phone')
        .eq('user_id', user?.id);

      if (error) throw error;
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
      acc[paymentId] = {
        payment: paymentData,
        client: clientData,
        installments: []
      };
    }
    acc[paymentId].installments.push(installment);
    return acc;
  }, {} as any);

  return {
    installments,
    groupedInstallments,
    isLoading,
    refetch
  };
};
