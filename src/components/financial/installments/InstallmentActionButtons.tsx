
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, DollarSign, CheckCircle, Trash2 } from 'lucide-react';

interface InstallmentActionButtonsProps {
  installment: any;
  isCashClosed: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  onSecureAction: (type: 'edit' | 'delete' | 'markPaid' | 'markPartial', data?: any) => void;
  onPartialPayment: () => void;
}

const InstallmentActionButtons = ({
  installment,
  isCashClosed,
  isUpdating,
  isDeleting,
  onSecureAction,
  onPartialPayment
}: InstallmentActionButtonsProps) => {
  return (
    <div className="flex flex-col gap-2 mt-auto">
      {installment.status === 'pendente' && (
        <>
          <Button
            size="sm"
            onClick={() => onSecureAction('markPaid')}
            disabled={isUpdating || isCashClosed}
            className="w-full"
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Marcar como Pago
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onPartialPayment}
            disabled={isUpdating || isCashClosed}
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
            onClick={() => onSecureAction('markPaid')}
            disabled={isUpdating || isCashClosed}
            className="w-full"
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Quitar Restante
          </Button>
        </div>
      )}

      <div className="flex gap-1">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onSecureAction('edit')}
          disabled={isCashClosed}
          className="flex-1"
        >
          <Edit className="w-3 h-3 mr-1" />
          Editar
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onSecureAction('delete')}
          className="text-red-600 hover:text-red-700"
          disabled={isDeleting || isCashClosed}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};

export default InstallmentActionButtons;
