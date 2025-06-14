
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ReportsMetrics {
  totalClients: number;
  totalRevenue: number;
  totalAppointments: number;
  totalProducts: number;
  lowStockProducts: number;
  clientsGrowth?: number;
  revenueGrowth?: number;
  appointmentsGrowth?: number;
}

export const useReportsMetrics = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<ReportsMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Buscando métricas para usuário:', user.id);

      const currentMonth = new Date();
      const lastMonth = new Date();
      lastMonth.setMonth(currentMonth.getMonth() - 1);

      const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const lastMonthStart = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
      const lastMonthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0);

      // Buscar métricas em paralelo
      const [
        clientsResult,
        paymentsResult,
        appointmentsResult,
        productsResult,
        currentMonthPaymentsResult,
        lastMonthPaymentsResult,
        currentMonthClientsResult,
        lastMonthClientsResult,
        currentMonthAppointmentsResult,
        lastMonthAppointmentsResult
      ] = await Promise.all([
        supabase.from('clients').select('id').eq('user_id', user.id),
        // Buscar apenas pagamentos com status 'pago' e somar o paid_amount
        supabase.from('payments').select('paid_amount').eq('user_id', user.id).eq('status', 'pago'),
        supabase.from('appointments').select('id').eq('user_id', user.id),
        supabase.from('products').select('id, stock, min_stock').eq('user_id', user.id),
        
        // Métricas do mês atual - apenas pagamentos realizados
        supabase.from('payments').select('paid_amount').eq('user_id', user.id).eq('status', 'pago').gte('payment_date', currentMonthStart.toISOString()),
        supabase.from('payments').select('paid_amount').eq('user_id', user.id).eq('status', 'pago').gte('payment_date', lastMonthStart.toISOString()).lte('payment_date', lastMonthEnd.toISOString()),
        
        supabase.from('clients').select('id').eq('user_id', user.id).gte('created_at', currentMonthStart.toISOString()),
        supabase.from('clients').select('id').eq('user_id', user.id).gte('created_at', lastMonthStart.toISOString()).lte('created_at', lastMonthEnd.toISOString()),
        
        supabase.from('appointments').select('id').eq('user_id', user.id).gte('created_at', currentMonthStart.toISOString()),
        supabase.from('appointments').select('id').eq('user_id', user.id).gte('created_at', lastMonthStart.toISOString()).lte('created_at', lastMonthEnd.toISOString())
      ]);

      console.log('📊 Dados dos pagamentos recebidos:', paymentsResult.data);

      const totalClients = clientsResult.data?.length || 0;
      // Somar paid_amount dos pagamentos com status 'pago'
      const totalRevenue = paymentsResult.data?.reduce((sum, payment) => {
        const amount = Number(payment.paid_amount) || 0;
        console.log('💰 Somando valor pago:', amount);
        return sum + amount;
      }, 0) || 0;
      
      console.log('💵 Receita total calculada:', totalRevenue);
      
      const totalAppointments = appointmentsResult.data?.length || 0;
      const totalProducts = productsResult.data?.length || 0;
      const lowStockProducts = productsResult.data?.filter(p => p.stock <= p.min_stock).length || 0;

      // Calcular crescimento
      const currentMonthRevenue = currentMonthPaymentsResult.data?.reduce((sum, payment) => sum + Number(payment.paid_amount), 0) || 0;
      const lastMonthRevenue = lastMonthPaymentsResult.data?.reduce((sum, payment) => sum + Number(payment.paid_amount), 0) || 0;
      const revenueGrowth = lastMonthRevenue > 0 ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

      const currentMonthClients = currentMonthClientsResult.data?.length || 0;
      const lastMonthClients = lastMonthClientsResult.data?.length || 0;
      const clientsGrowth = lastMonthClients > 0 ? ((currentMonthClients - lastMonthClients) / lastMonthClients) * 100 : 0;

      const currentMonthAppointments = currentMonthAppointmentsResult.data?.length || 0;
      const lastMonthAppointments = lastMonthAppointmentsResult.data?.length || 0;
      const appointmentsGrowth = lastMonthAppointments > 0 ? ((currentMonthAppointments - lastMonthAppointments) / lastMonthAppointments) * 100 : 0;

      const finalMetrics = {
        totalClients,
        totalRevenue,
        totalAppointments,
        totalProducts,
        lowStockProducts,
        clientsGrowth,
        revenueGrowth,
        appointmentsGrowth
      };

      console.log('📈 Métricas finais:', finalMetrics);
      setMetrics(finalMetrics);

    } catch (err: any) {
      console.error('❌ Erro ao buscar métricas:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [user]);

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics
  };
};
