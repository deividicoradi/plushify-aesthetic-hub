
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

export interface MonthlyFinancialData {
  month: string;
  receitas: number;
  despesas: number;
  saldoLiquido: number;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export const useFinancialData = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyFinancialData[]>([]);
  const [expensesByCategory, setExpensesByCategory] = useState<CategoryData[]>([]);
  const [revenueByMethod, setRevenueByMethod] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFinancialMetrics = async () => {
    if (!user) return;

    try {
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

      // Buscar pagamentos
      const { data: payments } = await supabase
        .from('payments')
        .select('amount, paid_amount, created_at, status')
        .eq('user_id', user.id);

      // Buscar despesas
      const { data: expenses } = await supabase
        .from('expenses')
        .select('amount, expense_date, category')
        .eq('user_id', user.id);

      // Buscar parcelamentos
      const { data: installments } = await supabase
        .from('installments')
        .select('amount, due_date, status, payment_date')
        .eq('user_id', user.id);

      // Calcular métricas
      const totalReceitas = payments?.reduce((sum, p) => sum + Number(p.paid_amount || 0), 0) || 0;
      const totalDespesas = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
      
      const receitasMesAtual = payments?.filter(p => 
        new Date(p.created_at) >= currentMonthStart
      ).reduce((sum, p) => sum + Number(p.paid_amount || 0), 0) || 0;

      const despesasMesAtual = expenses?.filter(e => 
        new Date(e.expense_date) >= currentMonthStart
      ).reduce((sum, e) => sum + Number(e.amount), 0) || 0;

      const receitasMesPassado = payments?.filter(p => 
        new Date(p.created_at) >= lastMonthStart && new Date(p.created_at) <= lastMonthEnd
      ).reduce((sum, p) => sum + Number(p.paid_amount || 0), 0) || 0;

      const despesasMesPassado = expenses?.filter(e => 
        new Date(e.expense_date) >= lastMonthStart && new Date(e.expense_date) <= lastMonthEnd
      ).reduce((sum, e) => sum + Number(e.amount), 0) || 0;

      const parcelasVencidas = installments?.filter(i => 
        new Date(i.due_date) < now && i.status === 'pendente'
      ).length || 0;

      const parcelasPendentes = installments?.filter(i => 
        i.status === 'pendente'
      ).length || 0;

      const pagamentosPagos = payments?.filter(p => p.status === 'pago') || [];
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

  const fetchMonthlyData = async () => {
    if (!user) return;

    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: payments } = await supabase
        .from('payments')
        .select('paid_amount, created_at')
        .eq('user_id', user.id)
        .gte('created_at', sixMonthsAgo.toISOString());

      const { data: expenses } = await supabase
        .from('expenses')
        .select('amount, expense_date')
        .eq('user_id', user.id)
        .gte('expense_date', sixMonthsAgo.toISOString());

      const monthlyDataMap = new Map<string, MonthlyFinancialData>();

      // Inicializar últimos 6 meses
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toISOString().slice(0, 7);
        const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
        
        monthlyDataMap.set(monthKey, {
          month: monthName,
          receitas: 0,
          despesas: 0,
          saldoLiquido: 0
        });
      }

      // Agregar receitas
      payments?.forEach(p => {
        const monthKey = p.created_at.slice(0, 7);
        const existing = monthlyDataMap.get(monthKey);
        if (existing) {
          existing.receitas += Number(p.paid_amount || 0);
        }
      });

      // Agregar despesas
      expenses?.forEach(e => {
        const monthKey = e.expense_date.slice(0, 7);
        const existing = monthlyDataMap.get(monthKey);
        if (existing) {
          existing.despesas += Number(e.amount);
        }
      });

      // Calcular saldo líquido
      monthlyDataMap.forEach(data => {
        data.saldoLiquido = data.receitas - data.despesas;
      });

      setMonthlyData(Array.from(monthlyDataMap.values()));

    } catch (err: any) {
      console.error('Erro ao buscar dados mensais:', err);
    }
  };

  const fetchCategoryData = async () => {
    if (!user) return;

    try {
      // Despesas por categoria
      const { data: expenses } = await supabase
        .from('expenses')
        .select('amount, category')
        .eq('user_id', user.id);

      const expenseCategoryMap = new Map<string, number>();
      expenses?.forEach(e => {
        const current = expenseCategoryMap.get(e.category) || 0;
        expenseCategoryMap.set(e.category, current + Number(e.amount));
      });

      const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00c49f'];
      const expenseCategories: CategoryData[] = Array.from(expenseCategoryMap.entries()).map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length]
      }));

      setExpensesByCategory(expenseCategories);

      // Receitas por método de pagamento
      const { data: payments } = await supabase
        .from('payments')
        .select(`
          paid_amount,
          payment_methods(name)
        `)
        .eq('user_id', user.id)
        .not('payment_methods', 'is', null);

      const revenueMethodMap = new Map<string, number>();
      payments?.forEach(p => {
        const methodName = p.payment_methods?.name || 'Outros';
        const current = revenueMethodMap.get(methodName) || 0;
        revenueMethodMap.set(methodName, current + Number(p.paid_amount || 0));
      });

      const revenueMethods: CategoryData[] = Array.from(revenueMethodMap.entries()).map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length]
      }));

      setRevenueByMethod(revenueMethods);

    } catch (err: any) {
      console.error('Erro ao buscar dados por categoria:', err);
    }
  };

  useEffect(() => {
    if (user) {
      const fetchAllData = async () => {
        setLoading(true);
        await Promise.all([
          fetchFinancialMetrics(),
          fetchMonthlyData(),
          fetchCategoryData()
        ]);
        setLoading(false);
      };

      fetchAllData();
    }
  }, [user]);

  return {
    metrics,
    monthlyData,
    expensesByCategory,
    revenueByMethod,
    loading,
    error,
    refetch: () => {
      if (user) {
        fetchFinancialMetrics();
        fetchMonthlyData();
        fetchCategoryData();
      }
    }
  };
};
