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

export const useAnalyticsChartData = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pipelineByAmountData, setPipelineByAmountData] = useState<PipelineData[]>([]);
  const [pipelineByCountData, setPipelineByCountData] = useState<PipelineData[]>([]);
  const [quarterlyData, setQuarterlyData] = useState<QuarterlyData[]>([]);
  const [monthlyRevenueData, setMonthlyRevenueData] = useState<MonthlyData[]>([]);

  const serviceColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#ffb347', '#87ceeb', '#dda0dd'];

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
        
        for (let i = 12; i >= 0; i--) {
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

        setPipelineByAmountData(pipelineAmount);
        setPipelineByCountData(pipelineCount);
        setQuarterlyData(quarterlyRevenue);
        setMonthlyRevenueData(monthlyRevenue);

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
    loading
  };
};