
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import PaymentCard from './PaymentCard';

interface PaymentsListProps {
  payments: any[];
  isLoading: boolean;
  getClientName: (clientId: string | null) => string | null;
  onEdit: (payment: any) => void;
  onDelete: (paymentId: string) => void;
}

const PaymentsList = ({ payments, isLoading, getClientName, onEdit, onDelete }: PaymentsListProps) => {
  if (isLoading) {
    return (
      <div className="text-center py-8">Carregando pagamentos...</div>
    );
  }

  if (payments.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">Nenhum pagamento encontrado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {payments.map((payment) => (
        <PaymentCard
          key={payment.id}
          payment={payment}
          clientName={getClientName(payment.client_id)}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default PaymentsList;
