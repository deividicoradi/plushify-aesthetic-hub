
import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import InstallmentStatus from '../InstallmentStatus';
import InstallmentCard from '../InstallmentCard';

interface InstallmentListRowProps {
  installment: any;
  paymentData: any;
  clientData?: any;
  onEdit: (installment: any) => void;
  onUpdate: () => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const InstallmentListRow = ({ installment, paymentData, clientData, onEdit, onUpdate }: InstallmentListRowProps) => {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setShowDetail(true)}
        onKeyDown={(e) => { if (e.key === 'Enter') setShowDetail(true); }}
        className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
      >
        <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-2 items-center">
          <div className="min-w-0">
            <p className="font-medium truncate">
              Parcela {installment.installment_number}/{installment.total_installments}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {paymentData?.description || 'Pagamento'}
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            Vence: {format(new Date(installment.due_date), 'dd/MM/yyyy', { locale: ptBR })}
          </div>
          <div>
            <InstallmentStatus status={installment.status} dueDate={installment.due_date} />
          </div>
          <div className="text-sm font-semibold text-right sm:text-left">
            {formatCurrency(Number(installment.amount))}
          </div>
        </div>
      </div>

      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-lg p-0 pt-6">
          <InstallmentCard
            installment={installment}
            paymentData={paymentData}
            clientData={clientData}
            onEdit={(i) => { setShowDetail(false); onEdit(i); }}
            onUpdate={onUpdate}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InstallmentListRow;
