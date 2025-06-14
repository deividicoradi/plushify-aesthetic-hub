
import React from 'react';
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Check } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";

interface InstallmentActionsProps {
  installment: any;
  onEdit: (installment: any) => void;
  onUpdate: () => void;
}

const InstallmentActions = ({ installment, onEdit, onUpdate }: InstallmentActionsProps) => {
  const queryClient = useQueryClient();

  const markAsPaidMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('installments')
        .update({
          status: 'pago',
          paid_amount: Number(installment.amount),
          payment_date: new Date().toISOString()
        })
        .eq('id', installment.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installments'] });
      toast({
        title: "Sucesso!",
        description: "Parcela marcada como paga.",
      });
      onUpdate();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao marcar parcela como paga",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const deleteInstallmentMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('installments')
        .delete()
        .eq('id', installment.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installments'] });
      toast({
        title: "Sucesso!",
        description: "Parcela excluída com sucesso.",
      });
      onUpdate();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao excluir parcela",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const handleMarkAsPaid = () => {
    markAsPaidMutation.mutate();
  };

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir esta parcela?')) {
      deleteInstallmentMutation.mutate();
    }
  };

  return (
    <div className="flex flex-wrap gap-1 mt-auto pt-3">
      {installment.status === 'pendente' && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAsPaid}
          className="text-green-600 hover:text-green-700 flex-1"
        >
          <Check className="w-3 h-3 mr-1" />
          Pagar
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onEdit(installment)}
        className="flex-1"
      >
        <Edit className="w-3 h-3 mr-1" />
        Editar
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDelete}
        className="text-red-600 hover:text-red-700 flex-1"
      >
        <Trash2 className="w-3 h-3 mr-1" />
        Excluir
      </Button>
    </div>
  );
};

export default InstallmentActions;
