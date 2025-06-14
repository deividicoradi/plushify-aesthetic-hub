
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ReportsMetrics {
  totalClients: number;
  clientsGrowth: number;
  totalRevenue: number;
  revenueGrowth: number;
  totalAppointments: number;
  appointmentsGrowth: number;
  totalProducts: number;
  lowStockProducts: number;
}

export interface MonthlyData {
  month: string;
  revenue: number;
  appointments: number;
  newClients: number;
}

export interface CategoryData {
  name: string;
  value: number;
  percentage: number;
}

export const useReportsData = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<ReportsMetrics | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [revenueByCategory, setRevenueByCategory] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateGrowthRate = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const fetchMetrics = async () => {
    if (!user) return;

    try {
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

      // Buscar clientes
      const { data: clients } = await supabase
        .from('clients')
        .select('created_at')
        .eq('user_id', user.id);

      const currentMonthClients = clients?.filter(
        client => new Date(client.created_at) >= currentMonthStart
      ).length || 0;

      const lastMonthClients = clients?.filter(
        client => new Date(client.created_at) >= lastMonthStart && 
                  new Date(client.created_at) <= lastMonthEnd
      ).length || 0;

      // Buscar transações financeiras
      const { data: transactions } = await supabase
        .from('financial_transactions')
        .select('amount, type, transaction_date')
        .eq('user_id', user.id)
        .eq('type', 'receita');

      const currentMonthRevenue = transactions?.filter(
        t => new Date(t.transaction_date) >= currentMonthStart
      ).reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      const lastMonthRevenue = transactions?.filter(
        t => new Date(t.transaction_date) >= lastMonthStart && 
            new Date(t.transaction_date) <= lastMonthEnd
      ).reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      // Como não temos mais agendamentos, definir valores como 0
      const currentMonthAppointments = 0;
      const lastMonthAppointments = 0;

      // Buscar produtos
      const { data: products } = await supabase
        .from('products')
        .select('stock, min_stock')
        .eq('user_id', user.id);

      const totalProducts = products?.length || 0;
      const lowStockProducts = products?.filter(
        p => p.stock <= p.min_stock
      ).length || 0;

      setMetrics({
        totalClients: clients?.length || 0,
        clientsGrowth: calculateGrowthRate(currentMonthClients, lastMonthClients),
        totalRevenue: transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0,
        revenueGrowth: calculateGrowthRate(currentMonthRevenue, lastMonthRevenue),
        totalAppointments: 0, // Sistema de agendamentos será recriado
        appointmentsGrowth: calculateGrowthRate(currentMonthAppointments, lastMonthAppointments),
        totalProducts,
        lowStockProducts
      });

    } catch (err: any) {
      setError(err.message);
      console.error('Erro ao buscar métricas:', err);
    }
  };

  const fetchMonthlyData = async () => {
    if (!user) return;

    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      // Buscar dados dos últimos 6 meses
      const { data: transactions } = await supabase
        .from('financial_transactions')
        .select('amount, type, transaction_date')
        .eq('user_id', user.id)
        .eq('type', 'receita')
        .gte('transaction_date', sixMonthsAgo.toISOString());

      const { data: clients } = await supabase
        .from('clients')
        .select('created_at')
        .eq('user_id', user.id)
        .gte('created_at', sixMonthsAgo.toISOString());

      // Agrupar por mês
      const monthlyDataMap = new Map<string, MonthlyData>();

      // Inicializar últimos 6 meses
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toISOString().slice(0, 7);
        const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
        
        monthlyDataMap.set(monthKey, {
          month: monthName,
          revenue: 0,
          appointments: 0, // Sistema de agendamentos será recriado
          newClients: 0
        });
      }

      // Agregar receitas
      transactions?.forEach(t => {
        const monthKey = t.transaction_date.slice(0, 7);
        const existing = monthlyDataMap.get(monthKey);
        if (existing) {
          existing.revenue += Number(t.amount);
        }
      });

      // Agregar novos clientes
      clients?.forEach(client => {
        const monthKey = client.created_at.slice(0, 7);
        const existing = monthlyDataMap.get(monthKey);
        if (existing) {
          existing.newClients += 1;
        }
      });

      setMonthlyData(Array.from(monthlyDataMap.values()));

    } catch (err: any) {
      console.error('Erro ao buscar dados mensais:', err);
    }
  };

  const fetchRevenueByCategory = async () => {
    if (!user) return;

    try {
      const { data: transactions } = await supabase
        .from('financial_transactions')
        .select('amount, category, type')
        .eq('user_id', user.id)
        .eq('type', 'receita');

      const categoryMap = new Map<string, number>();
      let totalRevenue = 0;

      transactions?.forEach(t => {
        const amount = Number(t.amount);
        totalRevenue += amount;
        
        const current = categoryMap.get(t.category) || 0;
        categoryMap.set(t.category, current + amount);
      });

      const categoryData: CategoryData[] = Array.from(categoryMap.entries()).map(([name, value]) => ({
        name,
        value,
        percentage: totalRevenue > 0 ? (value / totalRevenue) * 100 : 0
      }));

      setRevenueByCategory(categoryData.sort((a, b) => b.value - a.value));

    } catch (err: any) {
      console.error('Erro ao buscar receita por categoria:', err);
    }
  };

  useEffect(() => {
    if (user) {
      const fetchAllData = async () => {
        setLoading(true);
        await Promise.all([
          fetchMetrics(),
          fetchMonthlyData(),
          fetchRevenueByCategory()
        ]);
        setLoading(false);
      };

      fetchAllData();
    }
  }, [user]);

  return {
    metrics,
    monthlyData,
    revenueByCategory,
    loading,
    error,
    refetch: () => {
      if (user) {
        fetchMetrics();
        fetchMonthlyData();
        fetchRevenueByCategory();
      }
    }
  };
};
