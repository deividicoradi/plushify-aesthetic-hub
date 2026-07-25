
import React from 'react';
import { Label } from "@/components/ui/label";
import { DatePickerField } from "@/components/ui/date-picker-field";

interface PaymentDateFieldsProps {
  dueDate: string;
  onFieldChange: (field: string, value: string) => void;
  disabled?: boolean;
}

const PaymentDateFields = ({ dueDate, onFieldChange, disabled = false }: PaymentDateFieldsProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="due_date">Data de Vencimento</Label>
      <DatePickerField
        id="due_date"
        value={dueDate}
        onChange={(value) => onFieldChange('due_date', value)}
        disabled={disabled}
      />
    </div>
  );
};

export default PaymentDateFields;
