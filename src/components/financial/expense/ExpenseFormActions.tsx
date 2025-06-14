
import React from 'react';
import { Button } from "@/components/ui/button";

interface ExpenseFormActionsProps {
  onCancel: () => void;
  isLoading: boolean;
  isEdit: boolean;
}

const ExpenseFormActions = ({ onCancel, isLoading, isEdit }: ExpenseFormActionsProps) => {
  return (
    <div className="flex justify-end gap-2 pt-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Salvando...' : isEdit ? 'Atualizar' : 'Criar'}
      </Button>
    </div>
  );
};

export default ExpenseFormActions;
