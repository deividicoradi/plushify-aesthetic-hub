
import React, { useState } from 'react';
import ExpenseDialog from './ExpenseDialog';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import ExpensesHeader from './expenses/ExpensesHeader';
import ExpensesList from './expenses/ExpensesList';
import { useExpensesData } from '@/hooks/financial/useExpensesData';

const ExpensesTab = () => {
  const { expenses, isLoading, deleteExpense } = useExpensesData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  const handleEdit = (expense: any) => {
    setEditingExpense(expense);
    setIsDialogOpen(true);
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

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingExpense(null);
  };

  const filteredExpenses = expenses?.filter(expense =>
    expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalExpenses = filteredExpenses?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;

  return (
    <div className="space-y-6">
      <ExpensesHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onNewExpense={() => setIsDialogOpen(true)}
        totalExpenses={totalExpenses}
      />

      <ExpensesList
        expenses={filteredExpenses || []}
        isLoading={isLoading}
        onEdit={handleEdit}
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
