import { supabase } from '@/integrations/supabase/client';

export interface ReportsMetrics {
  totalClients: number;
  currentMonthClients: number;
  previousMonthClients: number;
  totalRevenue: number;
  currentMonthRevenue: number;
  previousMonthRevenue: number;
  totalAppointments: number;
  currentMonthAppointments: number;
  previousMonthAppointments: number;
  lowStockProducts: number;
  avgCashFlow: number;
  growthRate: number;
}

export async function fetchReportsMetrics(userId: string): Promise<ReportsMetrics> {
  const currentDate = new Date();
  const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  const lastMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

  // Fetch all data in parallel
  const [
    clientsData,
    paymentsData,
    appointmentsData,
    productsData,
    cashClosuresData,
    currentMonthData,
    lastMonthData
  ] = await Promise.all([
    supabase.from('clients').select('id').eq('user_id', userId),
    supabase.from('payments').select('paid_amount, status').eq('user_id', userId),
    supabase.from('appointments').select('id').eq('user_id', userId),
    supabase.from('products').select('id, stock_quantity, min_stock_level').eq('user_id', userId),
    supabase.from('cash_closures').select('total_income').eq('user_id', userId),
    
    Promise.all([
      supabase.from('payments').select('paid_amount, status').eq('user_id', userId).gte('payment_date', currentMonthStart.toISOString()),
      supabase.from('clients').select('id').eq('user_id', userId).gte('created_at', currentMonthStart.toISOString()),
      supabase.from('appointments').select('id').eq('user_id', userId).gte('created_at', currentMonthStart.toISOString())
    ]),

    Promise.all([
      supabase.from('payments').select('paid_amount, status').eq('user_id', userId).gte('payment_date', lastMonthStart.toISOString()).lte('payment_date', lastMonthEnd.toISOString()),
      supabase.from('clients').select('id').eq('user_id', userId).gte('created_at', lastMonthStart.toISOString()).lte('created_at', lastMonthEnd.toISOString()),
      supabase.from('appointments').select('id').eq('user_id', userId).gte('created_at', lastMonthStart.toISOString()).lte('created_at', lastMonthEnd.toISOString())
    ])
  ]);

  // Process the data
  const totalClients = clientsData.data?.length || 0;
  const totalRevenue = paymentsData.data?.filter(p => p.status === 'pago').reduce((sum, p) => sum + Number(p.paid_amount), 0) || 0;
  const totalAppointments = appointmentsData.data?.length || 0;
  const lowStockProducts = productsData.data?.filter(p => p.stock_quantity <= p.min_stock_level).length || 0;
  const avgCashFlow = cashClosuresData.data?.reduce((sum, c) => sum + Number(c.total_income), 0) / (cashClosuresData.data?.length || 1) || 0;

  const currentMonthClients = currentMonthData[1].data?.length || 0;
  const currentMonthRevenue = currentMonthData[0].data?.filter((p: any) => p.status === 'pago').reduce((sum: number, p: any) => sum + Number(p.paid_amount), 0) || 0;
  const currentMonthAppointments = currentMonthData[2].data?.length || 0;

  const previousMonthClients = lastMonthData[1].data?.length || 0;
  const previousMonthRevenue = lastMonthData[0].data?.filter((p: any) => p.status === 'pago').reduce((sum: number, p: any) => sum + Number(p.paid_amount), 0) || 0;
  const previousMonthAppointments = lastMonthData[2].data?.length || 0;

  const growthRate = previousMonthRevenue > 0 ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 : 0;

  return {
    totalClients,
    currentMonthClients,
    previousMonthClients,
    totalRevenue,
    currentMonthRevenue,
    previousMonthRevenue,
    totalAppointments,
    currentMonthAppointments,
    previousMonthAppointments,
    lowStockProducts,
    avgCashFlow,
    growthRate
  };
}