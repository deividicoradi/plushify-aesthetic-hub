
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import ExpenseCard from './ExpenseCard';

interface ExpensesListProps {
  expenses: any[];
  isLoading: boolean;
  onEdit: (expense: any) => void;
  onDelete: (expenseId: string) => void;
}

const ExpensesList = ({ expenses, isLoading, onEdit, onDelete }: ExpensesListProps) => {
  if (isLoading) {
    return (
      <div className="text-center py-8">Carregando despesas...</div>
    );
  }

  if (expenses.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">Nenhuma despesa encontrada</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {expenses.map((expense) => (
        <ExpenseCard
          key={expense.id}
          expense={expense}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default ExpensesList;
