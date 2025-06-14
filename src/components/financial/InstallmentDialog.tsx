
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useInstallmentForm } from './installment/useInstallmentForm';
import InstallmentPaymentSelect from './installment/InstallmentPaymentSelect';
import InstallmentConfigFields from './installment/InstallmentConfigFields';
import InstallmentDueDatePicker from './installment/InstallmentDueDatePicker';
import InstallmentNotesField from './installment/InstallmentNotesField';
import InstallmentFormActions from './installment/InstallmentFormActions';

interface InstallmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  installment?: any;
}

const InstallmentDialog = ({ open, onOpenChange, onSuccess, installment }: InstallmentDialogProps) => {
  const { user } = useAuth();
  
  const {
    formData,
    loading,
    handleFieldChange,
    handleSubmit
  } = useInstallmentForm(installment, () => {
    onSuccess();
    onOpenChange(false);
  });

  // Buscar pagamentos disponíveis
  const { data: payments } = useQuery({
    queryKey: ['payments-for-installments', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('id, description, amount')
        .eq('user_id', user?.id)
        .eq('status', 'pago');

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {installment ? 'Editar Parcelamento' : 'Novo Parcelamento'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InstallmentPaymentSelect
            value={formData.payment_id}
            onValueChange={(value) => handleFieldChange('payment_id', value)}
            payments={payments || []}
          />

          <InstallmentConfigFields
            totalInstallments={formData.total_installments}
            amount={formData.amount}
            onTotalInstallmentsChange={(value) => handleFieldChange('total_installments', value)}
            onAmountChange={(value) => handleFieldChange('amount', value)}
          />

          <InstallmentDueDatePicker
            dueDate={formData.due_date}
            onDueDateChange={(date) => handleFieldChange('due_date', date)}
          />

          <InstallmentNotesField
            notes={formData.notes}
            onNotesChange={(value) => handleFieldChange('notes', value)}
          />

          <InstallmentFormActions
            loading={loading}
            installment={installment}
            onCancel={() => onOpenChange(false)}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InstallmentDialog;
