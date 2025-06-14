
import React from 'react';
import { Button } from "@/components/ui/button";
import { Edit, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";

interface InstallmentActionsProps {
  installment: any;
  onEdit: (installment: any) => void;
  onUpdate: () => void;
}

const InstallmentActions = ({ installment, onEdit, onUpdate }: InstallmentActionsProps) => {
  const handleMarkAsPaid = async () => {
    try {
      const { error } = await supabase
        .from('installments')
        .update({
          status: 'pago',
          payment_date: new Date().toISOString(),
          paid_amount: installment.amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', installment.id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Parcela marcada como paga.",
      });

      onUpdate();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar parcela",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsNotPaid = async () => {
    try {
      const { error } = await supabase
        .from('installments')
        .update({
          status: 'pendente',
          payment_date: null,
          paid_amount: 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', installment.id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Parcela marcada como não paga.",
      });

      onUpdate();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar parcela",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col gap-2 mt-auto">
      {installment.status === 'pendente' ? (
        <Button
          size="sm"
          onClick={handleMarkAsPaid}
          className="w-full bg-green-600 hover:bg-green-700 text-xs h-8"
        >
          <CheckCircle className="w-3 h-3 mr-1" />
          Marcar como Pago
        </Button>
      ) : (
        <Button
          size="sm"
          variant="destructive"
          onClick={handleMarkAsNotPaid}
          className="w-full text-xs h-8"
        >
          <XCircle className="w-3 h-3 mr-1" />
          Marcar como Não Pago
        </Button>
      )}
      
      <Button
        size="sm"
        variant="outline"
        onClick={() => onEdit(installment)}
        className="w-full text-xs h-8"
      >
        <Edit className="w-3 h-3 mr-1" />
        Editar
      </Button>
    </div>
  );
};

export default InstallmentActions;
