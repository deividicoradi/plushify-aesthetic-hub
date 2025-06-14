
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface PaymentBasicFieldsProps {
  description: string;
  amount: string;
  paidAmount: string;
  onFieldChange: (field: string, value: string) => void;
  disabled?: boolean;
}

const PaymentBasicFields = ({ 
  description, 
  amount, 
  paidAmount, 
  onFieldChange, 
  disabled = false 
}: PaymentBasicFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="description">Descrição *</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => onFieldChange('description', e.target.value)}
          placeholder="Descrição do pagamento"
          required
          disabled={disabled}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Valor Total *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => onFieldChange('amount', e.target.value)}
            placeholder="0,00"
            required
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paid_amount">Valor Pago</Label>
          <Input
            id="paid_amount"
            type="number"
            step="0.01"
            value={paidAmount}
            onChange={(e) => onFieldChange('paid_amount', e.target.value)}
            placeholder="0,00"
            disabled={disabled}
          />
        </div>
      </div>
    </>
  );
};

export default PaymentBasicFields;
