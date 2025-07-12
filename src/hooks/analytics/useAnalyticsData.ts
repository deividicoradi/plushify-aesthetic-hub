import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PipelineData {
  name: string;
  value: number;
  fill: string;
}

interface QuarterlyData {
  quarter: string;
  revenue: number;
}

interface MonthlyData {
  month: string;
  revenue: number;
}

interface PaymentMethodData {
  method: string;
  amount: number;
  count: number;
  fill: string;
}

interface AppointmentStatusData {
  status: string;
  count: number;
  percentage: number;
}

interface ClientGrowthData {
  month: string;
  newClients: number;
  totalClients: number;
}

interface WeeklyPatternData {
  dayOfWeek: string;
  appointments: number;
  revenue: number;
}

interface RevenueVsExpensesData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface ServicePerformanceData {
  serviceName: string;
  count: number;
  revenue: number;
  avgPrice: number;
}

export const useAnalyticsChartData = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pipelineByAmountData, setPipelineByAmountData] = useState<PipelineData[]>([]);
  const [pipelineByCountData, setPipelineByCountData] = useState<PipelineData[]>([]);
  const [quarterlyData, setQuarterlyData] = useState<QuarterlyData[]>([]);
  const [monthlyRevenueData, setMonthlyRevenueData] = useState<MonthlyData[]>([]);
  const [paymentMethodData, setPaymentMethodData] = useState<PaymentMethodData[]>([]);
  const [appointmentStatusData, setAppointmentStatusData] = useState<AppointmentStatusData[]>([]);
  const [clientGrowthData, setClientGrowthData] = useState<ClientGrowthData[]>([]);
  const [weeklyPatternData, setWeeklyPatternData] = useState<WeeklyPatternData[]>([]);
  const [revenueVsExpensesData, setRevenueVsExpensesData] = useState<RevenueVsExpensesData[]>([]);
  const [servicePerformanceData, setServicePerformanceData] = useState<ServicePerformanceData[]>([]);

  const serviceColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#ffb347', '#87ceeb', '#dda0dd'];
  const paymentMethodColors = {
    'Dinheiro': '#10b981',
    'Cartão': '#3b82f6', 
    'PIX': '#8b5cf6',
    'Outros': '#6b7280'
  };

  useEffect(() => {
    if (!user) return;
    
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);

        // Buscar dados de pipeline por valor (receita por serviço)
        const { data: revenueByService, error: revenueError } = await supabase
          .from('appointments')
          .select('service_name, price')
          .eq('user_id', user.id)
          .eq('status', 'concluido');

        if (revenueError) throw revenueError;

        // Agrupar receita por serviço
        const revenueMap = new Map<string, number>();
        revenueByService?.forEach(appointment => {
          const serviceName = appointment.service_name || 'Outros';
          const currentAmount = revenueMap.get(serviceName) || 0;
          revenueMap.set(serviceName, currentAmount + (appointment.price || 0));
        });

        const pipelineAmount = Array.from(revenueMap.entries()).map(([name, value], index) => ({
          name,
          value: Number(value),
          fill: serviceColors[index % serviceColors.length]
        }));

        // Buscar dados de pipeline por quantidade (agendamentos por serviço)
        const { data: countByService, error: countError } = await supabase
          .from('appointments')
          .select('service_name')
          .eq('user_id', user.id);

        if (countError) throw countError;

        // Agrupar contagem por serviço
        const countMap = new Map<string, number>();
        countByService?.forEach(appointment => {
          const serviceName = appointment.service_name || 'Outros';
          const currentCount = countMap.get(serviceName) || 0;
          countMap.set(serviceName, currentCount + 1);
        });

        const pipelineCount = Array.from(countMap.entries()).map(([name, value], index) => ({
          name,
          value,
          fill: serviceColors[index % serviceColors.length]
        }));

        // Buscar dados trimestrais dos últimos 4 trimestres
        const currentDate = new Date();
        const quarterlyRevenue: QuarterlyData[] = [];
        
        for (let i = 3; i >= 0; i--) {
          const quarterDate = new Date(currentDate);
          quarterDate.setMonth(quarterDate.getMonth() - (i * 3));
          const startQuarter = new Date(quarterDate.getFullYear(), Math.floor(quarterDate.getMonth() / 3) * 3, 1);
          const endQuarter = new Date(startQuarter.getFullYear(), startQuarter.getMonth() + 3, 0);
          
          const { data: quarterData, error: quarterError } = await supabase
            .from('payments')
            .select('amount')
            .eq('user_id', user.id)
            .eq('status', 'pago')
            .gte('payment_date', startQuarter.toISOString())
            .lte('payment_date', endQuarter.toISOString());

          if (quarterError) throw quarterError;

          const totalRevenue = quarterData?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
          const quarterName = `Q${Math.floor(startQuarter.getMonth() / 3) + 1} ${startQuarter.getFullYear()}`;
          
          quarterlyRevenue.push({
            quarter: quarterName,
            revenue: Number(totalRevenue)
          });
        }

        // Buscar dados mensais dos últimos 13 meses
        const monthlyRevenue: MonthlyData[] = [];
        
        for (let i = 11; i >= 0; i--) {
          const monthDate = new Date(currentDate);
          monthDate.setMonth(monthDate.getMonth() - i);
          const startMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
          const endMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
          
          const { data: monthData, error: monthError } = await supabase
            .from('payments')
            .select('amount')
            .eq('user_id', user.id)
            .eq('status', 'pago')
            .gte('payment_date', startMonth.toISOString())
            .lte('payment_date', endMonth.toISOString());

          if (monthError) throw monthError;

          const totalRevenue = monthData?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
          const monthName = startMonth.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
          
          monthlyRevenue.push({
            month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
            revenue: Number(totalRevenue)
          });
        }

        setQuarterlyData(quarterlyRevenue);
        setMonthlyRevenueData(monthlyRevenue);

        // Buscar dados de métodos de pagamento
        const { data: paymentMethods, error: paymentMethodError } = await supabase
          .from('payments')
          .select('amount, payment_method_id, payment_methods(name, type)')
          .eq('user_id', user.id)
          .eq('status', 'pago');

        if (paymentMethodError) throw paymentMethodError;

        const methodMap = new Map<string, { amount: number; count: number }>();
        paymentMethods?.forEach(payment => {
          const methodName = payment.payment_methods?.name || 'Outros';
          const current = methodMap.get(methodName) || { amount: 0, count: 0 };
          methodMap.set(methodName, {
            amount: current.amount + (payment.amount || 0),
            count: current.count + 1
          });
        });

        const paymentMethodsData = Array.from(methodMap.entries()).map(([method, data]) => ({
          method,
          amount: Number(data.amount),
          count: data.count,
          fill: paymentMethodColors[method as keyof typeof paymentMethodColors] || '#6b7280'
        }));

        // Buscar dados de status de agendamentos
        const { data: appointmentStatus, error: statusError } = await supabase
          .from('appointments')
          .select('status')
          .eq('user_id', user.id);

        if (statusError) throw statusError;

        const statusMap = new Map<string, number>();
        appointmentStatus?.forEach(appointment => {
          const status = appointment.status || 'Outros';
          statusMap.set(status, (statusMap.get(status) || 0) + 1);
        });

        const totalAppointments = appointmentStatus?.length || 1;
        const appointmentStatusData = Array.from(statusMap.entries()).map(([status, count]) => ({
          status: status.charAt(0).toUpperCase() + status.slice(1),
          count,
          percentage: (count / totalAppointments) * 100
        }));

        // Buscar crescimento de clientes (últimos 12 meses)
        const clientGrowthData: ClientGrowthData[] = [];
        for (let i = 11; i >= 0; i--) {
          const monthDate = new Date(currentDate);
          monthDate.setMonth(monthDate.getMonth() - i);
          const startMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
          const endMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
          
          const { data: newClients, error: newClientsError } = await supabase
            .from('clients')
            .select('id')
            .eq('user_id', user.id)
            .gte('created_at', startMonth.toISOString())
            .lte('created_at', endMonth.toISOString());

          const { data: totalClients, error: totalClientsError } = await supabase
            .from('clients')
            .select('id')
            .eq('user_id', user.id)
            .lte('created_at', endMonth.toISOString());

          if (newClientsError || totalClientsError) continue;

          const monthName = startMonth.toLocaleDateString('pt-BR', { month: 'short' });
          clientGrowthData.push({
            month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
            newClients: newClients?.length || 0,
            totalClients: totalClients?.length || 0
          });
        }

        // Buscar padrão semanal
        const { data: weeklyAppointments, error: weeklyError } = await supabase
          .from('appointments')
          .select('appointment_date, price')
          .eq('user_id', user.id)
          .eq('status', 'concluido');

        if (weeklyError) throw weeklyError;

        const weeklyMap = new Map<number, { appointments: number; revenue: number }>();
        weeklyAppointments?.forEach(appointment => {
          const dayOfWeek = new Date(appointment.appointment_date).getDay();
          const current = weeklyMap.get(dayOfWeek) || { appointments: 0, revenue: 0 };
          weeklyMap.set(dayOfWeek, {
            appointments: current.appointments + 1,
            revenue: current.revenue + (appointment.price || 0)
          });
        });

        const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        const weeklyPatternData = Array.from({ length: 7 }, (_, i) => {
          const data = weeklyMap.get(i) || { appointments: 0, revenue: 0 };
          return {
            dayOfWeek: dayNames[i],
            appointments: data.appointments,
            revenue: Number(data.revenue)
          };
        });

        // Buscar receita vs despesas (últimos 12 meses)
        const revenueVsExpensesData: RevenueVsExpensesData[] = [];
        for (let i = 11; i >= 0; i--) {
          const monthDate = new Date(currentDate);
          monthDate.setMonth(monthDate.getMonth() - i);
          const startMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
          const endMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
          
          const [revenueResult, expensesResult] = await Promise.all([
            supabase
              .from('payments')
              .select('amount')
              .eq('user_id', user.id)
              .eq('status', 'pago')
              .gte('payment_date', startMonth.toISOString())
              .lte('payment_date', endMonth.toISOString()),
            supabase
              .from('expenses')
              .select('amount')
              .eq('user_id', user.id)
              .gte('expense_date', startMonth.toISOString())
              .lte('expense_date', endMonth.toISOString())
          ]);

          const revenue = revenueResult.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
          const expenses = expensesResult.data?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
          
          const monthName = startMonth.toLocaleDateString('pt-BR', { month: 'short' });
          revenueVsExpensesData.push({
            month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
            revenue: Number(revenue),
            expenses: Number(expenses),
            profit: Number(revenue - expenses)
          });
        }

        // Buscar performance dos serviços
        const servicePerformanceMap = new Map<string, { count: number; revenue: number }>();
        revenueByService?.forEach(appointment => {
          const serviceName = appointment.service_name || 'Outros';
          const current = servicePerformanceMap.get(serviceName) || { count: 0, revenue: 0 };
          servicePerformanceMap.set(serviceName, {
            count: current.count + 1,
            revenue: current.revenue + (appointment.price || 0)
          });
        });

        const servicePerformanceData = Array.from(servicePerformanceMap.entries()).map(([serviceName, data]) => ({
          serviceName,
          count: data.count,
          revenue: Number(data.revenue),
          avgPrice: data.count > 0 ? Number(data.revenue / data.count) : 0
        })).sort((a, b) => b.revenue - a.revenue);

        setPipelineByAmountData(pipelineAmount);
        setPipelineByCountData(pipelineCount);
        setPaymentMethodData(paymentMethodsData);
        setAppointmentStatusData(appointmentStatusData);
        setClientGrowthData(clientGrowthData);
        setWeeklyPatternData(weeklyPatternData);
        setRevenueVsExpensesData(revenueVsExpensesData);
        setServicePerformanceData(servicePerformanceData);

      } catch (error) {
        console.error('Erro ao buscar dados de analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [user]);

  return {
    pipelineByAmountData,
    pipelineByCountData,
    quarterlyData,
    monthlyRevenueData,
    paymentMethodData,
    appointmentStatusData,
    clientGrowthData,
    weeklyPatternData,
    revenueVsExpensesData,
    servicePerformanceData,
    loading
  };
};