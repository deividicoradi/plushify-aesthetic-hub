
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/hooks/use-toast";
import { useCashIntegration } from './useCashIntegration';

interface PaymentFormData {
  description: string;
  amount: string;
  payment_method_id: string;
  client_id: string;
  due_date: string;
  notes: string;
  status: string;
  paid_amount: string;
}

export const usePaymentForm = (payment?: any, onSuccess?: () => void) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { updateCashFromPayment } = useCashIntegration();
  
  const [formData, setFormData] = useState<PaymentFormData>({
    description: payment?.description || '',
    amount: payment?.amount || '',
    payment_method_id: payment?.payment_method_id || '',
    client_id: payment?.client_id || '',
    due_date: payment?.due_date ? payment.due_date.split('T')[0] : '',
    notes: payment?.notes || '',
    status: payment?.status || 'pendente',
    paid_amount: payment?.paid_amount || ''
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('Dados sendo enviados para pagamento:', data);
      
      let result;
      if (payment) {
        const { data: updateResult, error } = await supabase
          .from('payments')
          .update(data)
          .eq('id', payment.id)
          .select('*')
          .single();
        
        if (error) {
          console.error('Erro ao atualizar pagamento:', error);
          throw error;
        }
        result = updateResult;
      } else {
        const { data: insertResult, error } = await supabase
          .from('payments')
          .insert([{ ...data, user_id: user?.id }])
          .select('*')
          .single();
        
        if (error) {
          console.error('Erro ao inserir pagamento:', error);
          throw error;
        }
        result = insertResult;
      }

      return result;
    },
    onSuccess: async (result) => {
      console.log('💰 Pagamento salvo com sucesso:', result);

      // Se o pagamento foi marcado como pago e tem valor pago, atualizar o caixa
      if (result.status === 'pago' && Number(result.paid_amount) > 0) {
        console.log('🔄 Iniciando atualização do caixa...');
        
        try {
          await updateCashFromPayment.mutateAsync({
            paymentAmount: Number(result.paid_amount),
            paymentMethodId: result.payment_method_id,
            description: result.description || 'Pagamento recebido'
          });
          console.log('✅ Caixa atualizado com sucesso!');
        } catch (error) {
          console.error('❌ Erro ao atualizar caixa:', error);
          // Não falhar a operação principal se houver erro no caixa
          toast({
            title: "Atenção",
            description: "Pagamento salvo, mas houve erro ao atualizar o caixa. Verifique manualmente.",
            variant: "destructive",
          });
        }
      } else {
        console.log('ℹ️ Pagamento não está marcado como pago ou não tem valor pago - caixa não será atualizado');
      }

      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      toast({
        title: "Sucesso!",
        description: payment ? 'Pagamento atualizado!' : 'Pagamento criado!',
      });
      onSuccess?.();
      setFormData({
        description: '',
        amount: '',
        payment_method_id: '',
        client_id: '',
        due_date: '',
        notes: '',
        status: 'pendente',
        paid_amount: ''
      });
    },
    onError: (error) => {
      console.error('Erro completo:', error);
      toast({
        title: "Erro",
        description: 'Erro ao salvar pagamento: ' + (error.message || 'Erro desconhecido'),
        variant: "destructive",
      });
    },
  });

  const handleChange = (field: keyof PaymentFormData, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Se marcar como pago e não tem paid_amount, usar o amount total
      if (field === 'status' && value === 'pago' && !newData.paid_amount) {
        newData.paid_amount = newData.amount;
      }
      
      return newData;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount || !formData.payment_method_id) {
      toast({
        title: "Erro",
        description: 'Preencha todos os campos obrigatórios',
        variant: "destructive",
      });
      return;
    }

    // Se status é pago, deve ter paid_amount
    if (formData.status === 'pago' && (!formData.paid_amount || Number(formData.paid_amount) <= 0)) {
      toast({
        title: "Erro",
        description: 'Para pagamentos com status "pago", informe o valor pago',
        variant: "destructive",
      });
      return;
    }

    const dataToSubmit = {
      description: formData.description,
      amount: parseFloat(formData.amount),
      payment_method_id: formData.payment_method_id,
      client_id: formData.client_id || null,
      due_date: formData.due_date || null,
      notes: formData.notes || null,
      status: formData.status,
      paid_amount: parseFloat(formData.paid_amount) || 0,
      payment_date: formData.status === 'pago' ? new Date().toISOString() : null
    };

    console.log('Submetendo dados do pagamento:', dataToSubmit);
    mutation.mutate(dataToSubmit);
  };

  return {
    formData,
    handleChange,
    handleSubmit,
    isLoading: mutation.isPending
  };
};
