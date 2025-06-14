
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/hooks/use-toast";
import { useCashIntegration } from '@/hooks/useCashIntegration';
import { usePaymentInstallments } from './usePaymentInstallments';

export const usePaymentMutation = (payment?: any, onSuccess?: () => void) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { updateCashFromPayment } = useCashIntegration();
  const { createInstallmentsForPartialPayment } = usePaymentInstallments();

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('Dados sendo enviados para pagamento:', data);
      
      let result;
      if (payment) {
        const { data: updateResult, error } = await supabase
          .from('payments')
          .update(data)
          .eq('id', payment.id)
          .select('*')
          .single();
        
        if (error) {
          console.error('Erro ao atualizar pagamento:', error);
          throw error;
        }
        result = updateResult;
      } else {
        const { data: insertResult, error } = await supabase
          .from('payments')
          .insert([{ ...data, user_id: user?.id }])
          .select('*')
          .single();
        
        if (error) {
          console.error('Erro ao inserir pagamento:', error);
          throw error;
        }
        result = insertResult;
      }

      return result;
    },
    onSuccess: async (result) => {
      console.log('💰 Pagamento salvo com sucesso:', result);

      // Se o pagamento foi marcado como pago e tem valor pago, atualizar o caixa
      if (result.status === 'pago' && Number(result.paid_amount) > 0) {
        console.log('🔄 Iniciando atualização do caixa...');
        
        try {
          await updateCashFromPayment.mutateAsync({
            paymentAmount: Number(result.paid_amount),
            paymentMethodId: result.payment_method_id,
            description: result.description || 'Pagamento recebido'
          });
          console.log('✅ Caixa atualizado com sucesso!');
        } catch (error) {
          console.error('❌ Erro ao atualizar caixa:', error);
          // Não falhar a operação principal se houver erro no caixa
          toast({
            title: "Atenção",
            description: "Pagamento salvo, mas houve erro ao atualizar o caixa. Verifique manualmente.",
            variant: "destructive",
          });
        }
      }

      // Se o pagamento foi marcado como parcial, criar parcelamento automático
      if (result.status === 'parcial' && Number(result.paid_amount) > 0) {
        console.log('📝 Criando parcelamento automático para pagamento parcial...');
        
        try {
          await createInstallmentsForPartialPayment(result);
          toast({
            title: "Parcelamento criado!",
            description: "O valor restante foi automaticamente registrado em Parcelamentos.",
          });
        } catch (error) {
          console.error('❌ Erro ao criar parcelamento automático:', error);
          toast({
            title: "Atenção",
            description: "Pagamento salvo, mas houve erro ao criar o parcelamento automático.",
            variant: "destructive",
          });
        }
      }

      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      queryClient.invalidateQueries({ queryKey: ['installments'] });
      toast({
        title: "Sucesso!",
        description: payment ? 'Pagamento atualizado!' : 'Pagamento criado!',
      });
      onSuccess?.();
    },
    onError: (error) => {
      console.error('Erro completo:', error);
      toast({
        title: "Erro",
        description: 'Erro ao salvar pagamento: ' + (error.message || 'Erro desconhecido'),
        variant: "destructive",
      });
    },
  });

  return mutation;
};
