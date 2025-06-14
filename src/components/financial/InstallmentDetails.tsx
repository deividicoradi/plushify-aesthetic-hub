
import React from 'react';
import { Calendar, DollarSign, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface InstallmentDetailsProps {
  installment: any;
}

const InstallmentDetails = ({ installment }: InstallmentDetailsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-2 mb-4 flex-grow">
      <div className="flex items-center gap-2 text-sm">
        <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <span className="text-xs">Vence: {format(new Date(installment.due_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
      </div>

      {installment.payment_date && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-xs">Pago em: {format(new Date(installment.payment_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
        </div>
      )}

      <div className="flex items-center gap-2 text-sm">
        <DollarSign className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <div className="min-w-0">
          <span className="font-medium text-sm">{formatCurrency(Number(installment.amount))}</span>
          {Number(installment.paid_amount) > 0 && installment.status !== 'pago' && (
            <div className="text-green-600 text-xs">
              Pago: {formatCurrency(Number(installment.paid_amount))}
            </div>
          )}
        </div>
      </div>

      {installment.notes && (
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{installment.notes}</p>
      )}
    </div>
  );
};

export default InstallmentDetails;
