
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCashStatusValidation } from '@/hooks/financial/useCashStatusValidation';

interface ExpenseCardProps {
  expense: any;
  onEdit: (expense: any) => void;
  onDelete: (expenseId: string) => void;
}

const ExpenseCard = ({ expense, onEdit, onDelete }: ExpenseCardProps) => {
  const [isCashClosed, setIsCashClosed] = useState(false);
  const { validateCashIsOpen } = useCashStatusValidation();

  // Verificar status do caixa quando o componente montar
  useEffect(() => {
    const checkCashStatus = async () => {
      if (expense?.created_at) {
        const validation = await validateCashIsOpen(expense.created_at);
        setIsCashClosed(!validation.isValid);
      }
    };

    checkCashStatus();
  }, [expense?.created_at, validateCashIsOpen]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getCategoryBadge = (category: string) => {
    const categoryConfig: Record<string, { label: string; variant: any }> = {
      'material': { label: 'Material', variant: 'default' },
      'equipamento': { label: 'Equipamento', variant: 'secondary' },
      'marketing': { label: 'Marketing', variant: 'outline' },
      'aluguel': { label: 'Aluguel', variant: 'destructive' },
      'outros': { label: 'Outros', variant: 'secondary' },
    };
    
    const config = categoryConfig[category] || categoryConfig.outros;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{expense.description}</h3>
              {getCategoryBadge(expense.category)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              {expense.payment_methods && (
                <p>Método: {expense.payment_methods.name}</p>
              )}
              <p>Data: {format(new Date(expense.expense_date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
              {expense.notes && (
                <p className="text-xs text-gray-500">Obs: {expense.notes}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-lg font-bold text-red-600 dark:text-red-400">
                {formatCurrency(Number(expense.amount))}
              </p>
              {expense.receipt_url && (
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Comprovante anexado
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(expense)}
                disabled={isCashClosed}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(expense.id)}
                className="text-red-600 hover:text-red-700"
                disabled={isCashClosed}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseCard;
