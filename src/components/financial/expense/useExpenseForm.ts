
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/hooks/use-toast";
import { useCashOpeningValidation } from '@/hooks/financial/useCashOpeningValidation';

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
  const { checkAndPromptCashOpening } = useCashOpeningValidation();
  
  const [formData, setFormData] = useState<ExpenseFormData>({
    description: '',
    amount: '',
    category: '',
    payment_method_id: '',
    expense_date: format(new Date(), 'yyyy-MM-dd'),
    notes: ''
  });

  useEffect(() => {
    if (expense) {
      setFormData({
        description: expense.description || '',
        amount: expense.amount?.toString() || '',
        category: expense.category || '',
        payment_method_id: expense.payment_method_id || '',
        // expense_date é timestamptz; extrai a data local (não a UTC) pra exibir no input.
        expense_date: expense.expense_date ? format(parseISO(expense.expense_date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        notes: expense.notes || ''
      });
    } else {
      setFormData({
        description: '',
        amount: '',
        category: '',
        payment_method_id: '',
        expense_date: format(new Date(), 'yyyy-MM-dd'),
        notes: ''
      });
    }
  }, [expense]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      // ✅ VALIDAÇÃO OBRIGATÓRIA DO CAIXA ANTES DE QUALQUER OPERAÇÃO
      console.log('🔒 [VALIDAÇÃO OBRIGATÓRIA] Verificando status do caixa para despesa...');
      // data.expense_date chega aqui como "yyyy-MM-dd" (valor bruto do form)
      const targetDate = expense ?
        (expense.expense_date ? format(parseISO(expense.expense_date), 'yyyy-MM-dd') : data.expense_date) :
        data.expense_date;

      const validation = await checkAndPromptCashOpening(targetDate);
      if (!validation.shouldProceed) {
        throw new Error('Operação bloqueada: caixa não está aberto para esta data');
      }

      // expense_date é timestamptz: enviar "yyyy-MM-dd" puro seria interpretado como
      // meia-noite UTC, exibindo o dia anterior em qualquer fuso negativo (ex: Brasil).
      // Convertendo pra meia-noite local antes de gravar.
      const payload = {
        ...data,
        expense_date: new Date(`${data.expense_date}T00:00:00`).toISOString(),
      };

      if (expense) {
        const { error } = await supabase
          .from('expenses')
          .update(payload)
          .eq('id', expense.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('expenses')
          .insert([{ ...payload, user_id: user?.id }]);
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
        description: error.message || "Erro ao salvar despesa",
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
