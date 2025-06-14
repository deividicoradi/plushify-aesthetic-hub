
import React, { useState, useEffect } from 'react';
import { useAuthorizationPassword } from '@/hooks/useAuthorizationPassword';
import { useSecureInstallmentMutation } from '@/hooks/financial/useSecureInstallmentMutation';
import { useCashStatusValidation } from '@/hooks/financial/useCashStatusValidation';
import InstallmentPasswordDialog from './installments/InstallmentPasswordDialog';
import InstallmentActionButtons from './installments/InstallmentActionButtons';
import InstallmentPartialPayment from './installments/InstallmentPartialPayment';

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

  const partialPaymentHandler = InstallmentPartialPayment({
    installment,
    isCashClosed,
    onSecureAction: handleSecureAction
  });

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

  return (
    <>
      <InstallmentActionButtons
        installment={installment}
        isCashClosed={isCashClosed}
        isUpdating={isUpdating}
        isDeleting={isDeleting}
        onSecureAction={handleSecureAction}
        onPartialPayment={partialPaymentHandler.handlePartialPayment}
      />

      <InstallmentPasswordDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
        onConfirm={handlePasswordConfirm}
        pendingAction={pendingAction}
        isVerifying={isVerifying}
      />
    </>
  );
};

export default InstallmentActions;
