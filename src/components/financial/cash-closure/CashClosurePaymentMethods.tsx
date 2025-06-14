
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface CashClosurePaymentMethodsProps {
  formData: {
    cash_amount: string;
    card_amount: string;
    pix_amount: string;
    other_amount: string;
  };
  onFieldChange: (field: string, value: string) => void;
  total: number;
  movementData?: any;
}

const CashClosurePaymentMethods = ({ 
  formData, 
  onFieldChange, 
  total, 
  movementData 
}: CashClosurePaymentMethodsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">
        Detalhamento por Método de Pagamento
        {movementData && (
          <Badge variant="outline" className="ml-2">
            Calculado automaticamente
          </Badge>
        )}
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cash_amount">
            Dinheiro
            {movementData && (
              <Badge variant="secondary" className="ml-2">
                Auto
              </Badge>
            )}
          </Label>
          <Input
            id="cash_amount"
            type="number"
            step="0.01"
            value={formData.cash_amount}
            onChange={(e) => onFieldChange('cash_amount', e.target.value)}
            placeholder="0,00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="card_amount">
            Cartão
            {movementData && (
              <Badge variant="secondary" className="ml-2">
                Auto
              </Badge>
            )}
          </Label>
          <Input
            id="card_amount"
            type="number"
            step="0.01"
            value={formData.card_amount}
            onChange={(e) => onFieldChange('card_amount', e.target.value)}
            placeholder="0,00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pix_amount">
            PIX
            {movementData && (
              <Badge variant="secondary" className="ml-2">
                Auto
              </Badge>
            )}
          </Label>
          <Input
            id="pix_amount"
            type="number"
            step="0.01"
            value={formData.pix_amount}
            onChange={(e) => onFieldChange('pix_amount', e.target.value)}
            placeholder="0,00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="other_amount">
            Outros
            {movementData && (
              <Badge variant="secondary" className="ml-2">
                Auto
              </Badge>
            )}
          </Label>
          <Input
            id="other_amount"
            type="number"
            step="0.01"
            value={formData.other_amount}
            onChange={(e) => onFieldChange('other_amount', e.target.value)}
            placeholder="0,00"
          />
        </div>
      </div>

      <div className="p-3 bg-blue-50 dark:bg-blue-800/20 rounded-lg">
        <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
          Total calculado: {formatCurrency(total)}
        </p>
        {movementData && (
          <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
            Baseado nos pagamentos recebidos durante o dia
          </p>
        )}
      </div>
    </div>
  );
};

export default CashClosurePaymentMethods;
