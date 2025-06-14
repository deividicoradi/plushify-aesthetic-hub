
import React from 'react';
import PaymentBasicFields from './payment/PaymentBasicFields';
import PaymentStatusFields from './payment/PaymentStatusFields';
import PaymentClientFields from './payment/PaymentClientFields';
import PaymentDateFields from './payment/PaymentDateFields';
import PaymentNotesFields from './payment/PaymentNotesFields';
import PaymentStatusAlerts from './payment/PaymentStatusAlerts';

interface PaymentFormFieldsProps {
  formData: {
    description: string;
    amount: string;
    payment_method_id: string;
    client_id: string;
    due_date: string;
    notes: string;
    status: string;
    paid_amount: string;
    installments?: string;
  };
  onFieldChange: (field: string, value: string) => void;
  disabled?: boolean;
}

const PaymentFormFields = ({ formData, onFieldChange, disabled = false }: PaymentFormFieldsProps) => {
  return (
    <div className="space-y-4">
      <PaymentBasicFields
        description={formData.description}
        amount={formData.amount}
        paidAmount={formData.paid_amount}
        onFieldChange={onFieldChange}
        disabled={disabled}
      />

      <PaymentStatusFields
        status={formData.status}
        paymentMethodId={formData.payment_method_id}
        installments={formData.installments || '1'}
        amount={formData.amount}
        onFieldChange={onFieldChange}
        disabled={disabled}
      />

      <PaymentClientFields
        clientId={formData.client_id}
        onFieldChange={onFieldChange}
        disabled={disabled}
      />

      <PaymentDateFields
        dueDate={formData.due_date}
        onFieldChange={onFieldChange}
        disabled={disabled}
      />

      <PaymentNotesFields
        notes={formData.notes}
        onFieldChange={onFieldChange}
        disabled={disabled}
      />

      <PaymentStatusAlerts
        status={formData.status}
        amount={formData.amount}
        paidAmount={formData.paid_amount}
      />
    </div>
  );
};

export default PaymentFormFields;
