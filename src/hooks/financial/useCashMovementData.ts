
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import * as paymentsApi from '@/api/payments';
import * as cashApi from '@/api/cash';

export const useCashMovementData = (date: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['cash-movement-data', user?.id, date],
    queryFn: async () => {
      if (!user?.id) return null;

      console.log('📊 Buscando dados de movimento do caixa para:', date);

      const [payments, cashOpening] = await Promise.all([
        paymentsApi.fetchPaymentsByDate(user.id, date),
        cashApi.fetchOpeningByDate(user.id, date),
      ]);

      let cashAmount = 0;
      let cardAmount = 0;
      let pixAmount = 0;
      let otherAmount = 0;
      let totalIncome = 0;

      payments?.forEach((payment: any) => {
        const paidAmount = Number(payment.paid_amount) || 0;
        totalIncome += paidAmount;

        const paymentType = payment.payment_methods?.type?.toLowerCase() || '';
        if (paymentType === 'dinheiro' || paymentType === 'cash') {
          cashAmount += paidAmount;
        } else if (paymentType === 'cartao' || paymentType === 'cartão' || paymentType === 'card' || paymentType.includes('cartao')) {
          cardAmount += paidAmount;
        } else if (paymentType === 'pix') {
          pixAmount += paidAmount;
        } else {
          otherAmount += paidAmount;
        }
      });

      const openingBalance = Number((cashOpening as any)?.opening_balance) || 0;
      const closingBalance = openingBalance + totalIncome;

      console.log('💰 Dados de movimento calculados (apenas receitas):', {
        totalIncome,
        openingBalance,
        closingBalance,
        cashAmount,
        cardAmount,
        pixAmount,
        otherAmount
      });

      return {
        openingBalance,
        totalIncome,
        totalExpenses: 0,
        closingBalance,
        cashAmount,
        cardAmount,
        pixAmount,
        otherAmount,
        paymentsCount: payments?.length || 0,
        expensesCount: 0,
      };
    },
    enabled: !!user?.id && !!date,
    staleTime: 60_000,
  });
};
