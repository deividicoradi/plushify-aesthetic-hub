
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useInstallmentForm } from './installment/useInstallmentForm';
import { useCashOpeningValidation } from '@/hooks/financial/useCashOpeningValidation';
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
  const { validateTodayCashStatus } = useCashOpeningValidation();
  const [cashStatus, setCashStatus] = useState<{ shouldProceed: boolean } | null>(null);
  const [validatingCash, setValidatingCash] = useState(false);
  
  const {
    formData,
    loading,
    handleFieldChange,
    handleSubmit
  } = useInstallmentForm(installment, () => {
    onSuccess();
    onOpenChange(false);
  });

  // Verificar status do caixa quando o diálogo abrir
  useEffect(() => {
    if (open && !installment) { // Apenas para novos parcelamentos
      let isCancelled = false;
      
      const checkCashStatus = async () => {
        if (isCancelled) return;
        
        setValidatingCash(true);
        try {
          const status = await validateTodayCashStatus();
          if (!isCancelled) {
            setCashStatus(status);
          }
        } catch (error) {
          console.error('Erro ao validar caixa:', error);
          if (!isCancelled) {
            setCashStatus({ shouldProceed: false });
          }
        } finally {
          if (!isCancelled) {
            setValidatingCash(false);
          }
        }
      };
      
      checkCashStatus();
      
      return () => {
        isCancelled = true;
      };
    } else if (open && installment) {
      // Para edições, sempre permitir (a validação será feita no submit)
      setCashStatus({ shouldProceed: true });
    } else {
      setCashStatus(null);
    }
  }, [open, installment]); // Removido validateTodayCashStatus das dependências

  // Buscar pagamentos que podem ser parcelados
  const { data: payments } = useQuery({
    queryKey: ['payments-for-installments', user?.id],
    queryFn: async () => {
      console.log('🔍 Buscando pagamentos para parcelamento');
      const { data, error } = await supabase
        .from('payments')
        .select(`
          id, 
          description, 
          amount,
          status,
          clients(id, name)
        `)
        .eq('user_id', user?.id)
        .in('status', ['pendente', 'parcial'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar pagamentos:', error);
        throw error;
      }
      
      console.log('💰 Pagamentos encontrados para parcelamento:', data?.length || 0);
      return data || [];
    },
    enabled: !!user?.id && open,
  });

  // Se está validando ou o caixa está fechado para novos parcelamentos
  const isFormBlocked = validatingCash || (cashStatus && !cashStatus.shouldProceed && !installment);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {installment ? 'Editar Parcelamento' : 'Novo Parcelamento'}
          </DialogTitle>
        </DialogHeader>

        {isFormBlocked && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {validatingCash 
                ? "Verificando status do caixa..." 
                : "🚫 O caixa não está aberto para hoje. É obrigatório abrir o caixa antes de criar novos parcelamentos!"
              }
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <InstallmentPaymentSelect
            value={formData.payment_id}
            onValueChange={(value) => handleFieldChange('payment_id', value)}
            payments={payments || []}
            disabled={isFormBlocked}
          />

          {!installment && (
            <InstallmentConfigFields
              totalInstallments={formData.total_installments}
              amount={formData.amount}
              onTotalInstallmentsChange={(value) => handleFieldChange('total_installments', value)}
              onAmountChange={(value) => handleFieldChange('amount', value)}
              disabled={isFormBlocked}
            />
          )}

          {installment && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Valor da Parcela</label>
              <input
                id="installment-amount"
                name="installment-amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleFieldChange('amount', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isFormBlocked}
              />
            </div>
          )}

          <InstallmentDueDatePicker
            dueDate={formData.due_date}
            onDueDateChange={(date) => handleFieldChange('due_date', date)}
            disabled={isFormBlocked}
          />

          <InstallmentNotesField
            notes={formData.notes}
            onNotesChange={(value) => handleFieldChange('notes', value)}
            disabled={isFormBlocked}
          />

          <InstallmentFormActions
            loading={loading}
            installment={installment}
            onCancel={() => onOpenChange(false)}
            disabled={isFormBlocked}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InstallmentDialog;
