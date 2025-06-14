
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/components/ui/sonner";

interface PaymentFormData {
  description: string;
  amount: string;
  payment_method_id: string;
  client_id: string;
  due_date: string;
  notes: string;
  status: string;
}

export const usePaymentForm = (payment?: any, onSuccess?: () => void) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<PaymentFormData>({
    description: payment?.description || '',
    amount: payment?.amount || '',
    payment_method_id: payment?.payment_method_id || '',
    client_id: payment?.client_id || '',
    due_date: payment?.due_date ? payment.due_date.split('T')[0] : '',
    notes: payment?.notes || '',
    status: payment?.status || 'pendente'
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('Dados sendo enviados:', data);
      
      if (payment) {
        const { error } = await supabase
          .from('payments')
          .update(data)
          .eq('id', payment.id);
        if (error) {
          console.error('Erro ao atualizar:', error);
          throw error;
        }
      } else {
        const { error } = await supabase
          .from('payments')
          .insert([{ ...data, user_id: user?.id }]);
        if (error) {
          console.error('Erro ao inserir:', error);
          throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      toast.success(payment ? 'Pagamento atualizado!' : 'Pagamento criado!');
      onSuccess?.();
      setFormData({
        description: '',
        amount: '',
        payment_method_id: '',
        client_id: '',
        due_date: '',
        notes: '',
        status: 'pendente'
      });
    },
    onError: (error) => {
      console.error('Erro completo:', error);
      toast.error('Erro ao salvar pagamento');
    },
  });

  const handleChange = (field: keyof PaymentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount || !formData.payment_method_id) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const dataToSubmit = {
      description: formData.description,
      amount: parseFloat(formData.amount),
      payment_method_id: formData.payment_method_id,
      client_id: formData.client_id || null,
      due_date: formData.due_date || null,
      notes: formData.notes || null,
      status: formData.status
    };

    console.log('Submetendo dados:', dataToSubmit);
    mutation.mutate(dataToSubmit);
  };

  return {
    formData,
    handleChange,
    handleSubmit,
    isLoading: mutation.isPending
  };
};
