
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, DollarSign, CheckCircle } from 'lucide-react';
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
      const { data, error } = await supabase
        .from('installments')
        .update({
          status: 'pago',
          paid_amount: installment.amount,
          payment_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', installment.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Parcela marcada como paga!",
      });
      queryClient.invalidateQueries({ queryKey: ['installments-by-client'] });
      onUpdate();
    },
    onError: (error) => {
      console.error('Erro ao marcar parcela como paga:', error);
      toast({
        title: "Erro",
        description: "Erro ao marcar parcela como paga",
        variant: "destructive",
      });
    },
  });

  const markAsPartialMutation = useMutation({
    mutationFn: async (paidAmount: number) => {
      const { data, error } = await supabase
        .from('installments')
        .update({
          status: 'parcial',
          paid_amount: paidAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', installment.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Pagamento parcial registrado!",
      });
      queryClient.invalidateQueries({ queryKey: ['installments-by-client'] });
      onUpdate();
    },
    onError: (error) => {
      console.error('Erro ao registrar pagamento parcial:', error);
      toast({
        title: "Erro",
        description: "Erro ao registrar pagamento parcial",
        variant: "destructive",
      });
    },
  });

  const handlePartialPayment = () => {
    const paidAmount = prompt(`Digite o valor pago (máximo R$ ${Number(installment.amount).toFixed(2)}):`);
    if (paidAmount && !isNaN(Number(paidAmount))) {
      const amount = Number(paidAmount);
      if (amount > 0 && amount <= Number(installment.amount)) {
        markAsPartialMutation.mutate(amount);
      } else {
        toast({
          title: "Valor inválido",
          description: "O valor deve ser maior que zero e menor ou igual ao valor da parcela",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="flex flex-col gap-2 mt-auto">
      {installment.status === 'pendente' && (
        <>
          <Button
            size="sm"
            onClick={() => markAsPaidMutation.mutate()}
            disabled={markAsPaidMutation.isPending}
            className="w-full"
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Marcar como Pago
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handlePartialPayment}
            disabled={markAsPartialMutation.isPending}
            className="w-full"
          >
            <DollarSign className="w-3 h-3 mr-1" />
            Pagamento Parcial
          </Button>
        </>
      )}
      
      {installment.status === 'parcial' && (
        <div className="space-y-2">
          <Badge variant="outline" className="w-full justify-center bg-orange-50 text-orange-700 border-orange-200">
            Restante: R$ {(Number(installment.amount) - Number(installment.paid_amount || 0)).toFixed(2)}
          </Badge>
          <Button
            size="sm"
            onClick={() => markAsPaidMutation.mutate()}
            disabled={markAsPaidMutation.isPending}
            className="w-full"
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Quitar Restante
          </Button>
        </div>
      )}

      <Button
        size="sm"
        variant="outline"
        onClick={() => onEdit(installment)}
        className="w-full"
      >
        <Edit className="w-3 h-3 mr-1" />
        Editar
      </Button>
    </div>
  );
};

export default InstallmentActions;
