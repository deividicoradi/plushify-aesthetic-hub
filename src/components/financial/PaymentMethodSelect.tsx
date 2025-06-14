
import React from 'react';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PaymentMethodSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

const PaymentMethodSelect = ({ value, onValueChange, disabled = false }: PaymentMethodSelectProps) => {
  const { data: paymentMethods } = usePaymentMethods();

  return (
    <div className="space-y-2">
      <Label htmlFor="payment_method">Método de Pagamento *</Label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o método de pagamento" />
        </SelectTrigger>
        <SelectContent>
          {paymentMethods?.map((method) => (
            <SelectItem key={method.id} value={method.id}>
              {method.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PaymentMethodSelect;
