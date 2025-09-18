
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import * as installmentsApi from '@/api/installments';
import * as paymentsApi from '@/api/payments';
import * as clientsApi from '@/api/clients';

export const useInstallmentsData = () => {
  const { user } = useAuth();

  const { data: installments, isLoading, refetch } = useQuery({
    queryKey: ['installments', user?.id],
    queryFn: () => installmentsApi.fetchInstallments(user!.id),
    enabled: !!user?.id,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const { data: payments, refetch: refetchPayments } = useQuery({
    queryKey: ['payments-for-installments', user?.id],
    queryFn: () => paymentsApi.fetchPayments(user!.id),
    enabled: !!user?.id,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const { data: clients, refetch: refetchClients } = useQuery({
    queryKey: ['clients', user?.id],
    queryFn: () => clientsApi.fetchClients(user!.id),
    enabled: !!user?.id,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: 2,
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

  const refetchAll = () => {
    console.log('🔄 Refazendo busca de todos os dados de parcelamentos...');
    refetch();
    refetchPayments();
    refetchClients();
  };

  return {
    installments,
    groupedInstallments,
    isLoading,
    refetch: refetchAll
  };
};
