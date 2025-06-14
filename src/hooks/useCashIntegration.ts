
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/hooks/use-toast";

export const useCashIntegration = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const updateCashFromPayment = useMutation({
    mutationFn: async ({ 
      paymentAmount, 
      paymentMethodId, 
      description 
    }: { 
      paymentAmount: number; 
      paymentMethodId: string; 
      description: string; 
    }) => {
      console.log('💰 Atualizando caixa com pagamento recebido:', { paymentAmount, paymentMethodId, description });

      // Buscar o método de pagamento para saber o tipo
      const { data: paymentMethod } = await supabase
        .from('payment_methods')
        .select('name, type')
        .eq('id', paymentMethodId)
        .single();

      if (!paymentMethod) {
        throw new Error('Método de pagamento não encontrado');
      }

      // Verificar se existe um caixa aberto hoje
      const today = new Date().toISOString().split('T')[0];
      const { data: existingCashOpening } = await supabase
        .from('cash_openings')
        .select('*')
        .eq('user_id', user?.id)
        .eq('opening_date', today)
        .eq('status', 'aberto')
        .maybeSingle();

      if (existingCashOpening) {
        // Atualizar o caixa existente
        const updateData: any = {};
        
        switch (paymentMethod.type.toLowerCase()) {
          case 'dinheiro':
            updateData.cash_amount = Number(existingCashOpening.cash_amount) + paymentAmount;
            break;
          case 'cartao':
          case 'cartão':
            updateData.card_amount = Number(existingCashOpening.card_amount) + paymentAmount;
            break;
          case 'pix':
            updateData.pix_amount = Number(existingCashOpening.pix_amount) + paymentAmount;
            break;
          default:
            updateData.other_amount = Number(existingCashOpening.other_amount) + paymentAmount;
        }

        const { error: updateError } = await supabase
          .from('cash_openings')
          .update(updateData)
          .eq('id', existingCashOpening.id);

        if (updateError) throw updateError;

        console.log('✅ Caixa atualizado com sucesso');
      } else {
        // Criar uma nova abertura de caixa se não existir
        const newCashOpening: any = {
          user_id: user?.id,
          opening_date: today,
          opening_balance: 0,
          cash_amount: 0,
          card_amount: 0,
          pix_amount: 0,
          other_amount: 0,
          notes: `Caixa criado automaticamente ao receber pagamento: ${description}`,
          status: 'aberto'
        };

        switch (paymentMethod.type.toLowerCase()) {
          case 'dinheiro':
            newCashOpening.cash_amount = paymentAmount;
            break;
          case 'cartao':
          case 'cartão':
            newCashOpening.card_amount = paymentAmount;
            break;
          case 'pix':
            newCashOpening.pix_amount = paymentAmount;
            break;
          default:
            newCashOpening.other_amount = paymentAmount;
        }

        const { error: createError } = await supabase
          .from('cash_openings')
          .insert([newCashOpening]);

        if (createError) throw createError;

        console.log('✅ Novo caixa criado com pagamento');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-openings'] });
      queryClient.invalidateQueries({ queryKey: ['cash-closures'] });
      toast({
        title: "Caixa Atualizado!",
        description: "O valor do pagamento foi adicionado ao caixa.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Erro ao atualizar caixa:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar o caixa com o pagamento",
        variant: "destructive",
      });
    },
  });

  return {
    updateCashFromPayment,
    isUpdating: updateCashFromPayment.isPending
  };
};
