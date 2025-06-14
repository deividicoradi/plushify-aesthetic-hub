
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface CashClosureBasicFieldsProps {
  formData: {
    closure_date: string;
    opening_balance: string;
    closing_balance: string;
    total_income: string;
    total_expenses: string;
  };
  onFieldChange: (field: string, value: string) => void;
}

const CashClosureBasicFields = ({ formData, onFieldChange }: CashClosureBasicFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="closure_date">Data do Fechamento *</Label>
        <Input
          id="closure_date"
          type="date"
          value={formData.closure_date}
          onChange={(e) => onFieldChange('closure_date', e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="opening_balance">Saldo Inicial</Label>
          <Input
            id="opening_balance"
            type="number"
            step="0.01"
            value={formData.opening_balance}
            onChange={(e) => onFieldChange('opening_balance', e.target.value)}
            placeholder="0,00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="closing_balance">Saldo Final *</Label>
          <Input
            id="closing_balance"
            type="number"
            step="0.01"
            value={formData.closing_balance}
            onChange={(e) => onFieldChange('closing_balance', e.target.value)}
            placeholder="0,00"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="total_income">Total de Receitas</Label>
          <Input
            id="total_income"
            type="number"
            step="0.01"
            value={formData.total_income}
            onChange={(e) => onFieldChange('total_income', e.target.value)}
            placeholder="0,00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="total_expenses">Total de Despesas</Label>
          <Input
            id="total_expenses"
            type="number"
            step="0.01"
            value={formData.total_expenses}
            onChange={(e) => onFieldChange('total_expenses', e.target.value)}
            placeholder="0,00"
          />
        </div>
      </div>
    </>
  );
};

export default CashClosureBasicFields;
