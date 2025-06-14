
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useExpenseForm } from './expense/useExpenseForm';
import ExpenseFormFields from './expense/ExpenseFormFields';
import ExpenseFormActions from './expense/ExpenseFormActions';

interface ExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: any;
}

const ExpenseDialog = ({ open, onOpenChange, expense }: ExpenseDialogProps) => {
  const { user } = useAuth();
  
  const {
    formData,
    handleChange,
    handleSubmit,
    isLoading,
  } = useExpenseForm(expense, () => onOpenChange(false));

  const { data: paymentMethods } = useQuery({
    queryKey: ['payment-methods', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user?.id)
        .eq('active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{expense ? 'Editar Despesa' : 'Nova Despesa'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <ExpenseFormFields
            formData={formData}
            paymentMethods={paymentMethods || []}
            onFieldChange={handleChange}
          />

          <ExpenseFormActions
            onCancel={() => onOpenChange(false)}
            isLoading={isLoading}
            isEdit={!!expense}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseDialog;
