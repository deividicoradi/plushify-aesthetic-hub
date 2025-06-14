
import React from 'react';
import PasswordDialog from '@/components/ui/password-dialog';

interface InstallmentPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (password: string, reason?: string) => void;
  pendingAction: { 
    type: 'edit' | 'delete' | 'markPaid' | 'markPartial'; 
    data?: any 
  } | null;
  isVerifying: boolean;
}

const InstallmentPasswordDialog = ({
  open,
  onOpenChange,
  onConfirm,
  pendingAction,
  isVerifying
}: InstallmentPasswordDialogProps) => {
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
    <PasswordDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title={getDialogTitle()}
      description={getDialogDescription()}
      isLoading={isVerifying}
      requireReason={true}
    />
  );
};

export default InstallmentPasswordDialog;
