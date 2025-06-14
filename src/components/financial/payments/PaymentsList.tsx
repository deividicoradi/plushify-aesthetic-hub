
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
  const { deletePayment, isDeleting } = useSecurePaymentMutation();

  const getStatusBadge = (status: string) => {
    const variants = {
      pago: 'bg-green-100 text-green-800 border-green-200',
      pendente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      parcial: 'bg-orange-100 text-orange-800 border-orange-200',
      cancelado: 'bg-red-100 text-red-800 border-red-200'
    };
    
    return variants[status as keyof typeof variants] || variants.pendente;
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
      deletePayment({ reason });
    }

    setPasswordDialogOpen(false);
    setPendingAction(null);
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
                  <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                    {payment.description || 'Pagamento sem descrição'}
                  </h3>
                  <Badge className={getStatusBadge(payment.status)}>
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(Number(payment.amount))}
                  </p>
                  {payment.status === 'parcial' && (
                    <p className="text-sm text-gray-500">
                      Pago: {formatCurrency(Number(payment.paid_amount || 0))}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
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
                  <p className="text-xs bg-gray-50 p-2 rounded mt-2 line-clamp-2">
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
                  disabled={isDeleting}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  {isDeleting ? 'Excluindo...' : 'Excluir'}
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
