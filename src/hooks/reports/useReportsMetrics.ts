
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

      console.log('🔍 Buscando métricas para relatórios - usuário:', user.id);

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
        cashClosuresResult,
        currentMonthPaymentsResult,
        lastMonthPaymentsResult,
        currentMonthCashClosuresResult,
        lastMonthCashClosuresResult,
        currentMonthClientsResult,
        lastMonthClientsResult,
        currentMonthAppointmentsResult,
        lastMonthAppointmentsResult
      ] = await Promise.all([
        supabase.from('clients').select('id').eq('user_id', user.id),
        // Buscar todos os pagamentos primeiro, filtraremos por status depois
        supabase.from('payments').select('paid_amount, status').eq('user_id', user.id),
        supabase.from('appointments').select('id').eq('user_id', user.id),
        supabase.from('products').select('id, stock_quantity, min_stock_level').eq('user_id', user.id),
        
        // Buscar fechamentos de caixa
        supabase.from('cash_closures').select('total_income').eq('user_id', user.id),
        
        // Métricas do mês atual - buscar todos e filtrar depois
        supabase.from('payments').select('paid_amount, status, payment_date').eq('user_id', user.id).gte('payment_date', currentMonthStart.toISOString()),
        supabase.from('payments').select('paid_amount, status, payment_date').eq('user_id', user.id).gte('payment_date', lastMonthStart.toISOString()).lte('payment_date', lastMonthEnd.toISOString()),
        
        // Fechamentos de caixa do mês atual e anterior
        supabase.from('cash_closures').select('total_income').eq('user_id', user.id).gte('closure_date', currentMonthStart.toISOString().split('T')[0]),
        supabase.from('cash_closures').select('total_income').eq('user_id', user.id).gte('closure_date', lastMonthStart.toISOString().split('T')[0]).lte('closure_date', lastMonthEnd.toISOString().split('T')[0]),
        
        supabase.from('clients').select('id').eq('user_id', user.id).gte('created_at', currentMonthStart.toISOString()),
        supabase.from('clients').select('id').eq('user_id', user.id).gte('created_at', lastMonthStart.toISOString()).lte('created_at', lastMonthEnd.toISOString()),
        
        supabase.from('appointments').select('id').eq('user_id', user.id).gte('created_at', currentMonthStart.toISOString()),
        supabase.from('appointments').select('id').eq('user_id', user.id).gte('created_at', lastMonthStart.toISOString()).lte('created_at', lastMonthEnd.toISOString())
      ]);

      console.log('📊 Dados dos pagamentos para relatórios:', paymentsResult.data);
      console.log('💰 Dados dos fechamentos de caixa para relatórios:', cashClosuresResult.data);

      if (paymentsResult.error) {
        console.error('❌ Erro ao buscar pagamentos:', paymentsResult.error);
      }
      if (cashClosuresResult.error) {
        console.error('❌ Erro ao buscar fechamentos:', cashClosuresResult.error);
      }

      const totalClients = clientsResult.data?.length || 0;
      
      // Somar paid_amount dos pagamentos com status 'pago'
      const totalRevenueFromPayments = paymentsResult.data?.filter(p => p.status === 'pago').reduce((sum, payment) => {
        const amount = Number(payment.paid_amount) || 0;
        console.log('💰 Somando valor pago:', amount);
        return sum + amount;
      }, 0) || 0;

      // Somar receitas dos fechamentos de caixa
      const totalRevenueFromCashClosures = cashClosuresResult.data?.reduce((sum, closure) => {
        const amount = Number(closure.total_income) || 0;
        console.log('🏦 Somando receita do fechamento:', amount);
        return sum + amount;
      }, 0) || 0;

      // Total de receitas combinando pagamentos e fechamentos
      const totalRevenue = totalRevenueFromPayments + totalRevenueFromCashClosures;
      
      console.log('💵 Receita total calculada para relatórios:', totalRevenue);
      
      const totalAppointments = appointmentsResult.data?.length || 0;
      const totalProducts = productsResult.data?.length || 0;
      const lowStockProducts = productsResult.data?.filter(p => 
        p.min_stock_level && p.stock_quantity <= p.min_stock_level
      ).length || 0;

      // Calcular crescimento incluindo fechamentos de caixa
      const currentMonthRevenueFromPayments = currentMonthPaymentsResult.data?.filter(p => p.status === 'pago').reduce((sum, payment) => sum + Number(payment.paid_amount), 0) || 0;
      const lastMonthRevenueFromPayments = lastMonthPaymentsResult.data?.filter(p => p.status === 'pago').reduce((sum, payment) => sum + Number(payment.paid_amount), 0) || 0;

      const currentMonthRevenueFromCashClosures = currentMonthCashClosuresResult.data?.reduce((sum, closure) => sum + Number(closure.total_income), 0) || 0;
      const lastMonthRevenueFromCashClosures = lastMonthCashClosuresResult.data?.reduce((sum, closure) => sum + Number(closure.total_income), 0) || 0;

      const currentMonthRevenue = currentMonthRevenueFromPayments + currentMonthRevenueFromCashClosures;
      const lastMonthRevenue = lastMonthRevenueFromPayments + lastMonthRevenueFromCashClosures;

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

      console.log('📈 Métricas finais para relatórios:', finalMetrics);
      setMetrics(finalMetrics);

    } catch (err: any) {
      console.error('❌ Erro ao buscar métricas para relatórios:', err);
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
