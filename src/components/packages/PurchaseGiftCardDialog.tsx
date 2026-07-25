import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClients } from '@/hooks/useClients';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';

interface PurchaseGiftCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchase: (clientId: string, value: number, paymentMethodId: string) => Promise<unknown>;
}

export const PurchaseGiftCardDialog: React.FC<PurchaseGiftCardDialogProps> = ({
  open,
  onOpenChange,
  onPurchase,
}) => {
  const { clients } = useClients();
  const { data: paymentMethods = [] } = usePaymentMethods();
  const [clientId, setClientId] = useState('');
  const [value, setValue] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setClientId('');
    setValue('');
    setPaymentMethodId('');
  };

  const numericValue = parseFloat(value) || 0;

  const handleSubmit = async () => {
    if (!clientId || numericValue <= 0 || !paymentMethodId) return;
    setSubmitting(true);
    try {
      await onPurchase(clientId, numericValue, paymentMethodId);
      reset();
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) reset(); onOpenChange(next); }}>
      <DialogContent className="max-w-lg p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Vender Vale-presente</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs sm:text-sm">Cliente *</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger className="h-9 sm:h-10">
                <SelectValue placeholder="Selecione o cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs sm:text-sm">Valor (R$) *</Label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="0.00"
              className="flex h-9 sm:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs sm:text-sm">Forma de pagamento *</Label>
            <Select value={paymentMethodId} onValueChange={setPaymentMethodId}>
              <SelectTrigger className="h-9 sm:h-10">
                <SelectValue placeholder="Selecione a forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((pm) => (
                  <SelectItem key={pm.id} value={pm.id}>{pm.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !clientId || numericValue <= 0 || !paymentMethodId}
              className="w-full sm:w-auto"
            >
              {submitting ? 'Vendendo...' : 'Vender'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
