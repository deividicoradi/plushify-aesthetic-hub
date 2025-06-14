
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/hooks/use-toast";

export const usePaymentInstallments = () => {
  const { user } = useAuth();

  const createInstallmentsForPartialPayment = async (paymentData: any) => {
    const remainingAmount = Number(paymentData.amount) - Number(paymentData.paid_amount);
    
    if (remainingAmount <= 0) return;

    // Criar uma parcela para o valor restante
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + 1); // Vencimento em 30 dias

    const installment = {
      user_id: user?.id,
      payment_id: paymentData.id,
      installment_number: 1,
      total_installments: 1,
      amount: remainingAmount,
      due_date: dueDate.toISOString(),
      status: 'pendente',
      notes: `Valor restante do pagamento: ${paymentData.description}`
    };

    const { error } = await supabase
      .from('installments')
      .insert([installment]);

    if (error) {
      console.error('Erro ao criar parcelamento automático:', error);
      throw error;
    }

    console.log('✅ Parcelamento automático criado para pagamento parcial');
  };

  return {
    createInstallmentsForPartialPayment
  };
};
