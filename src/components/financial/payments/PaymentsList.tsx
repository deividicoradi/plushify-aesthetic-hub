
import React from 'react';
import PaymentListRow from './PaymentListRow';
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
        <div className="space-y-2">
          {payments.map((payment) => (
            <PaymentListRow
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
