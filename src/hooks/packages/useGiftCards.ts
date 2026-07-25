import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ClientGiftCard {
  id: string;
  user_id: string;
  client_id: string;
  initial_value: number;
  balance: number;
  status: 'active' | 'redeemed' | 'cancelled';
  purchased_at: string;
  created_at: string;
  updated_at: string;
}

const SELECT_COLUMNS = 'id,user_id,client_id,initial_value,balance,status,purchased_at,created_at,updated_at';

export const useGiftCards = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const queryKey = ['gift-cards', user?.id];

  const { data: giftCards = [], isLoading: loading, refetch } = useQuery({
    queryKey,
    enabled: !!user?.id,
    queryFn: async (): Promise<ClientGiftCard[]> => {
      const { data, error } = await supabase
        .from('client_gift_cards')
        .select(SELECT_COLUMNS)
        .order('purchased_at', { ascending: false });

      if (error) throw error;
      return (data || []) as ClientGiftCard[];
    },
    staleTime: 30_000,
  });

  const purchaseMutation = useMutation({
    mutationFn: async (args: { clientId: string; value: number; paymentMethodId: string }) => {
      const { data, error } = await supabase.rpc('purchase_gift_card', {
        p_client_id: args.clientId,
        p_value: args.value,
        p_payment_method_id: args.paymentMethodId,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gift-cards'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast({ title: 'Sucesso', description: 'Vale-presente vendido com sucesso!' });
    },
    onError: (error: any) => {
      console.error('Erro ao vender vale-presente:', error);
      toast({ title: 'Erro', description: error?.message || 'Não foi possível vender o vale-presente.', variant: 'destructive' });
    },
  });

  const redeemMutation = useMutation({
    mutationFn: async (args: { giftCardId: string; amount: number; note?: string }) => {
      const { data, error } = await supabase.rpc('redeem_gift_card', {
        p_gift_card_id: args.giftCardId,
        p_amount: args.amount,
        p_note: args.note || undefined,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gift-cards'] });
      toast({ title: 'Sucesso', description: 'Uso registrado com sucesso!' });
    },
    onError: (error: any) => {
      console.error('Erro ao registrar uso do vale-presente:', error);
      toast({ title: 'Erro', description: error?.message || 'Não foi possível registrar o uso.', variant: 'destructive' });
    },
  });

  return {
    giftCards,
    loading,
    purchaseGiftCard: (clientId: string, value: number, paymentMethodId: string) =>
      purchaseMutation.mutateAsync({ clientId, value, paymentMethodId }),
    redeemGiftCard: (giftCardId: string, amount: number, note?: string) =>
      redeemMutation.mutateAsync({ giftCardId, amount, note }),
    refetch,
  };
};
