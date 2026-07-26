
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ExpenseCard from './ExpenseCard';

interface ExpenseListRowProps {
  expense: any;
  onEdit: (expense: any) => void;
  onDelete: (expenseId: string) => void;
}

const categoryConfig: Record<string, { label: string; variant: any }> = {
  material: { label: 'Material', variant: 'default' },
  equipamento: { label: 'Equipamento', variant: 'secondary' },
  marketing: { label: 'Marketing', variant: 'outline' },
  aluguel: { label: 'Aluguel', variant: 'destructive' },
  salario: { label: 'Salário', variant: 'destructive' },
  servicos: { label: 'Serviços', variant: 'outline' },
  impostos: { label: 'Impostos', variant: 'destructive' },
  outros: { label: 'Outros', variant: 'secondary' },
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const ExpenseListRow = ({ expense, onEdit, onDelete }: ExpenseListRowProps) => {
  const [showDetail, setShowDetail] = useState(false);
  const category = categoryConfig[expense.category] || categoryConfig.outros;

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setShowDetail(true)}
        onKeyDown={(e) => { if (e.key === 'Enter') setShowDetail(true); }}
        className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
      >
        <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-2 items-center">
          <div className="min-w-0">
            <p className="font-medium truncate">{expense.description}</p>
            <p className="text-xs text-muted-foreground truncate">
              {format(new Date(expense.expense_date), 'dd/MM/yyyy', { locale: ptBR })}
            </p>
          </div>
          <div className="text-sm text-muted-foreground truncate">
            {expense.payment_methods?.name || '—'}
          </div>
          <div>
            <Badge variant={category.variant}>{category.label}</Badge>
          </div>
          <div className="text-sm font-semibold text-right sm:text-left text-red-600 dark:text-red-400">
            {formatCurrency(Number(expense.amount))}
          </div>
        </div>
      </div>

      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-lg p-0 pt-6">
          <ExpenseCard
            expense={expense}
            onEdit={(e) => { setShowDetail(false); onEdit(e); }}
            onDelete={(id) => { setShowDetail(false); onDelete(id); }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExpenseListRow;
