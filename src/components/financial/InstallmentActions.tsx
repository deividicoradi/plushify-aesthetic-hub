
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, DollarSign, CheckCircle, Trash2 } from 'lucide-react';
import PasswordDialog from '@/components/ui/password-dialog';
import { useAuthorizationPassword } from '@/hooks/useAuthorizationPassword';
import { useSecureInstallmentMutation } from '@/hooks/financial/useSecureInstallmentMutation';
import { useCashStatusValidation } from '@/hooks/financial/useCashStatusValidation';
import { toast } from "@/hooks/use-toast";

interface InstallmentActionsProps {
  installment: any;
  onEdit: (installment: any) => void;
  onUpdate: () => void;
}

const InstallmentActions = ({ installment, onEdit, onUpdate }: InstallmentActionsProps) => {
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ 
    type: 'edit' | 'delete' | 'markPaid' | 'markPartial'; 
    data?: any 
  } | null>(null);
  const [isCashClosed, setIsCashClosed] = useState(false);
  const { verifyPassword, isVerifying } = useAuthorizationPassword();
  const { updateInstallment, deleteInstallment, isUpdating, isDeleting } = useSecureInstallmentMutation(onUpdate);
  const { validateCashIsOpen } = useCashStatusValidation();

  // Verificar status do caixa quando o componente montar
  useEffect(() => {
    const checkCashStatus = async () => {
      if (installment?.created_at) {
        const validation = await validateCashIsOpen(installment.created_at);
        setIsCashClosed(!validation.isValid);
      }
    };

    checkCashStatus();
  }, [installment?.created_at, validateCashIsOpen]);

  const handleSecureAction = (type: 'edit' | 'delete' | 'markPaid' | 'markPartial', data?: any) => {
    setPendingAction({ type, data });
    setPasswordDialogOpen(true);
  };

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
        handleSecureAction('markPartial', { paidAmount: amount });
      } else {
        toast({
          title: "Valor inválido",
          description: "O valor deve ser maior que zero e menor ou igual ao valor da parcela",
          variant: "destructive",
        });
      }
    }
  };

  const handlePasswordConfirm = async (password: string, reason?: string) => {
    if (!pendingAction) return;

    const isValid = await verifyPassword(password);
    if (!isValid) return;

    switch (pendingAction.type) {
      case 'edit':
        onEdit(installment);
        break;
      
      case 'delete':
        deleteInstallment({ 
          installmentId: installment.id, 
          reason 
        });
        break;
      
      case 'markPaid':
        updateInstallment({
          installmentId: installment.id,
          data: {
            status: 'pago',
            paid_amount: installment.amount,
            payment_date: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          reason
        });
        break;
      
      case 'markPartial':
        updateInstallment({
          installmentId: installment.id,
          data: {
            status: 'parcial',
            paid_amount: pendingAction.data.paidAmount,
            updated_at: new Date().toISOString()
          },
          reason
        });
        break;
    }

    setPasswordDialogOpen(false);
    setPendingAction(null);
  };

  const getDialogTitle = () => {
    switch (pendingAction?.type) {
      case 'edit': return 'Confirmar Edição';
      case 'delete': return 'Confirmar Exclusão';
      case 'markPaid': return 'Confirmar Pagamento';
      case 'markPartial': return 'Confirmar Pagamento Parcial';
      default: return 'Confirmar Ação';
    }
  };

  const getDialogDescription = () => {
    switch (pendingAction?.type) {
      case 'edit': return 'Digite sua senha para autorizar a edição desta parcela.';
      case 'delete': return 'Digite sua senha para autorizar a exclusão desta parcela. Esta ação não pode ser desfeita.';
      case 'markPaid': return 'Digite sua senha para autorizar a marcação desta parcela como paga.';
      case 'markPartial': return 'Digite sua senha para autorizar o registro do pagamento parcial.';
      default: return 'Digite sua senha para autorizar esta ação.';
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2 mt-auto">
        {installment.status === 'pendente' && (
          <>
            <Button
              size="sm"
              onClick={() => handleSecureAction('markPaid')}
              disabled={isUpdating || isCashClosed}
              className="w-full"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Marcar como Pago
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handlePartialPayment}
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
              onClick={() => handleSecureAction('markPaid')}
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
            onClick={() => handleSecureAction('edit')}
            disabled={isCashClosed}
            className="flex-1"
          >
            <Edit className="w-3 h-3 mr-1" />
            Editar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSecureAction('delete')}
            className="text-red-600 hover:text-red-700"
            disabled={isDeleting || isCashClosed}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <PasswordDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
        onConfirm={handlePasswordConfirm}
        title={getDialogTitle()}
        description={getDialogDescription()}
        isLoading={isVerifying}
        requireReason={true}
      />
    </>
  );
};

export default InstallmentActions;
