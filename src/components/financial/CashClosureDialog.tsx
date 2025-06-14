
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCashClosureForm } from './cash-closure/useCashClosureForm';
import CashClosureBasicFields from './cash-closure/CashClosureBasicFields';
import CashClosurePaymentMethods from './cash-closure/CashClosurePaymentMethods';
import CashClosureNotes from './cash-closure/CashClosureNotes';

interface CashClosureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  closure?: any;
}

const CashClosureDialog = ({ open, onOpenChange, onSuccess, closure }: CashClosureDialogProps) => {
  const {
    formData,
    handleChange,
    handleSubmit,
    calculateTotal,
    isLoading,
    movementData,
    loadingMovement,
  } = useCashClosureForm(closure, () => {
    onOpenChange(false);
    onSuccess?.();
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {closure ? 'Editar Fechamento de Caixa' : 'Novo Fechamento de Caixa'}
            {!closure && ' - Automático'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <CashClosureBasicFields
            formData={{
              closure_date: formData.closure_date,
              opening_balance: formData.opening_balance,
              closing_balance: formData.closing_balance,
              total_income: formData.total_income,
            }}
            onFieldChange={handleChange}
            loadingMovement={loadingMovement}
            movementData={movementData}
          />

          <CashClosurePaymentMethods
            formData={{
              cash_amount: formData.cash_amount,
              card_amount: formData.card_amount,
              pix_amount: formData.pix_amount,
              other_amount: formData.other_amount,
            }}
            onFieldChange={handleChange}
            total={calculateTotal()}
            movementData={movementData}
          />

          <CashClosureNotes
            notes={formData.notes}
            onNotesChange={(notes) => handleChange('notes', notes)}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : closure ? 'Atualizar' : 'Criar Fechamento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CashClosureDialog;
