import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClients } from '@/hooks/useClients';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { ServicePackage } from '@/hooks/packages/useServicePackages';
import { useServices } from '@/hooks/useServices';

interface PurchasePackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servicePackages: ServicePackage[];
  onPurchase: (clientId: string, servicePackageId: string, paymentMethodId: string) => Promise<void>;
}

export const PurchasePackageDialog: React.FC<PurchasePackageDialogProps> = ({
  open,
  onOpenChange,
  servicePackages,
  onPurchase,
}) => {
  const { clients } = useClients();
  const { services } = useServices();
  const { data: paymentMethods = [] } = usePaymentMethods();
  const [clientId, setClientId] = useState('');
  const [servicePackageId, setServicePackageId] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const activePackages = servicePackages.filter((p) => p.active);
  const serviceNameById = new Map(services.map((s) => [s.id, s.name]));

  const reset = () => {
    setClientId('');
    setServicePackageId('');
    setPaymentMethodId('');
  };

  const handleSubmit = async () => {
    if (!clientId || !servicePackageId || !paymentMethodId) return;
    setSubmitting(true);
    try {
      await onPurchase(clientId, servicePackageId, paymentMethodId);
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
          <DialogTitle className="text-base sm:text-lg">Vender Pacote</DialogTitle>
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
            <Label className="text-xs sm:text-sm">Pacote *</Label>
            <Select value={servicePackageId} onValueChange={setServicePackageId}>
              <SelectTrigger className="h-9 sm:h-10">
                <SelectValue placeholder="Selecione o modelo de pacote" />
              </SelectTrigger>
              <SelectContent>
                {activePackages.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({serviceNameById.get(p.service_id) || 'serviço'}) — {p.total_sessions}x — R$ {p.price.toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              disabled={submitting || !clientId || !servicePackageId || !paymentMethodId}
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
