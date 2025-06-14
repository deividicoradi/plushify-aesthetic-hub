
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import PaymentMethodSelect from './PaymentMethodSelect';

interface PaymentFormFieldsProps {
  formData: {
    description: string;
    amount: string;
    payment_method_id: string;
    client_id: string;
    due_date: string;
    notes: string;
    status: string;
  };
  onFieldChange: (field: string, value: string) => void;
}

const PaymentFormFields = ({ formData, onFieldChange }: PaymentFormFieldsProps) => {
  const { user } = useAuth();

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
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Valor *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => onFieldChange('amount', e.target.value)}
            placeholder="0,00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => onFieldChange('status', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="parcial">Parcial</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <PaymentMethodSelect
        value={formData.payment_method_id}
        onValueChange={(value) => onFieldChange('payment_method_id', value)}
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="client">Cliente</Label>
          <Select value={formData.client_id} onValueChange={(value) => onFieldChange('client_id', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o cliente" />
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
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => onFieldChange('notes', e.target.value)}
          placeholder="Observações adicionais"
        />
      </div>
    </div>
  );
};

export default PaymentFormFields;
