
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import PaymentFormFields from './PaymentFormFields';
import { usePaymentForm } from '@/hooks/usePaymentForm';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment?: any;
}

const PaymentDialog = ({ open, onOpenChange, payment }: PaymentDialogProps) => {
  const { formData, handleChange, handleSubmit, isLoading } = usePaymentForm(
    payment,
    () => onOpenChange(false)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {payment ? 'Editar Pagamento' : 'Novo Pagamento'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              <PaymentFormFields
                formData={formData}
                onFieldChange={handleChange}
              />
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-2 pt-4 mt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : payment ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
