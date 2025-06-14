
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PaymentMethodSelect from '../PaymentMethodSelect';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';

interface PaymentStatusFieldsProps {
  status: string;
  paymentMethodId: string;
  installments: string;
  amount: string;
  onFieldChange: (field: string, value: string) => void;
  disabled?: boolean;
}

const PaymentStatusFields = ({ 
  status, 
  paymentMethodId, 
  installments,
  amount,
  onFieldChange, 
  disabled = false 
}: PaymentStatusFieldsProps) => {
  const { data: paymentMethods } = usePaymentMethods();

  // Verificar se o método de pagamento selecionado é cartão de crédito
  const selectedPaymentMethod = paymentMethods?.find(method => method.id === paymentMethodId);
  const isCreditCard = selectedPaymentMethod?.type === 'cartao_credito';

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={(value) => onFieldChange('status', value)} disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="pago">Pago</SelectItem>
            <SelectItem value="parcial">Parcial</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <PaymentMethodSelect
        value={paymentMethodId}
        onValueChange={(value) => onFieldChange('payment_method_id', value)}
        disabled={disabled}
      />

      {isCreditCard && (
        <div className="space-y-2">
          <Label htmlFor="installments">Número de Parcelas</Label>
          <Select 
            value={installments || '1'} 
            onValueChange={(value) => onFieldChange('installments', value)}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o número de parcelas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1x - À vista</SelectItem>
              <SelectItem value="2">2x sem juros</SelectItem>
              <SelectItem value="3">3x sem juros</SelectItem>
              <SelectItem value="4">4x sem juros</SelectItem>
              <SelectItem value="5">5x sem juros</SelectItem>
              <SelectItem value="6">6x sem juros</SelectItem>
              <SelectItem value="7">7x sem juros</SelectItem>
              <SelectItem value="8">8x sem juros</SelectItem>
              <SelectItem value="9">9x sem juros</SelectItem>
              <SelectItem value="10">10x sem juros</SelectItem>
              <SelectItem value="11">11x sem juros</SelectItem>
              <SelectItem value="12">12x sem juros</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {isCreditCard && installments && Number(installments) > 1 && amount && (
        <div className="p-3 bg-blue-50 dark:bg-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💳 Parcelamento: {installments}x de R$ {(Number(amount) / Number(installments)).toFixed(2)}
          </p>
        </div>
      )}
    </>
  );
};

export default PaymentStatusFields;
