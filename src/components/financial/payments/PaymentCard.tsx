
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Calendar, User, CreditCard } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/reports/formatters';
import { useCashStatusValidation } from '@/hooks/financial/useCashStatusValidation';

interface PaymentCardProps {
  payment: any;
  clientName: string | null;
  onEdit: (payment: any) => void;
  onDelete: (payment: any) => void;
  isDeleting: boolean;
}

const PaymentCard = ({ payment, clientName, onEdit, onDelete, isDeleting }: PaymentCardProps) => {
  const [isCashClosed, setIsCashClosed] = useState(false);
  const { validateCashIsOpen } = useCashStatusValidation();

  useEffect(() => {
    const checkCashStatus = async () => {
      if (payment?.created_at) {
        const validation = await validateCashIsOpen(payment.created_at);
        setIsCashClosed(!validation.isValid);
      }
    };

    checkCashStatus();
  }, [payment?.created_at, validateCashIsOpen]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pago: { 
        label: 'Pago', 
        variant: 'default' as const,
        className: 'bg-green-500 text-white hover:bg-green-600'
      },
      pendente: { 
        label: 'Pendente', 
        variant: 'secondary' as const,
        className: 'bg-yellow-500 text-white hover:bg-yellow-600'
      },
      parcial: { 
        label: 'Parcial', 
        variant: 'outline' as const,
        className: 'bg-orange-500 text-white hover:bg-orange-600 border-orange-500'
      },
      cancelado: { 
        label: 'Cancelado', 
        variant: 'destructive' as const,
        className: ''
      },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente;
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
              {payment.description || 'Pagamento sem descrição'}
            </h3>
            {getStatusBadge(payment.status)}
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-green-600">
              {formatCurrency(Number(payment.amount))}
            </p>
            {payment.status === 'parcial' && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Pago: {formatCurrency(Number(payment.paid_amount || 0))}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
          {clientName && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{clientName}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            <span>{payment.payment_methods?.name || 'Método não informado'}</span>
          </div>

          {payment.due_date && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Venc: {formatDate(payment.due_date)}</span>
            </div>
          )}

          {payment.notes && (
            <p className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded mt-2 line-clamp-2">
              {payment.notes}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(payment)}
            disabled={isCashClosed}
            className="flex-1"
          >
            <Edit className="w-3 h-3 mr-1" />
            Editar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(payment)}
            className="text-red-600 hover:text-red-700"
            disabled={isDeleting || isCashClosed}
          >
            <Trash2 className="w-3 h-3 mr-1" />
            {isDeleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentCard;
