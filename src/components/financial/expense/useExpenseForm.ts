
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/hooks/use-toast";

interface ExpenseFormData {
  description: string;
  amount: string;
  category: string;
  payment_method_id: string;
  expense_date: string;
  notes: string;
}

export const useExpenseForm = (expense: any, onSuccess: () => void) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<ExpenseFormData>({
    description: '',
    amount: '',
    category: '',
    payment_method_id: '',
    expense_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    if (expense) {
      setFormData({
        description: expense.description || '',
        amount: expense.amount?.toString() || '',
        category: expense.category || '',
        payment_method_id: expense.payment_method_id || '',
        expense_date: expense.expense_date ? expense.expense_date.split('T')[0] : new Date().toISOString().split('T')[0],
        notes: expense.notes || ''
      });
    } else {
      setFormData({
        description: '',
        amount: '',
        category: '',
        payment_method_id: '',
        expense_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
    }
  }, [expense]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (expense) {
        const { error } = await supabase
          .from('expenses')
          .update(data)
          .eq('id', expense.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('expenses')
          .insert([{ ...data, user_id: user?.id }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({
        title: "Sucesso!",
        description: expense ? "Despesa atualizada!" : "Despesa criada!",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao salvar despesa",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount || !formData.category) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    mutation.mutate({
      description: formData.description,
      amount: parseFloat(formData.amount),
      category: formData.category,
      payment_method_id: formData.payment_method_id || null,
      expense_date: formData.expense_date,
      notes: formData.notes || null,
    });
  };

  return {
    formData,
    handleChange,
    handleSubmit,
    isLoading: mutation.isPending,
  };
};
