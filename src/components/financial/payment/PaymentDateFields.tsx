
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface PaymentDateFieldsProps {
  dueDate: string;
  onFieldChange: (field: string, value: string) => void;
  disabled?: boolean;
}

const PaymentDateFields = ({ dueDate, onFieldChange, disabled = false }: PaymentDateFieldsProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="due_date">Data de Vencimento</Label>
      <Input
        id="due_date"
        type="date"
        value={dueDate}
        onChange={(e) => onFieldChange('due_date', e.target.value)}
        disabled={disabled}
      />
    </div>
  );
};

export default PaymentDateFields;
