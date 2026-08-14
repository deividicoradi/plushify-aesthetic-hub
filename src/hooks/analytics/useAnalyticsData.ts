import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
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

interface OptionalRange {
  startDate?: Date;
  endDate?: Date;
}

const serviceColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#ffb347', '#87ceeb', '#dda0dd'];
const paymentMethodColors: Record<string, string> = {
  'Dinheiro': '#10b981',
  'Cartão': '#3b82f6',
  'PIX': '#8b5cf6',
  'Outros': '#6b7280'
};
const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

// monthKey no fuso local (não toISOString, que pode "voltar" um dia em
// fusos negativos e jogar o registro pro mês/bucket errado).
const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const useAnalyticsChartData = (range?: OptionalRange) => {
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

  const fromISO = range?.startDate?.toISOString();
  const toISO = range?.endDate?.toISOString();
  // format() usa o dia local; toISOString().slice(0,10) usaria o dia em UTC,
  // que pode incluir um dia a mais na borda do período em fusos negativos.
  const fromDate = range?.startDate ? format(range.startDate, 'yyyy-MM-dd') : undefined;
  const toDate = range?.endDate ? format(range.endDate, 'yyyy-MM-dd') : undefined;

  useEffect(() => {
    if (!user) return;

    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);

        const currentDate = new Date();
        const twelveMoStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 11, 1);
        const twelveMoStartISO = twelveMoStart.toISOString();
        const nowISO = currentDate.toISOString();

        // Antes: ~58 requisições sequenciais (uma por mês/trimestre, em
        // loops com await isolado) — cada round-trip soma latência mesmo
        // sem dado nenhum pra processar. Agora: 5 buscas em paralelo,
        // trazendo o período inteiro de uma vez, e agregação em JS.
        let apptFilteredQuery = supabase
          .from('appointments')
          .select('service_name, price, status, appointment_date')
          .eq('user_id', user.id);
        if (fromDate) apptFilteredQuery = apptFilteredQuery.gte('appointment_date', fromDate);
        if (toDate) apptFilteredQuery = apptFilteredQuery.lte('appointment_date', toDate);

        let paymentMethodsQuery = supabase
          .from('payments')
          .select('amount, payment_method_id, payment_methods(name, type)')
          .eq('user_id', user.id)
          .eq('status', 'pago');
        if (fromISO) paymentMethodsQuery = paymentMethodsQuery.gte('payment_date', fromISO);
        if (toISO) paymentMethodsQuery = paymentMethodsQuery.lte('payment_date', toISO);

        const [
          { data: apptFiltered, error: apptError },
          { data: paymentMethods, error: paymentMethodError },
          { data: payments12mo, error: payments12moError },
          { data: expenses12mo, error: expenses12moError },
          { data: allClients, error: clientsError },
        ] = await Promise.all([
          apptFilteredQuery,
          paymentMethodsQuery,
          supabase
            .from('payments')
            .select('amount, payment_date')
            .eq('user_id', user.id)
            .eq('status', 'pago')
            .gte('payment_date', twelveMoStartISO)
            .lte('payment_date', nowISO),
          supabase
            .from('expenses')
            .select('amount, expense_date')
            .eq('user_id', user.id)
            .gte('expense_date', twelveMoStartISO)
            .lte('expense_date', nowISO),
          supabase
            .from('clients')
            .select('id, created_at')
            .eq('user_id', user.id),
        ]);

        if (apptError) throw apptError;
        if (paymentMethodError) throw paymentMethodError;
        if (payments12moError) throw payments12moError;
        if (expenses12moError) throw expenses12moError;
        if (clientsError) throw clientsError;

        // ---- Pipeline por serviço (valor e quantidade) ----
        const revenueMap = new Map<string, number>();
        const countMap = new Map<string, number>();
        const servicePerformanceMap = new Map<string, { count: number; revenue: number }>();
        (apptFiltered || []).forEach((a) => {
          const serviceName = a.service_name || 'Outros';
          countMap.set(serviceName, (countMap.get(serviceName) || 0) + 1);
          if (a.status === 'concluido') {
            revenueMap.set(serviceName, (revenueMap.get(serviceName) || 0) + (a.price || 0));
            const current = servicePerformanceMap.get(serviceName) || { count: 0, revenue: 0 };
            servicePerformanceMap.set(serviceName, {
              count: current.count + 1,
              revenue: current.revenue + (a.price || 0),
            });
          }
        });

        const pipelineAmount = Array.from(revenueMap.entries()).map(([name, value], index) => ({
          name, value: Number(value), fill: serviceColors[index % serviceColors.length],
        }));
        const pipelineCount = Array.from(countMap.entries()).map(([name, value], index) => ({
          name, value, fill: serviceColors[index % serviceColors.length],
        }));
        const servicePerformance = Array.from(servicePerformanceMap.entries())
          .map(([serviceName, data]) => ({
            serviceName,
            count: data.count,
            revenue: Number(data.revenue),
            avgPrice: data.count > 0 ? Number(data.revenue / data.count) : 0,
          }))
          .sort((a, b) => b.revenue - a.revenue);

        // ---- Status de agendamentos ----
        const statusMap = new Map<string, number>();
        (apptFiltered || []).forEach((a) => {
          const status = a.status || 'Outros';
          statusMap.set(status, (statusMap.get(status) || 0) + 1);
        });
        const totalAppointments = apptFiltered?.length || 1;
        const appointmentStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
          status: capitalize(status),
          count,
          percentage: (count / totalAppointments) * 100,
        }));

        // ---- Padrão semanal ----
        const weeklyMap = new Map<number, { appointments: number; revenue: number }>();
        (apptFiltered || []).forEach((a) => {
          if (a.status !== 'concluido') return;
          // parseISO trata "yyyy-MM-dd" como data local; new Date() trataria
          // como UTC e .getDay() sempre retornaria o dia da semana anterior
          // em fusos negativos (ex: Brasil) — não só em casos de borda.
          const dayOfWeek = parseISO(a.appointment_date).getDay();
          const current = weeklyMap.get(dayOfWeek) || { appointments: 0, revenue: 0 };
          weeklyMap.set(dayOfWeek, {
            appointments: current.appointments + 1,
            revenue: current.revenue + (a.price || 0),
          });
        });
        const weeklyPattern = Array.from({ length: 7 }, (_, i) => {
          const data = weeklyMap.get(i) || { appointments: 0, revenue: 0 };
          return { dayOfWeek: dayNames[i], appointments: data.appointments, revenue: Number(data.revenue) };
        });

        // ---- Métodos de pagamento ----
        const methodMap = new Map<string, { amount: number; count: number }>();
        (paymentMethods || []).forEach((payment: any) => {
          const methodName = payment.payment_methods?.name || 'Outros';
          const current = methodMap.get(methodName) || { amount: 0, count: 0 };
          methodMap.set(methodName, {
            amount: current.amount + (payment.amount || 0),
            count: current.count + 1,
          });
        });
        const paymentMethodsAgg = Array.from(methodMap.entries()).map(([method, data]) => ({
          method, amount: Number(data.amount), count: data.count,
          fill: paymentMethodColors[method] || '#6b7280',
        }));

        // ---- Buckets de 12 meses (receita, despesas, trimestre) ----
        const monthBuckets: { key: string; label: string; start: Date; end: Date }[] = [];
        for (let i = 11; i >= 0; i--) {
          const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
          const start = new Date(d.getFullYear(), d.getMonth(), 1);
          const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
          const label = capitalize(start.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }));
          monthBuckets.push({ key: monthKey(start), label, start, end });
        }

        const revenueByMonth = new Map<string, number>();
        (payments12mo || []).forEach((p) => {
          if (!p.payment_date) return;
          const key = monthKey(new Date(p.payment_date));
          revenueByMonth.set(key, (revenueByMonth.get(key) || 0) + (p.amount || 0));
        });

        const expensesByMonth = new Map<string, number>();
        (expenses12mo || []).forEach((e) => {
          if (!e.expense_date) return;
          const key = monthKey(new Date(e.expense_date));
          expensesByMonth.set(key, (expensesByMonth.get(key) || 0) + (e.amount || 0));
        });

        const monthlyRevenue = monthBuckets.map((b) => ({
          month: b.label,
          revenue: Number(revenueByMonth.get(b.key) || 0),
        }));

        const revenueVsExpenses = monthBuckets.map((b) => {
          const revenue = Number(revenueByMonth.get(b.key) || 0);
          const expenses = Number(expensesByMonth.get(b.key) || 0);
          return { month: b.label.slice(0, 3), revenue, expenses, profit: revenue - expenses };
        });

        // Trimestres: agrupa os mesmos buckets mensais de 3 em 3.
        const quarterlyRevenue: QuarterlyData[] = [];
        for (let i = 0; i < 4; i++) {
          const quarterMonths = monthBuckets.slice(i * 3, i * 3 + 3);
          if (quarterMonths.length === 0) continue;
          const start = quarterMonths[0].start;
          const total = quarterMonths.reduce((sum, b) => sum + Number(revenueByMonth.get(b.key) || 0), 0);
          quarterlyRevenue.push({
            quarter: `Q${Math.floor(start.getMonth() / 3) + 1} ${start.getFullYear()}`,
            revenue: total,
          });
        }

        // ---- Crescimento de clientes (novos por mês + total acumulado) ----
        const clientDates = (allClients || [])
          .map((c) => (c.created_at ? new Date(c.created_at) : null))
          .filter((d): d is Date => d !== null);

        const clientGrowth = monthBuckets.map((b) => {
          const newClients = clientDates.filter((d) => d >= b.start && d <= b.end).length;
          const totalClients = clientDates.filter((d) => d <= b.end).length;
          return { month: b.label.slice(0, 3), newClients, totalClients };
        });

        setPipelineByAmountData(pipelineAmount);
        setPipelineByCountData(pipelineCount);
        setQuarterlyData(quarterlyRevenue);
        setMonthlyRevenueData(monthlyRevenue);
        setPaymentMethodData(paymentMethodsAgg);
        setAppointmentStatusData(appointmentStatus);
        setClientGrowthData(clientGrowth);
        setWeeklyPatternData(weeklyPattern);
        setRevenueVsExpensesData(revenueVsExpenses);
        setServicePerformanceData(servicePerformance);

      } catch (error) {
        console.error('Erro ao buscar dados de analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [user, fromISO, toISO, fromDate, toDate]);

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
