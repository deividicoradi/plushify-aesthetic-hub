
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useCashMovementData = (date: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['cash-movement-data', user?.id, date],
    queryFn: async () => {
      if (!user?.id) return null;

      console.log('📊 Buscando dados de movimento do caixa para:', date);

      // Buscar pagamentos recebidos no dia
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select(`
          *,
          payment_methods (name, type)
        `)
        .eq('user_id', user.id)
        .gte('created_at', `${date}T00:00:00`)
        .lt('created_at', `${date}T23:59:59`)
        .in('status', ['pago', 'parcial']);

      if (paymentsError) {
        console.error('❌ Erro ao buscar pagamentos:', paymentsError);
        throw paymentsError;
      }

      // Buscar despesas do dia
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select(`
          *,
          payment_methods (name, type)
        `)
        .eq('user_id', user.id)
        .gte('expense_date', `${date}T00:00:00`)
        .lt('expense_date', `${date}T23:59:59`);

      if (expensesError) {
        console.error('❌ Erro ao buscar despesas:', expensesError);
        throw expensesError;
      }

      // Buscar abertura de caixa do dia
      const { data: cashOpening, error: openingError } = await supabase
        .from('cash_openings')
        .select('*')
        .eq('user_id', user.id)
        .eq('opening_date', date)
        .maybeSingle();

      if (openingError) {
        console.error('❌ Erro ao buscar abertura de caixa:', openingError);
        throw openingError;
      }

      // Calcular totais por método de pagamento
      let cashAmount = 0;
      let cardAmount = 0;
      let pixAmount = 0;
      let otherAmount = 0;
      let totalIncome = 0;

      payments?.forEach(payment => {
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

      // Calcular total de despesas
      const totalExpenses = expenses?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;

      // Usar saldo inicial da abertura ou 0
      const openingBalance = Number(cashOpening?.opening_balance) || 0;
      
      // Calcular saldo final
      const closingBalance = openingBalance + totalIncome - totalExpenses;

      console.log('💰 Dados de movimento calculados:', {
        totalIncome,
        totalExpenses,
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
        totalExpenses,
        closingBalance,
        cashAmount,
        cardAmount,
        pixAmount,
        otherAmount,
        paymentsCount: payments?.length || 0,
        expensesCount: expenses?.length || 0
      };
    },
    enabled: !!user?.id && !!date,
  });
};
