
import React, { useState } from 'react';
import PasswordDialog from '@/components/ui/password-dialog';
import { useAuthorizationPassword } from '@/hooks/useAuthorizationPassword';
import { useSecurePaymentMutation } from '@/hooks/financial/useSecurePaymentMutation';

interface PaymentSecureActionsProps {
  onEdit: (payment: any) => void;
  onSuccess: () => void;
  children: (props: {
    handleSecureAction: (type: 'edit' | 'delete', payment: any) => void;
    isDeleting: boolean;
  }) => React.ReactNode;
}

const PaymentSecureActions = ({ onEdit, onSuccess, children }: PaymentSecureActionsProps) => {
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'edit' | 'delete'; payment: any } | null>(null);
  const { verifyPassword, isVerifying } = useAuthorizationPassword();

  const { deletePayment, isDeleting } = useSecurePaymentMutation(pendingAction?.payment, () => {
    setPasswordDialogOpen(false);
    setPendingAction(null);
    onSuccess();
  });

  const handleSecureAction = (type: 'edit' | 'delete', payment: any) => {
    setPendingAction({ type, payment });
    setPasswordDialogOpen(true);
  };

  const handlePasswordConfirm = async (password: string, reason?: string) => {
    if (!pendingAction) return;

    console.log('🔐 Verificando senha para:', pendingAction.type);
    
    const isValid = await verifyPassword(password);
    if (!isValid) {
      console.log('❌ Senha inválida');
      return;
    }

    console.log('✅ Senha válida, executando ação:', pendingAction.type);

    if (pendingAction.type === 'edit') {
      onEdit(pendingAction.payment);
      setPasswordDialogOpen(false);
      setPendingAction(null);
    } else if (pendingAction.type === 'delete') {
      console.log('🗑️ Iniciando exclusão do pagamento:', pendingAction.payment.id);
      deletePayment({ reason });
    }
  };

  return (
    <>
      {children({ handleSecureAction, isDeleting })}
      
      <PasswordDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
        onConfirm={handlePasswordConfirm}
        title={pendingAction?.type === 'edit' ? 'Confirmar Edição' : 'Confirmar Exclusão'}
        description={
          pendingAction?.type === 'edit'
            ? 'Digite sua senha para autorizar a edição deste pagamento.'
            : 'Digite sua senha para autorizar a exclusão deste pagamento. Esta ação não pode ser desfeita.'
        }
        isLoading={isVerifying || isDeleting}
        requireReason={true}
      />
    </>
  );
};

export default PaymentSecureActions;
