
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/hooks/use-toast";
import * as paymentsApi from '@/api/payments';
import * as clientsApi from '@/api/clients';

const PAGE_SIZE = 200;

export const usePaymentsData = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  // Sem limite, essa tela buscava o histórico inteiro de pagamentos do
  // usuário a cada carregamento — cresce sem parar com o tempo de uso da
  // conta. "Carregar mais" aumenta o limite e refaz a busca, mesmo padrão
  // já usado no Controle de Caixa.
  const [limit, setLimit] = useState(PAGE_SIZE);

  const { data: payments, isLoading } = useQuery({
    queryKey: ['payments', user?.id, limit],
    queryFn: () => paymentsApi.fetchPayments(user!.id, limit),
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  const hasMore = (payments?.length ?? 0) >= limit;
  const loadMore = () => setLimit((prev) => prev + PAGE_SIZE);

  const { data: clients } = useQuery({
    queryKey: ['clients', user?.id],
    queryFn: () => clientsApi.fetchClients(user!.id),
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  const deletePaymentMutation = useMutation({
    mutationFn: (paymentId: string) => paymentsApi.deletePayment(user!.id, paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast({ title: 'Sucesso!', description: 'Pagamento excluído com sucesso.' });
    },
    onError: (error) => {
      toast({ title: 'Erro', description: 'Erro ao excluir pagamento', variant: 'destructive' });
      console.error(error);
    },
  });

  const getClientName = (clientId: string | null) => {
    if (!clientId || !clients) return null;
    const client = clients.find(c => c.id === clientId);
    return client?.name;
  };

  return {
    payments,
    clients,
    isLoading,
    deletePayment: deletePaymentMutation.mutate,
    getClientName,
    hasMore,
    loadMore,
  };
};
