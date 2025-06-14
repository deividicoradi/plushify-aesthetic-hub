import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Calendar, User, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/utils/reports/formatters';
import { formatDate } from '@/utils/reports/formatters';
import PasswordDialog from '@/components/ui/password-dialog';
import { useAuthorizationPassword } from '@/hooks/useAuthorizationPassword';
import { useSecurePaymentMutation } from '@/hooks/financial/useSecurePaymentMutation';

interface PaymentsListProps {
  payments: any[];
  isLoading: boolean;
  getClientName: (clientId: string | null) => string | null;
  onEdit: (payment: any) => void;
  onDelete: (paymentId: string) => void;
}

const PaymentsList = ({ payments, isLoading, getClientName, onEdit, onDelete }: PaymentsListProps) => {
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'edit' | 'delete'; payment: any } | null>(null);
  const { verifyPassword, isVerifying } = useAuthorizationPassword();

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

  const handleSecureAction = (type: 'edit' | 'delete', payment: any) => {
    setPendingAction({ type, payment });
    setPasswordDialogOpen(true);
  };

  const handlePasswordConfirm = async (password: string, reason?: string) => {
    if (!pendingAction) return;

    const isValid = await verifyPassword(password);
    if (!isValid) return;

    if (pendingAction.type === 'edit') {
      onEdit(pendingAction.payment);
    } else if (pendingAction.type === 'delete') {
      // Criar uma instância temporária do hook para exclusão
      const { deletePayment } = useSecurePaymentMutation(pendingAction.payment, () => {
        setPasswordDialogOpen(false);
        setPendingAction(null);
      });
      
      deletePayment({ reason });
    }

    if (pendingAction.type === 'edit') {
      setPasswordDialogOpen(false);
      setPendingAction(null);
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <CreditCard className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pagamento encontrado</h3>
          <p className="text-gray-500">Comece criando seu primeiro pagamento.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {payments.map((payment) => (
          <Card key={payment.id} className="hover:shadow-md transition-shadow">
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
                {getClientName(payment.client_id) && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{getClientName(payment.client_id)}</span>
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
                  onClick={() => handleSecureAction('edit', payment)}
                  className="flex-1"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSecureAction('delete', payment)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <PasswordDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
        onConfirm={handlePasswordConfirm}
        title={pendingAction?.type === 'edit' ? 'Confirmar Edição' : 'Confirmar Exclusão'}
        description={
          pendingAction?.type === 'edit'
            ? 'Digite sua senha para autorizar a edição deste pagamento.'
            : 'Digite sua senha para autorizar a exclusão deste pagamento. Esta ação não pode ser desfeita.'
        }
        isLoading={isVerifying}
        requireReason={true}
      />
    </>
  );
};

export default PaymentsList;
