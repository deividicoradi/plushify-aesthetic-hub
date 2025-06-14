
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/hooks/use-toast";

interface InstallmentFormData {
  payment_id: string;
  total_installments: number;
  amount: string;
  due_date: Date;
  notes: string;
}

export const useInstallmentForm = (installment: any, onSuccess: () => void) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<InstallmentFormData>({
    payment_id: '',
    total_installments: 2,
    amount: '',
    due_date: new Date(),
    notes: ''
  });

  useEffect(() => {
    if (installment) {
      setFormData({
        payment_id: installment.payment_id || '',
        total_installments: installment.total_installments || 2,
        amount: installment.amount?.toString() || '',
        due_date: installment.due_date ? new Date(installment.due_date) : new Date(),
        notes: installment.notes || ''
      });
    } else {
      setFormData({
        payment_id: '',
        total_installments: 2,
        amount: '',
        due_date: new Date(),
        notes: ''
      });
    }
  }, [installment]);

  const handleFieldChange = (field: keyof InstallmentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !formData.payment_id || !formData.amount) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const installmentAmount = Number(formData.amount);

      if (installment) {
        // Editando parcelamento existente
        const { error } = await supabase
          .from('installments')
          .update({
            amount: installmentAmount,
            due_date: formData.due_date.toISOString(),
            notes: formData.notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', installment.id);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Parcelamento atualizado com sucesso.",
        });
      } else {
        // Criando novo parcelamento
        const installments = [];
        for (let i = 1; i <= formData.total_installments; i++) {
          const dueDate = new Date(formData.due_date);
          dueDate.setMonth(dueDate.getMonth() + (i - 1));

          installments.push({
            user_id: user.id,
            payment_id: formData.payment_id,
            installment_number: i,
            total_installments: formData.total_installments,
            amount: installmentAmount,
            due_date: dueDate.toISOString(),
            status: 'pendente',
            notes: formData.notes
          });
        }

        const { error } = await supabase
          .from('installments')
          .insert(installments);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: `Parcelamento criado com ${formData.total_installments} parcelas.`,
        });
      }

      onSuccess();
    } catch (error: any) {
      console.error('Erro ao salvar parcelamento:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar parcelamento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    handleFieldChange,
    handleSubmit
  };
};
