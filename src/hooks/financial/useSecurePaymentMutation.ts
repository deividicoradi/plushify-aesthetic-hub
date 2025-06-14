
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/hooks/use-toast";
import { useCashIntegration } from '@/hooks/useCashIntegration';
import { usePaymentInstallments } from './usePaymentInstallments';
import { useAuditLog } from '@/hooks/useAuditLog';

export const useSecurePaymentMutation = (payment?: any, onSuccess?: () => void) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { updateCashFromPayment } = useCashIntegration();
  const { createInstallmentsForPartialPayment } = usePaymentInstallments();
  const { createAuditLog } = useAuditLog();

  const updateMutation = useMutation({
    mutationFn: async ({ data, reason }: { data: any; reason?: string }) => {
      console.log('💾 Atualizando pagamento com auditoria:', data);
      
      // Buscar dados originais para auditoria
      const { data: originalData } = await supabase
        .from('payments')
        .select('*')
        .eq('id', payment.id)
        .single();

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

      // Mesmo processamento que antes para caixa e parcelamentos
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
        description: 'Erro ao atualizar pagamento: ' + (error.message || 'Erro desconhecido'),
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ reason }: { reason?: string }) => {
      if (!payment?.id) {
        throw new Error('ID do pagamento não encontrado');
      }

      console.log('🗑️ Excluindo pagamento:', payment.id);

      // Buscar dados originais para auditoria
      const { data: originalData } = await supabase
        .from('payments')
        .select('*')
        .eq('id', payment.id)
        .single();

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
            paymentAmount: -Number(deletedPayment.paid_amount), // Valor negativo para descontar
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
        description: "Erro ao excluir pagamento: " + (error.message || 'Erro desconhecido'),
        variant: "destructive",
      });
    },
  });

  return {
    updatePayment: updateMutation.mutate,
    deletePayment: deleteMutation.mutate,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};
