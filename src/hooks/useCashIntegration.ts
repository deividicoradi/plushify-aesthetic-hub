
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

      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }

      // Buscar o método de pagamento para saber o tipo
      const { data: paymentMethod, error: methodError } = await supabase
        .from('payment_methods')
        .select('name, type')
        .eq('id', paymentMethodId)
        .single();

      if (methodError) {
        console.error('Erro ao buscar método de pagamento:', methodError);
        throw new Error('Método de pagamento não encontrado');
      }

      console.log('Método de pagamento encontrado:', paymentMethod);

      // Verificar se existe um caixa aberto hoje
      const today = new Date().toISOString().split('T')[0];
      const { data: existingCashOpening, error: queryError } = await supabase
        .from('cash_openings')
        .select('*')
        .eq('user_id', user.id)
        .eq('opening_date', today)
        .eq('status', 'aberto')
        .maybeSingle();

      if (queryError) {
        console.error('Erro ao consultar caixa:', queryError);
        throw queryError;
      }

      if (existingCashOpening) {
        console.log('Caixa existente encontrado:', existingCashOpening);
        
        // Atualizar o caixa existente
        const updateData: any = {};
        
        const paymentType = paymentMethod.type.toLowerCase();
        console.log('Tipo de pagamento:', paymentType);
        
        if (paymentType === 'dinheiro' || paymentType === 'cash') {
          updateData.cash_amount = Number(existingCashOpening.cash_amount) + paymentAmount;
        } else if (paymentType === 'cartao' || paymentType === 'cartão' || paymentType === 'card' || paymentType.includes('cartao')) {
          updateData.card_amount = Number(existingCashOpening.card_amount) + paymentAmount;
        } else if (paymentType === 'pix') {
          updateData.pix_amount = Number(existingCashOpening.pix_amount) + paymentAmount;
        } else {
          updateData.other_amount = Number(existingCashOpening.other_amount) + paymentAmount;
        }

        console.log('Dados para atualização:', updateData);

        const { error: updateError } = await supabase
          .from('cash_openings')
          .update(updateData)
          .eq('id', existingCashOpening.id);

        if (updateError) {
          console.error('Erro ao atualizar caixa:', updateError);
          throw updateError;
        }

        console.log('✅ Caixa atualizado com sucesso');
      } else {
        console.log('Nenhum caixa aberto encontrado, criando novo...');
        
        // Criar uma nova abertura de caixa se não existir
        const newCashOpening: any = {
          user_id: user.id,
          opening_date: today,
          opening_balance: 0,
          cash_amount: 0,
          card_amount: 0,
          pix_amount: 0,
          other_amount: 0,
          notes: `Caixa criado automaticamente ao receber pagamento: ${description}`,
          status: 'aberto'
        };

        const paymentType = paymentMethod.type.toLowerCase();
        console.log('Criando novo caixa para tipo:', paymentType);
        
        if (paymentType === 'dinheiro' || paymentType === 'cash') {
          newCashOpening.cash_amount = paymentAmount;
        } else if (paymentType === 'cartao' || paymentType === 'cartão' || paymentType === 'card' || paymentType.includes('cartao')) {
          newCashOpening.card_amount = paymentAmount;
        } else if (paymentType === 'pix') {
          newCashOpening.pix_amount = paymentAmount;
        } else {
          newCashOpening.other_amount = paymentAmount;
        }

        console.log('Novo caixa a ser criado:', newCashOpening);

        const { error: createError } = await supabase
          .from('cash_openings')
          .insert([newCashOpening]);

        if (createError) {
          console.error('Erro ao criar caixa:', createError);
          throw createError;
        }

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
        description: "Erro ao atualizar o caixa com o pagamento: " + (error.message || 'Erro desconhecido'),
        variant: "destructive",
      });
    },
  });

  return {
    updateCashFromPayment,
    isUpdating: updateCashFromPayment.isPending
  };
};
