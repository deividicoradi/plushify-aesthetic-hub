
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ExpenseCategorySelect from './ExpenseCategorySelect';

interface ExpenseFormFieldsProps {
  formData: {
    description: string;
    amount: string;
    category: string;
    payment_method_id: string;
    expense_date: string;
    notes: string;
  };
  paymentMethods: any[];
  onFieldChange: (field: string, value: string) => void;
}

const ExpenseFormFields = ({ formData, paymentMethods, onFieldChange }: ExpenseFormFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="description">Descrição *</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => onFieldChange('description', e.target.value)}
          placeholder="Descrição da despesa"
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

        <ExpenseCategorySelect
          value={formData.category}
          onValueChange={(value) => onFieldChange('category', value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="payment_method">Método de Pagamento</Label>
          <Select value={formData.payment_method_id} onValueChange={(value) => onFieldChange('payment_method_id', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o método" />
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

        <div className="space-y-2">
          <Label htmlFor="expense_date">Data da Despesa</Label>
          <Input
            id="expense_date"
            type="date"
            value={formData.expense_date}
            onChange={(e) => onFieldChange('expense_date', e.target.value)}
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
    </>
  );
};

export default ExpenseFormFields;
