
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getDateRange, handleAsyncError } from '@/utils/common';

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

    setLoading(true);
    setError(null);

    const result = await handleAsyncError(async () => {
      const { start: currentMonthStart, end: now } = getDateRange('month');
      const { start: lastMonthStart, end: lastMonthEnd } = getDateRange('month');
      lastMonthEnd.setTime(currentMonthStart.getTime() - 1);

      // Optimized parallel queries
      const [
        clientsResult,
        paymentsResult,
        appointmentsResult,
        productsResult,
        cashClosuresResult,
        currentMonthData,
        lastMonthData
      ] = await Promise.all([
        supabase.from('clients').select('id').eq('user_id', user.id),
        supabase.from('payments').select('paid_amount, status').eq('user_id', user.id),
        supabase.from('appointments').select('id').eq('user_id', user.id),
        supabase.from('products').select('id, stock_quantity, min_stock_level').eq('user_id', user.id),
        supabase.from('cash_closures').select('total_income').eq('user_id', user.id),
        
        // Current month aggregated data
        Promise.all([
          supabase.from('payments').select('paid_amount, status').eq('user_id', user.id).gte('payment_date', currentMonthStart.toISOString()),
          supabase.from('clients').select('id').eq('user_id', user.id).gte('created_at', currentMonthStart.toISOString()),
          supabase.from('appointments').select('id').eq('user_id', user.id).gte('created_at', currentMonthStart.toISOString())
        ]),
        
        // Last month aggregated data
        Promise.all([
          supabase.from('payments').select('paid_amount, status').eq('user_id', user.id).gte('payment_date', lastMonthStart.toISOString()).lte('payment_date', lastMonthEnd.toISOString()),
          supabase.from('clients').select('id').eq('user_id', user.id).gte('created_at', lastMonthStart.toISOString()).lte('created_at', lastMonthEnd.toISOString()),
          supabase.from('appointments').select('id').eq('user_id', user.id).gte('created_at', lastMonthStart.toISOString()).lte('created_at', lastMonthEnd.toISOString())
        ])
      ]);

      // Calculate metrics
      const totalClients = clientsResult.data?.length || 0;
      
      // Calculate total revenue from payments and cash closures separately
      const revenueFromPayments = paymentsResult.data?.filter(p => p.status === 'pago')
        .reduce((sum, payment) => sum + (Number(payment.paid_amount) || 0), 0) || 0;
      
      const revenueFromCashClosures = cashClosuresResult.data
        ?.reduce((sum, closure) => sum + (Number(closure.total_income) || 0), 0) || 0;
      
      const totalRevenue = revenueFromPayments + revenueFromCashClosures;
      
      const totalAppointments = appointmentsResult.data?.length || 0;
      const totalProducts = productsResult.data?.length || 0;
      const lowStockProducts = productsResult.data?.filter(
        p => (p.stock_quantity || 0) <= (p.min_stock_level || 0)
      ).length || 0;

      // Calculate growth rates
      const [currentPayments, currentClients, currentAppointments] = currentMonthData;
      const [lastPayments, lastClients, lastAppointments] = lastMonthData;

      const currentRevenue = currentPayments.data?.filter(p => p.status === 'pago')
        .reduce((sum, p) => sum + (Number(p.paid_amount) || 0), 0) || 0;
      const lastRevenue = lastPayments.data?.filter(p => p.status === 'pago')
        .reduce((sum, p) => sum + (Number(p.paid_amount) || 0), 0) || 0;

      const calculateGrowth = (current: number, previous: number) => 
        previous > 0 ? ((current - previous) / previous) * 100 : 0;

      return {
        totalClients,
        totalRevenue,
        totalAppointments,
        totalProducts,
        lowStockProducts,
        clientsGrowth: calculateGrowth(currentClients.data?.length || 0, lastClients.data?.length || 0),
        revenueGrowth: calculateGrowth(currentRevenue, lastRevenue),
        appointmentsGrowth: calculateGrowth(currentAppointments.data?.length || 0, lastAppointments.data?.length || 0)
      };
    });

    if (result) {
      setMetrics(result);
    } else {
      setError('Erro ao carregar métricas');
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchMetrics();
  }, [user]);

  return { metrics, loading, error, refetch: fetchMetrics };
};
