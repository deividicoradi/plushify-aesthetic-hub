
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
  const { data: paymentMethods, error: paymentMethodsError, isLoading } = usePaymentMethods(enabled);

  // Log de erro se houver
  if (paymentMethodsError) {
    console.error('Erro na query de métodos de pagamento:', paymentMethodsError);
  }

  const getPlaceholderText = () => {
    if (isLoading) return "Carregando...";
    if (paymentMethodsError) return "Erro ao carregar";
    if (!paymentMethods || paymentMethods.length === 0) return "Nenhum método disponível";
    return "Selecione o método";
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="payment_method_id">Método de Pagamento *</Label>
      <Select value={value} onValueChange={onValueChange} disabled={isLoading || !!paymentMethodsError}>
        <SelectTrigger>
          <SelectValue placeholder={getPlaceholderText()} />
        </SelectTrigger>
        <SelectContent>
          {paymentMethods && paymentMethods.length > 0 ? (
            paymentMethods.map((method) => (
              <SelectItem key={method.id} value={method.id}>
                {method.name}
              </SelectItem>
            ))
          ) : (
            !isLoading && !paymentMethodsError && (
              <div className="p-2 text-sm text-gray-500">
                Nenhum método encontrado
              </div>
            )
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PaymentMethodSelect;
