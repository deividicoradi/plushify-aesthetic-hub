
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

export const useReportsMetrics = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<ReportsMetrics | null>(null);
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

      // Buscar agendamentos
      const { data: appointments } = await supabase
        .from('appointments')
        .select('created_at')
        .eq('user_id', user.id);

      const currentMonthAppointments = appointments?.filter(
        appointment => new Date(appointment.created_at) >= currentMonthStart
      ).length || 0;

      const lastMonthAppointments = appointments?.filter(
        appointment => new Date(appointment.created_at) >= lastMonthStart && 
                      new Date(appointment.created_at) <= lastMonthEnd
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

      // Buscar produtos
      const { data: products } = await supabase
        .from('products')
        .select('stock, min_stock')
        .eq('user_id', user.id);

      const totalProducts = products?.length || 0;
      const lowStockProducts = products?.filter(
        p => p.stock <= p.min_stock
      ).length || 0;

      console.log('Reports metrics updated:', {
        totalAppointments: appointments?.length || 0,
        appointmentsGrowth: calculateGrowthRate(currentMonthAppointments, lastMonthAppointments)
      });

      setMetrics({
        totalClients: clients?.length || 0,
        clientsGrowth: calculateGrowthRate(currentMonthClients, lastMonthClients),
        totalRevenue: transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0,
        revenueGrowth: calculateGrowthRate(currentMonthRevenue, lastMonthRevenue),
        totalAppointments: appointments?.length || 0,
        appointmentsGrowth: calculateGrowthRate(currentMonthAppointments, lastMonthAppointments),
        totalProducts,
        lowStockProducts
      });

    } catch (err: any) {
      setError(err.message);
      console.error('Erro ao buscar métricas:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMetrics();
    }
  }, [user]);

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics
  };
};
