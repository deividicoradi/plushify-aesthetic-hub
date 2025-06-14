
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";
import { useCashIntegration } from '@/hooks/useCashIntegration';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useCashStatusValidation } from './useCashStatusValidation';

export const usePaymentDeleteMutation = (payment?: any, onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { updateCashFromPayment } = useCashIntegration();
  const { createAuditLog } = useAuditLog();
  const { validateCashIsOpen } = useCashStatusValidation();

  const deleteMutation = useMutation({
    mutationFn: async ({ reason }: { reason?: string }) => {
      if (!payment?.id) {
        throw new Error('ID do pagamento não encontrado');
      }

      console.log('🗑️ Excluindo pagamento:', payment.id);

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

      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', payment.id);
      
      if (error) {
        console.error('❌ Erro ao excluir pagamento:', error);
        throw error;
      }

      // Criar log de auditoria
      await createAuditLog({
        tableName: 'payments',
        recordId: payment.id,
        action: 'DELETE',
        oldData: originalData,
        reason
      });

      return originalData;
    },
    onSuccess: async (deletedPayment) => {
      console.log('✅ Pagamento excluído com sucesso');
      
      // Se o pagamento excluído tinha valor pago, descontar do caixa
      if (deletedPayment && (deletedPayment.status === 'pago' || deletedPayment.status === 'parcial') && Number(deletedPayment.paid_amount) > 0) {
        console.log('💰 Descontando valor excluído do caixa:', deletedPayment.paid_amount);
        try {
          await updateCashFromPayment.mutateAsync({
            paymentAmount: -Number(deletedPayment.paid_amount),
            paymentMethodId: deletedPayment.payment_method_id,
            description: `Desconto por exclusão: ${deletedPayment.description || 'Pagamento excluído'}`
          });
          
          toast({
            title: "Pagamento excluído!",
            description: `O valor de R$ ${Number(deletedPayment.paid_amount).toFixed(2)} foi descontado do caixa.`,
          });
        } catch (error) {
          console.error('❌ Erro ao descontar do caixa:', error);
          toast({
            title: "Atenção",
            description: "Pagamento excluído, mas houve erro ao atualizar o caixa. Verifique manualmente.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Sucesso!",
          description: "Pagamento excluído com segurança.",
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['cash-openings'] });
      queryClient.invalidateQueries({ queryKey: ['cash-closures'] });
      onSuccess?.();
    },
    onError: (error) => {
      console.error('❌ Erro ao excluir pagamento:', error);
      toast({
        title: "Erro",
        description: error.message || 'Erro desconhecido',
        variant: "destructive",
      });
    },
  });

  return {
    deletePayment: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending
  };
};
