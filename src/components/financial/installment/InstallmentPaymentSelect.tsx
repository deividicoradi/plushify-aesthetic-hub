
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface InstallmentPaymentSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  payments: any[];
  disabled?: boolean;
}

const InstallmentPaymentSelect = ({ 
  value, 
  onValueChange, 
  payments, 
  disabled = false 
}: InstallmentPaymentSelectProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="payment_id">Pagamento para Parcelar *</Label>
      <Select 
        value={value} 
        onValueChange={onValueChange} 
        required
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione um pagamento pendente ou parcial" />
        </SelectTrigger>
        <SelectContent>
          {payments.map((payment) => (
            <SelectItem key={payment.id} value={payment.id}>
              {payment.description} - R$ {payment.amount}
              {payment.clients?.name && ` (${payment.clients.name})`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default InstallmentPaymentSelect;
