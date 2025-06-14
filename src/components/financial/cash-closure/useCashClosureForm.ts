
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/hooks/use-toast";
import { useCashMovementData } from '@/hooks/financial/useCashMovementData';

interface CashClosureFormData {
  closure_date: string;
  opening_balance: string;
  closing_balance: string;
  total_income: string;
  total_expenses: string;
  cash_amount: string;
  card_amount: string;
  pix_amount: string;
  other_amount: string;
  notes: string;
}

export const useCashClosureForm = (closure?: any, onSuccess?: () => void) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<CashClosureFormData>({
    closure_date: new Date().toISOString().split('T')[0],
    opening_balance: '',
    closing_balance: '',
    total_income: '',
    total_expenses: '',
    cash_amount: '',
    card_amount: '',
    pix_amount: '',
    other_amount: '',
    notes: ''
  });

  // Buscar dados automáticos do movimento quando não estiver editando
  const { data: movementData, isLoading: loadingMovement } = useCashMovementData(
    !closure ? formData.closure_date : ''
  );

  useEffect(() => {
    if (closure) {
      // Editando fechamento existente
      setFormData({
        closure_date: closure.closure_date || new Date().toISOString().split('T')[0],
        opening_balance: closure.opening_balance?.toString() || '',
        closing_balance: closure.closing_balance?.toString() || '',
        total_income: closure.total_income?.toString() || '',
        total_expenses: closure.total_expenses?.toString() || '',
        cash_amount: closure.cash_amount?.toString() || '',
        card_amount: closure.card_amount?.toString() || '',
        pix_amount: closure.pix_amount?.toString() || '',
        other_amount: closure.other_amount?.toString() || '',
        notes: closure.notes || ''
      });
    } else if (movementData && !loadingMovement) {
      // Novo fechamento com dados automáticos (apenas receitas)
      console.log('📊 Preenchendo formulário com dados automáticos (receitas):', movementData);
      setFormData(prev => ({
        ...prev,
        opening_balance: movementData.openingBalance.toString(),
        total_income: movementData.totalIncome.toString(),
        cash_amount: movementData.cashAmount.toString(),
        card_amount: movementData.cardAmount.toString(),
        pix_amount: movementData.pixAmount.toString(),
        other_amount: movementData.otherAmount.toString(),
        // Despesas e saldo final ficam vazios para preenchimento manual
        total_expenses: '',
        closing_balance: '',
        notes: `Fechamento automático - ${movementData.paymentsCount} pagamento(s) recebido(s). Insira as despesas manualmente.`
      }));
    }
  }, [closure, movementData, loadingMovement]);

  // Recalcular saldo final quando receitas ou despesas mudarem
  useEffect(() => {
    if (!closure && formData.total_income && formData.total_expenses) {
      const income = parseFloat(formData.total_income) || 0;
      const expenses = parseFloat(formData.total_expenses) || 0;
      const opening = parseFloat(formData.opening_balance) || 0;
      const calculatedClosing = opening + income - expenses;
      
      setFormData(prev => ({
        ...prev,
        closing_balance: calculatedClosing.toString()
      }));
    }
  }, [formData.total_income, formData.total_expenses, formData.opening_balance, closure]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const calculatedDifference = Number(data.closing_balance) - Number(data.opening_balance);
      
      if (closure) {
        const { error } = await supabase
          .from('cash_closures')
          .update({ 
            ...data, 
            difference: calculatedDifference,
            status: 'fechado',
            closed_at: new Date().toISOString()
          })
          .eq('id', closure.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cash_closures')
          .insert([{ 
            ...data, 
            user_id: user?.id,
            difference: calculatedDifference,
            status: 'fechado',
            closed_at: new Date().toISOString()
          }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-closures'] });
      queryClient.invalidateQueries({ queryKey: ['cash-openings'] });
      toast({
        title: "Sucesso!",
        description: closure ? "Fechamento atualizado!" : "Fechamento de caixa criado com receitas automáticas. Despesas inseridas manualmente.",
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao salvar fechamento de caixa",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const handleChange = (field: keyof CashClosureFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotal = () => {
    const cash = parseFloat(formData.cash_amount) || 0;
    const card = parseFloat(formData.card_amount) || 0;
    const pix = parseFloat(formData.pix_amount) || 0;
    const other = parseFloat(formData.other_amount) || 0;
    return cash + card + pix + other;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.closure_date || !formData.closing_balance) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const processedData = {
      closure_date: formData.closure_date,
      opening_balance: parseFloat(formData.opening_balance) || 0,
      closing_balance: parseFloat(formData.closing_balance),
      total_income: parseFloat(formData.total_income) || 0,
      total_expenses: parseFloat(formData.total_expenses) || 0,
      cash_amount: parseFloat(formData.cash_amount) || 0,
      card_amount: parseFloat(formData.card_amount) || 0,
      pix_amount: parseFloat(formData.pix_amount) || 0,
      other_amount: parseFloat(formData.other_amount) || 0,
      notes: formData.notes || null,
    };

    mutation.mutate(processedData);
  };

  return {
    formData,
    handleChange,
    handleSubmit,
    calculateTotal,
    isLoading: mutation.isPending || loadingMovement,
    movementData,
    loadingMovement,
  };
};
