
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import PaymentMethodSelect from './PaymentMethodSelect';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';

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
  const { user } = useAuth();
  const { data: paymentMethods } = usePaymentMethods();

  const { data: clients } = useQuery({
    queryKey: ['clients', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name')
        .eq('user_id', user?.id)
        .order('name');

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Verificar se o método de pagamento selecionado é cartão de crédito
  const selectedPaymentMethod = paymentMethods?.find(method => method.id === formData.payment_method_id);
  const isCreditCard = selectedPaymentMethod?.type === 'cartao_credito';

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="description">Descrição *</Label>
        <Input
          id="description"
          value={formData.description}
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
            value={formData.amount}
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
            value={formData.paid_amount}
            onChange={(e) => onFieldChange('paid_amount', e.target.value)}
            placeholder="0,00"
            disabled={disabled}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={(value) => onFieldChange('status', value)} disabled={disabled}>
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
        value={formData.payment_method_id}
        onValueChange={(value) => onFieldChange('payment_method_id', value)}
        disabled={disabled}
      />

      {isCreditCard && (
        <div className="space-y-2">
          <Label htmlFor="installments">Número de Parcelas</Label>
          <Select 
            value={formData.installments || '1'} 
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

      <div className="space-y-2">
        <Label htmlFor="client_id">Cliente (opcional)</Label>
        <Select value={formData.client_id} onValueChange={(value) => onFieldChange('client_id', value)} disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um cliente (opcional)" />
          </SelectTrigger>
          <SelectContent>
            {clients?.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="due_date">Data de Vencimento</Label>
        <Input
          id="due_date"
          type="date"
          value={formData.due_date}
          onChange={(e) => onFieldChange('due_date', e.target.value)}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => onFieldChange('notes', e.target.value)}
          placeholder="Observações adicionais..."
          rows={3}
          disabled={disabled}
        />
      </div>

      {formData.status === 'pago' && (
        <div className="p-3 bg-green-50 dark:bg-green-800/20 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-800 dark:text-green-200">
            💰 Este pagamento será automaticamente adicionado ao caixa quando salvo.
          </p>
        </div>
      )}

      {formData.status === 'parcial' && formData.amount && formData.paid_amount && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-800/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            📝 Valor restante: R$ {(Number(formData.amount) - Number(formData.paid_amount)).toFixed(2)} será automaticamente registrado em Parcelamentos.
          </p>
        </div>
      )}

      {isCreditCard && formData.installments && Number(formData.installments) > 1 && formData.amount && (
        <div className="p-3 bg-blue-50 dark:bg-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💳 Parcelamento: {formData.installments}x de R$ {(Number(formData.amount) / Number(formData.installments)).toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentFormFields;
