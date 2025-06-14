
import React from 'react';
import PaymentCard from './PaymentCard';
import PaymentsLoadingState from './PaymentsLoadingState';
import PaymentsEmptyState from './PaymentsEmptyState';
import PaymentSecureActions from './PaymentSecureActions';

interface PaymentsListProps {
  payments: any[];
  isLoading: boolean;
  getClientName: (clientId: string | null) => string | null;
  onEdit: (payment: any) => void;
  onDelete: (paymentId: string) => void;
}

const PaymentsList = ({ payments, isLoading, getClientName, onEdit, onDelete }: PaymentsListProps) => {
  if (isLoading) {
    return <PaymentsLoadingState />;
  }

  if (payments.length === 0) {
    return <PaymentsEmptyState />;
  }

  return (
    <PaymentSecureActions onEdit={onEdit} onSuccess={() => {}}>
      {({ handleSecureAction, isDeleting }) => (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {payments.map((payment) => (
            <PaymentCard
              key={payment.id}
              payment={payment}
              clientName={getClientName(payment.client_id)}
              onEdit={(payment) => handleSecureAction('edit', payment)}
              onDelete={(payment) => handleSecureAction('delete', payment)}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      )}
    </PaymentSecureActions>
  );
};

export default PaymentsList;
