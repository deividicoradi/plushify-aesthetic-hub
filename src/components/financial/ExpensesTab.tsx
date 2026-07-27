
import React, { useState } from 'react';
import ExpenseDialog from './ExpenseDialog';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import ExpensesHeader from './expenses/ExpensesHeader';
import ExpensesList from './expenses/ExpensesList';
import { useExpensesData } from '@/hooks/financial/useExpensesData';
import { ExpenseComparisonCharts } from './charts/ExpenseComparisonCharts';
import { usePeriodFilter } from '@/hooks/usePeriodFilter';
import { useExpensesByType } from '@/hooks/financial/useExpensesByType';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useCashGuardedDialog } from '@/hooks/financial/useCashGuardedDialog';

const ExpensesTab = () => {
  const { expenses, isLoading, deleteExpense } = useExpensesData();
  const {
    isCashOpen,
    open: isDialogOpen,
    editing: editingExpense,
    openDialog,
    closeDialog: handleCloseDialog,
  } = useCashGuardedDialog<any>('Abra o caixa de hoje antes de lançar uma nova despesa.');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebouncedValue(searchTerm);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  // Filtros independentes para despesas fixas e variáveis
  const { dateRange: fixedDateRange } = usePeriodFilter('30d');
  const { dateRange: variableDateRange } = usePeriodFilter('30d');

  // Hook para buscar despesas por tipo
  const { fixedExpenses, variableExpenses, loading: expensesLoading } = useExpensesByType(
    fixedDateRange,
    variableDateRange
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleDelete = (expenseId: string) => {
    setExpenseToDelete(expenseId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (expenseToDelete) {
      deleteExpense(expenseToDelete);
      setExpenseToDelete(null);
    }
  };

  const filteredExpenses = expenses?.filter(expense =>
    expense.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    expense.category?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  const totalExpenses = filteredExpenses?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;

  return (
    <div className="space-y-6">
      <ExpensesHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onNewExpense={() => openDialog()}
        totalExpenses={totalExpenses}
        disabled={!isCashOpen}
      />

      {/* Gráficos de Despesas Fixas e Variáveis */}
      <ExpenseComparisonCharts 
        fixedExpenses={fixedExpenses}
        variableExpenses={variableExpenses}
        formatCurrency={formatCurrency}
      />

      <ExpensesList
        expenses={filteredExpenses || []}
        isLoading={isLoading}
        onEdit={(expense) => openDialog(expense)}
        onDelete={handleDelete}
      />

      <ExpenseDialog 
        open={isDialogOpen} 
        onOpenChange={handleCloseDialog}
        expense={editingExpense}
      />

      <ConfirmationDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Excluir Despesa"
        description="Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </div>
  );
};

export default ExpensesTab;
