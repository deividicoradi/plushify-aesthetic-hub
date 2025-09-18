import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  totalClients: number;
  activeClients: number;
  newThisMonth: number;
  totalAppointments: number;
  weeklyAppointments: number;
  monthlyRevenue: number;
}

export interface ChartData {
  day: string;
  agendamentos: number;
  faturamento: number;
  clientes: number;
}

export async function fetchDashboardStats(userId: string): Promise<DashboardStats> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date();
  const dayOfWeek = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - dayOfWeek;
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const [
    clientsData,
    appointmentsData,
    paymentsData,
    newClientsData,
    weeklyAppointmentsData
  ] = await Promise.all([
    supabase
      .from('clients')
      .select('status')
      .eq('user_id', userId),
    
    supabase
      .from('appointments')
      .select('appointment_date')
      .eq('user_id', userId),
      
    supabase
      .from('payments')
      .select('amount, payment_date')
      .eq('user_id', userId)
      .eq('status', 'pago')
      .gte('payment_date', startOfMonth.toISOString()),
      
    supabase
      .from('clients')
      .select('created_at')
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString()),
      
    supabase
      .from('appointments')
      .select('appointment_date')
      .eq('user_id', userId)
      .gte('appointment_date', startOfWeek.toISOString().split('T')[0])
  ]);

  if (clientsData.error) throw clientsData.error;
  if (appointmentsData.error) throw appointmentsData.error;
  if (paymentsData.error) throw paymentsData.error;
  if (newClientsData.error) throw newClientsData.error;
  if (weeklyAppointmentsData.error) throw weeklyAppointmentsData.error;

  const totalClients = clientsData.data?.length || 0;
  const activeClients = clientsData.data?.filter(c => c.status === 'Ativo').length || 0;
  const newThisMonth = newClientsData.data?.length || 0;
  const totalAppointments = appointmentsData.data?.length || 0;
  const weeklyAppointments = weeklyAppointmentsData.data?.length || 0;
  const monthlyRevenue = paymentsData.data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

  return {
    totalClients,
    activeClients,
    newThisMonth,
    totalAppointments,
    weeklyAppointments,
    monthlyRevenue
  };
}

export async function fetchChartData(userId: string): Promise<ChartData[]> {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - 6);
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(today);
  endOfWeek.setHours(23, 59, 59, 999);

  const [appointmentsResult, paymentsResult, clientsResult] = await Promise.all([
    supabase
      .from('appointments')
      .select('appointment_date')
      .eq('user_id', userId)
      .gte('appointment_date', startOfWeek.toISOString().split('T')[0])
      .lte('appointment_date', endOfWeek.toISOString().split('T')[0]),
    
    supabase
      .from('payments')
      .select('amount, payment_date')
      .eq('user_id', userId)
      .eq('status', 'pago')
      .gte('payment_date', startOfWeek.toISOString())
      .lte('payment_date', endOfWeek.toISOString()),
      
    supabase
      .from('clients')
      .select('created_at')
      .eq('user_id', userId)
      .gte('created_at', startOfWeek.toISOString())
      .lte('created_at', endOfWeek.toISOString())
  ]);

  if (appointmentsResult.error) throw appointmentsResult.error;
  if (paymentsResult.error) throw paymentsResult.error;
  if (clientsResult.error) throw clientsResult.error;

  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const chartData: ChartData[] = [];

  for (let i = 0; i < 7; i++) {
    const currentDay = new Date(startOfWeek);
    currentDay.setDate(startOfWeek.getDate() + i);
    const dayString = currentDay.toISOString().split('T')[0];

    const agendamentos = appointmentsResult.data?.filter(a => 
      a.appointment_date === dayString
    ).length || 0;

    const faturamento = paymentsResult.data?.filter(p => {
      const paymentDate = new Date(p.payment_date);
      return paymentDate.toISOString().split('T')[0] === dayString;
    }).reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;

    const clientes = clientsResult.data?.filter(c => {
      const clientDate = new Date(c.created_at);
      return clientDate.toISOString().split('T')[0] === dayString;
    }).length || 0;

    chartData.push({
      day: days[currentDay.getDay()],
      agendamentos,
      faturamento,
      clientes
    });
  }

  return chartData;
}