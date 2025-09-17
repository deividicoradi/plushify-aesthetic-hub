
import { useAuth } from '@/contexts/AuthContext';
import * as installmentsApi from '@/api/installments';

export const usePaymentInstallments = () => {
  const { user } = useAuth();

  const createInstallmentsForPartialPayment = async (paymentData: any) => {
    const remainingAmount = Number(paymentData.amount) - Number(paymentData.paid_amount);

    console.log('📝 Criando parcelamento automático:', {
      totalAmount: paymentData.amount,
      paidAmount: paymentData.paid_amount,
      remainingAmount,
      paymentId: paymentData.id,
    });

    if (remainingAmount <= 0) {
      console.log('⚠️ Valor restante é zero ou negativo, não criando parcelamento');
      return null;
    }

    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + 1);

    const installment = {
      user_id: user?.id,
      payment_id: paymentData.id,
      installment_number: 1,
      total_installments: 1,
      amount: remainingAmount,
      due_date: dueDate.toISOString(),
      status: 'pendente',
      notes: `Valor restante do pagamento: ${paymentData.description || 'Pagamento parcial'}`,
    };

    console.log('💾 Inserindo parcelamento:', installment);
    const data = await installmentsApi.createInstallment(installment);
    console.log('✅ Parcelamento automático criado com sucesso:', data);
    return data;
  };

  return { createInstallmentsForPartialPayment };
};
