
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface CashClosureBasicFieldsProps {
  formData: {
    closure_date: string;
    opening_balance: string;
    closing_balance: string;
    total_income: string;
  };
  onFieldChange: (field: string, value: string) => void;
  loadingMovement?: boolean;
  movementData?: any;
}

const CashClosureBasicFields = ({ 
  formData, 
  onFieldChange, 
  loadingMovement, 
  movementData 
}: CashClosureBasicFieldsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg text-foreground">Informações Básicas</h3>
      
      {loadingMovement && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            📊 Calculando receitas do dia automaticamente...
          </p>
        </div>
      )}

      {movementData && !loadingMovement && (
        <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-800 dark:text-green-200 font-medium">
            ✅ Receitas calculadas automaticamente do movimento do dia
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-green-700 dark:text-green-300">
            <span>Receitas: {formatCurrency(movementData.totalIncome)}</span>
            <span>Pagamentos: {movementData.paymentsCount}</span>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="closure_date" className="text-foreground">Data do Fechamento</Label>
          <Input
            id="closure_date"
            type="date"
            value={formData.closure_date}
            onChange={(e) => onFieldChange('closure_date', e.target.value)}
            required
            className="bg-background border-border text-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="opening_balance" className="text-foreground">Saldo Inicial</Label>
          <Input
            id="opening_balance"
            type="number"
            step="0.01"
            value={formData.opening_balance}
            onChange={(e) => onFieldChange('opening_balance', e.target.value)}
            placeholder="0,00"
            className="bg-background border-border text-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="total_income" className="text-foreground">
            Total de Receitas
            {movementData && (
              <Badge variant="secondary" className="ml-2">
                Auto
              </Badge>
            )}
          </Label>
          <Input
            id="total_income"
            type="number"
            step="0.01"
            value={formData.total_income}
            onChange={(e) => onFieldChange('total_income', e.target.value)}
            placeholder="0,00"
            readOnly={!!movementData}
            className={movementData 
              ? "bg-muted border-border text-muted-foreground" 
              : "bg-background border-border text-foreground"
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="closing_balance" className="text-foreground">
            Saldo Final
            <Badge variant="outline" className="ml-2">
              Calculado
            </Badge>
          </Label>
          <Input
            id="closing_balance"
            type="number"
            step="0.01"
            value={formData.closing_balance}
            onChange={(e) => onFieldChange('closing_balance', e.target.value)}
            placeholder="0,00"
            required
            className="bg-background border-border text-foreground"
          />
          <p className="text-xs text-muted-foreground">
            Saldo Inicial + Receitas
          </p>
        </div>
      </div>
    </div>
  );
};

export default CashClosureBasicFields;
