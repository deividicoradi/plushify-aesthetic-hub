
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePaymentMethods } from '@/hooks/usePaymentMethods';

interface PaymentMethodSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  enabled?: boolean;
}

const PaymentMethodSelect = ({ value, onValueChange, enabled = true }: PaymentMethodSelectProps) => {
  const { data: paymentMethods, error: paymentMethodsError } = usePaymentMethods(enabled);

  // Log de erro se houver
  if (paymentMethodsError) {
    console.error('Erro na query de métodos de pagamento:', paymentMethodsError);
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="payment_method_id">Método de Pagamento *</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={paymentMethods && paymentMethods.length > 0 ? "Selecione o método" : "Carregando métodos..."} />
        </SelectTrigger>
        <SelectContent>
          {paymentMethods && paymentMethods.length > 0 ? (
            paymentMethods.map((method) => (
              <SelectItem key={method.id} value={method.id}>
                {method.name}
              </SelectItem>
            ))
          ) : null}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PaymentMethodSelect;
