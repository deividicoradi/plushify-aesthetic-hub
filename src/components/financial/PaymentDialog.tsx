
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';
import PaymentFormFields from './PaymentFormFields';
import { usePaymentForm } from '@/hooks/usePaymentForm';
import { useCashOpeningValidation } from '@/hooks/financial/useCashOpeningValidation';

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
  
  const { validateTodayCashStatus } = useCashOpeningValidation();
  const [cashStatus, setCashStatus] = useState<{ shouldProceed: boolean } | null>(null);
  const [validatingCash, setValidatingCash] = useState(false);

  // Verificar status do caixa quando o diálogo abrir
  useEffect(() => {
    if (open && !payment) { // Apenas para novos pagamentos
      const checkCashStatus = async () => {
        setValidatingCash(true);
        const status = await validateTodayCashStatus();
        setCashStatus(status);
        setValidatingCash(false);
      };
      
      checkCashStatus();
    } else if (open && payment) {
      // Para edições, sempre permitir (a validação será feita no submit)
      setCashStatus({ shouldProceed: true });
    } else {
      setCashStatus(null);
    }
  }, [open, payment, validateTodayCashStatus]);

  // Se está validando ou o caixa está fechado para novos pagamentos
  const isFormBlocked = validatingCash || (cashStatus && !cashStatus.shouldProceed && !payment);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>
            {payment ? 'Editar Pagamento' : 'Novo Pagamento'}
          </DialogTitle>
        </DialogHeader>
        
        {isFormBlocked && (
          <div className="px-6">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {validatingCash 
                  ? "Verificando status do caixa..." 
                  : "🚫 O caixa não está aberto para hoje. É obrigatório abrir o caixa antes de criar novos pagamentos!"
                }
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <ScrollArea className="max-h-[60vh] px-6">
            <div className="space-y-4 pb-4">
              <PaymentFormFields
                formData={formData}
                onFieldChange={handleChange}
              />
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-2 p-6 pt-4 border-t bg-background">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || isFormBlocked}
            >
              {isLoading ? 'Salvando...' : payment ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
