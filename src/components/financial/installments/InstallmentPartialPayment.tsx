
import React from 'react';
import { toast } from "@/hooks/use-toast";

interface InstallmentPartialPaymentProps {
  installment: any;
  isCashClosed: boolean;
  onSecureAction: (type: 'markPartial', data?: any) => void;
}

const InstallmentPartialPayment = ({
  installment,
  isCashClosed,
  onSecureAction
}: InstallmentPartialPaymentProps) => {
  const handlePartialPayment = () => {
    if (isCashClosed) {
      toast({
        title: "Caixa fechado",
        description: "Não é possível realizar pagamentos com o caixa fechado",
        variant: "destructive",
      });
      return;
    }

    const paidAmount = prompt(`Digite o valor pago (máximo R$ ${Number(installment.amount).toFixed(2)}):`);
    if (paidAmount && !isNaN(Number(paidAmount))) {
      const amount = Number(paidAmount);
      if (amount > 0 && amount <= Number(installment.amount)) {
        onSecureAction('markPartial', { paidAmount: amount });
      } else {
        toast({
          title: "Valor inválido",
          description: "O valor deve ser maior que zero e menor ou igual ao valor da parcela",
          variant: "destructive",
        });
      }
    }
  };

  return { handlePartialPayment };
};

export default InstallmentPartialPayment;
