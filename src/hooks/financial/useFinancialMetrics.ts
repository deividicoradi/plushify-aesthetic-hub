
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface FinancialMetrics {
  totalReceitas: number;
  totalDespesas: number;
  saldoLiquido: number;
  receitasMesAtual: number;
  despesasMesAtual: number;
  crescimentoReceitas: number;
  crescimentoDespesas: number;
  parcelasVencidas: number;
  parcelasPendentes: number;
  ticketMedio: number;
}

export const useFinancialMetrics = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFinancialMetrics = async () => {
    if (!user) return;

    try {
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

      // Buscar dados em paralelo
      const [paymentsResult, cashClosuresResult, expensesResult, installmentsResult] = await Promise.all([
        supabase
          .from('payments')
          .select('amount, paid_amount, created_at, status, payment_date')
          .eq('user_id', user.id),
        
        supabase
          .from('cash_closures')
          .select('total_income, closure_date')
          .eq('user_id', user.id),

        supabase
          .from('expenses')
          .select('amount, expense_date, category')
          .eq('user_id', user.id),

        supabase
          .from('installments')
          .select('amount, due_date, status, payment_date')
          .eq('user_id', user.id)
      ]);

      const payments = paymentsResult.data || [];
      const cashClosures = cashClosuresResult.data || [];
      const expenses = expensesResult.data || [];
      const installments = installmentsResult.data || [];

      // Calcular receitas totais (pagamentos + fechamentos de caixa)
      const totalReceitasFromPayments = payments.reduce((sum, p) => sum + Number(p.paid_amount || 0), 0);
      const totalReceitasFromCashClosures = cashClosures.reduce((sum, c) => sum + Number(c.total_income || 0), 0);
      const totalReceitas = totalReceitasFromPayments + totalReceitasFromCashClosures;

      const totalDespesas = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
      
      // Receitas do mês atual
      const receitasMesAtualFromPayments = payments.filter(p => 
        p.payment_date && new Date(p.payment_date) >= currentMonthStart
      ).reduce((sum, p) => sum + Number(p.paid_amount || 0), 0);

      const receitasMesAtualFromCashClosures = cashClosures.filter(c => 
        new Date(c.closure_date) >= currentMonthStart
      ).reduce((sum, c) => sum + Number(c.total_income || 0), 0);

      const receitasMesAtual = receitasMesAtualFromPayments + receitasMesAtualFromCashClosures;

      const despesasMesAtual = expenses.filter(e => 
        new Date(e.expense_date) >= currentMonthStart
      ).reduce((sum, e) => sum + Number(e.amount), 0);

      // Receitas do mês passado
      const receitasMesPassadoFromPayments = payments.filter(p => 
        p.payment_date && new Date(p.payment_date) >= lastMonthStart && new Date(p.payment_date) <= lastMonthEnd
      ).reduce((sum, p) => sum + Number(p.paid_amount || 0), 0);

      const receitasMesPassadoFromCashClosures = cashClosures.filter(c => 
        new Date(c.closure_date) >= lastMonthStart && new Date(c.closure_date) <= lastMonthEnd
      ).reduce((sum, c) => sum + Number(c.total_income || 0), 0);

      const receitasMesPassado = receitasMesPassadoFromPayments + receitasMesPassadoFromCashClosures;

      const despesasMesPassado = expenses.filter(e => 
        new Date(e.expense_date) >= lastMonthStart && new Date(e.expense_date) <= lastMonthEnd
      ).reduce((sum, e) => sum + Number(e.amount), 0);

      const parcelasVencidas = installments.filter(i => 
        new Date(i.due_date) < now && i.status === 'pendente'
      ).length;

      const parcelasPendentes = installments.filter(i => 
        i.status === 'pendente'
      ).length;

      const pagamentosPagos = payments.filter(p => p.status === 'pago');
      const ticketMedio = pagamentosPagos.length > 0 
        ? pagamentosPagos.reduce((sum, p) => sum + Number(p.amount), 0) / pagamentosPagos.length 
        : 0;

      setMetrics({
        totalReceitas,
        totalDespesas,
        saldoLiquido: totalReceitas - totalDespesas,
        receitasMesAtual,
        despesasMesAtual,
        crescimentoReceitas: receitasMesPassado > 0 ? ((receitasMesAtual - receitasMesPassado) / receitasMesPassado) * 100 : 0,
        crescimentoDespesas: despesasMesPassado > 0 ? ((despesasMesAtual - despesasMesPassado) / despesasMesPassado) * 100 : 0,
        parcelasVencidas,
        parcelasPendentes,
        ticketMedio
      });

    } catch (err: any) {
      setError(err.message);
      console.error('Erro ao buscar métricas financeiras:', err);
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchFinancialMetrics().finally(() => setLoading(false));
    }
  }, [user]);

  return {
    metrics,
    loading,
    error,
    refetch: fetchFinancialMetrics
  };
};
