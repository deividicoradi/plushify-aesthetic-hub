
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PaymentCardProps {
  payment: any;
  clientName?: string | null;
  onEdit: (payment: any) => void;
  onDelete: (paymentId: string) => void;
}

const PaymentCard = ({ payment, clientName, onEdit, onDelete }: PaymentCardProps) => {
  const getStatusBadge = (status: string, dueDate?: string) => {
    const isOverdue = dueDate && new Date(dueDate) < new Date() && status === 'pendente';
    
    const statusConfig = {
      pendente: { 
        label: isOverdue ? 'Atrasado' : 'Pendente', 
        variant: 'secondary' as const,
        className: isOverdue ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-red-500 text-white hover:bg-red-600'
      },
      pago: { 
        label: 'Pago', 
        variant: 'default' as const,
        className: 'bg-green-500 text-white hover:bg-green-600'
      },
      parcial: { 
        label: 'Parcial', 
        variant: 'outline' as const,
        className: 'bg-orange-500 text-white hover:bg-orange-600 border-orange-500'
      },
      cancelado: { 
        label: 'Cancelado', 
        variant: 'destructive' as const,
        className: 'bg-gray-500 text-white hover:bg-gray-600'
      },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente;
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">
                {payment.description || 'Pagamento sem descrição'}
              </h3>
              {getStatusBadge(payment.status, payment.due_date)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              {clientName && (
                <p>Cliente: {clientName}</p>
              )}
              {payment.payment_methods && (
                <p>Método: {payment.payment_methods.name}</p>
              )}
              <p>Criado em: {format(new Date(payment.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right space-y-1">
              <p className="text-lg font-bold">
                {formatCurrency(Number(payment.amount))}
              </p>
              {Number(payment.paid_amount) > 0 && (
                <p className="text-sm text-green-600">
                  Pago: {formatCurrency(Number(payment.paid_amount))}
                </p>
              )}
              {Number(payment.discount) > 0 && (
                <p className="text-sm text-orange-600">
                  Desconto: {formatCurrency(Number(payment.discount))}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(payment)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(payment.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentCard;
