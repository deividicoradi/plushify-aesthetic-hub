
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/utils/reports/formatters';
import PaymentCard from './PaymentCard';

interface PaymentListRowProps {
  payment: any;
  clientName: string | null;
  onEdit: (payment: any) => void;
  onDelete: (payment: any) => void;
  isDeleting: boolean;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pago: { label: 'Pago', className: 'bg-green-500 text-white hover:bg-green-600' },
  pendente: { label: 'Pendente', className: 'bg-yellow-500 text-white hover:bg-yellow-600' },
  parcial: { label: 'Parcial', className: 'bg-orange-500 text-white hover:bg-orange-600' },
  cancelado: { label: 'Cancelado', className: '' },
};

const PaymentListRow = ({ payment, clientName, onEdit, onDelete, isDeleting }: PaymentListRowProps) => {
  const [showDetail, setShowDetail] = useState(false);
  const status = statusConfig[payment.status] || statusConfig.pendente;

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
            <p className="font-medium truncate">{payment.description || 'Pagamento sem descrição'}</p>
            {clientName && <p className="text-xs text-muted-foreground truncate">{clientName}</p>}
          </div>
          <div className="text-sm text-muted-foreground">
            {payment.due_date ? `Venc: ${formatDate(payment.due_date)}` : payment.payment_methods?.name || '—'}
          </div>
          <div>
            <Badge className={status.className}>{status.label}</Badge>
          </div>
          <div className="text-sm font-semibold text-right sm:text-left text-green-600">
            {formatCurrency(Number(payment.amount))}
          </div>
        </div>
      </div>

      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-lg p-0 pt-6">
          <PaymentCard
            payment={payment}
            clientName={clientName}
            onEdit={(p) => { setShowDetail(false); onEdit(p); }}
            onDelete={(p) => { setShowDetail(false); onDelete(p); }}
            isDeleting={isDeleting}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PaymentListRow;
