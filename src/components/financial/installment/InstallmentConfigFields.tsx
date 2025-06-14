
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface InstallmentConfigFieldsProps {
  totalInstallments: number;
  amount: string;
  onTotalInstallmentsChange: (value: number) => void;
  onAmountChange: (value: string) => void;
  disabled?: boolean;
}

const InstallmentConfigFields = ({ 
  totalInstallments, 
  amount, 
  onTotalInstallmentsChange, 
  onAmountChange,
  disabled = false
}: InstallmentConfigFieldsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="total_installments">Número de Parcelas</Label>
        <Input
          id="total_installments"
          type="number"
          min="2"
          max="12"
          value={totalInstallments}
          onChange={(e) => onTotalInstallmentsChange(Number(e.target.value))}
          required
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Valor por Parcela</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder="0,00"
          required
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default InstallmentConfigFields;
