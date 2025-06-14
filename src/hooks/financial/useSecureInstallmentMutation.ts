
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";
import { useAuditLog } from '@/hooks/useAuditLog';

export const useSecureInstallmentMutation = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { createAuditLog } = useAuditLog();

  const updateMutation = useMutation({
    mutationFn: async ({ installmentId, data, reason }: { installmentId: string; data: any; reason?: string }) => {
      // Buscar dados originais para auditoria
      const { data: originalData } = await supabase
        .from('installments')
        .select('*')
        .eq('id', installmentId)
        .single();

      const { data: updateResult, error } = await supabase
        .from('installments')
        .update(data)
        .eq('id', installmentId)
        .select('*')
        .single();

      if (error) throw error;

      // Criar log de auditoria
      await createAuditLog({
        tableName: 'installments',
        recordId: installmentId,
        action: 'UPDATE',
        oldData: originalData,
        newData: updateResult,
        reason
      });

      return updateResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installments'] });
      queryClient.invalidateQueries({ queryKey: ['installments-by-client'] });
      toast({
        title: "Sucesso!",
        description: "Parcela atualizada com segurança!",
      });
      onSuccess?.();
    },
    onError: (error) => {
      console.error('Erro ao atualizar parcela:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar parcela",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ installmentId, reason }: { installmentId: string; reason?: string }) => {
      // Buscar dados originais para auditoria
      const { data: originalData } = await supabase
        .from('installments')
        .select('*')
        .eq('id', installmentId)
        .single();

      const { error } = await supabase
        .from('installments')
        .delete()
        .eq('id', installmentId);

      if (error) throw error;

      // Criar log de auditoria
      await createAuditLog({
        tableName: 'installments',
        recordId: installmentId,
        action: 'DELETE',
        oldData: originalData,
        reason
      });

      return originalData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installments'] });
      queryClient.invalidateQueries({ queryKey: ['installments-by-client'] });
      toast({
        title: "Sucesso!",
        description: "Parcela excluída com segurança.",
      });
      onSuccess?.();
    },
    onError: (error) => {
      console.error('Erro ao excluir parcela:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir parcela",
        variant: "destructive",
      });
    },
  });

  return {
    updateInstallment: updateMutation.mutate,
    deleteInstallment: deleteMutation.mutate,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};
