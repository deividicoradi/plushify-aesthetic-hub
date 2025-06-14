
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";
import { useCashIntegration } from '@/hooks/useCashIntegration';
import { usePaymentInstallments } from './usePaymentInstallments';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useCashStatusValidation } from './useCashStatusValidation';

export const usePaymentUpdateMutation = (payment?: any, onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { updateCashFromPayment } = useCashIntegration();
  const { createInstallmentsForPartialPayment } = usePaymentInstallments();
  const { createAuditLog } = useAuditLog();
  const { validateCashIsOpen } = useCashStatusValidation();

  const updateMutation = useMutation({
    mutationFn: async ({ data, reason }: { data: any; reason?: string }) => {
      console.log('💾 Atualizando pagamento com auditoria:', data);
      
      // Buscar dados originais para auditoria e validação
      const { data: originalData } = await supabase
        .from('payments')
        .select('*')
        .eq('id', payment.id)
        .single();

      if (!originalData) {
        throw new Error('Pagamento não encontrado');
      }

      // Validar se o caixa está aberto para a data de criação do pagamento
      const validation = await validateCashIsOpen(originalData.created_at);
      if (!validation.isValid) {
        throw new Error(validation.message);
      }

      const { data: updateResult, error } = await supabase
        .from('payments')
        .update(data)
        .eq('id', payment.id)
        .select('*')
        .single();
      
      if (error) {
        console.error('❌ Erro ao atualizar pagamento:', error);
        throw error;
      }

      // Criar log de auditoria
      await createAuditLog({
        tableName: 'payments',
        recordId: payment.id,
        action: 'UPDATE',
        oldData: originalData,
        newData: updateResult,
        reason
      });

      return updateResult;
    },
    onSuccess: async (result) => {
      console.log('💰 Pagamento atualizado com sucesso:', result);

      // Processamento de caixa e parcelamentos
      if ((result.status === 'pago' || result.status === 'parcial') && Number(result.paid_amount) > 0) {
        try {
          await updateCashFromPayment.mutateAsync({
            paymentAmount: Number(result.paid_amount),
            paymentMethodId: result.payment_method_id,
            description: result.description || 'Pagamento recebido'
          });
        } catch (error) {
          console.error('❌ Erro ao atualizar caixa:', error);
          toast({
            title: "Atenção",
            description: "Pagamento atualizado, mas houve erro ao atualizar o caixa.",
            variant: "destructive",
          });
        }
      }

      if (result.status === 'parcial' && Number(result.paid_amount) > 0) {
        try {
          await createInstallmentsForPartialPayment(result);
          toast({
            title: "Parcelamento criado!",
            description: `O valor restante de R$ ${(Number(result.amount) - Number(result.paid_amount)).toFixed(2)} foi registrado em Parcelamentos.`,
          });
        } catch (error) {
          console.error('❌ Erro ao criar parcelamento automático:', error);
        }
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['payments'] }),
        queryClient.invalidateQueries({ queryKey: ['installments'] }),
        queryClient.invalidateQueries({ queryKey: ['cash-openings'] }),
        queryClient.invalidateQueries({ queryKey: ['cash-closures'] })
      ]);
      
      toast({
        title: "Sucesso!",
        description: 'Pagamento atualizado com segurança!',
      });
      onSuccess?.();
    },
    onError: (error) => {
      console.error('❌ Erro completo:', error);
      toast({
        title: "Erro",
        description: error.message || 'Erro desconhecido',
        variant: "destructive",
      });
    },
  });

  return {
    updatePayment: updateMutation.mutate,
    isUpdating: updateMutation.isPending
  };
};
