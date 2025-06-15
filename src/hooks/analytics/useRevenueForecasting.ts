
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ForecastData {
  period: string;
  actual_revenue: number;
  predicted_revenue: number;
  confidence_interval: {
    lower: number;
    upper: number;
  };
  trend: 'up' | 'down' | 'stable';
}

export const useRevenueForecasting = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['revenue-forecasting', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Buscar dados históricos dos últimos 12 meses
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('amount, paid_amount, payment_date, status')
        .eq('user_id', user.id)
        .eq('status', 'pago')
        .gte('payment_date', oneYearAgo.toISOString());

      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('price, appointment_date')
        .eq('user_id', user.id)
        .neq('status', 'cancelado')
        .gte('appointment_date', oneYearAgo.toISOString().split('T')[0]);

      if (paymentsError || appointmentsError) {
        throw paymentsError || appointmentsError;
      }

      // Combinar dados de receita
      const allRevenue = [
        ...(payments || []).map(p => ({
          date: p.payment_date,
          amount: Number(p.paid_amount || 0)
        })),
        ...(appointments || []).map(a => ({
          date: a.appointment_date,
          amount: Number(a.price || 0)
        }))
      ];

      // Agrupar por mês
      const monthlyRevenue = allRevenue.reduce((acc, item) => {
        const date = new Date(item.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!acc[monthKey]) {
          acc[monthKey] = 0;
        }
        
        acc[monthKey] += item.amount;
        return acc;
      }, {} as Record<string, number>);

      // Criar array de dados históricos
      const historicalData = Object.entries(monthlyRevenue)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, revenue]) => ({ month, revenue }));

      // Algoritmo simples de previsão (média móvel + tendência)
      const forecastData: ForecastData[] = [];
      
      // Adicionar dados históricos
      historicalData.forEach(({ month, revenue }) => {
        const [year, monthNum] = month.split('-');
        const date = new Date(parseInt(year), parseInt(monthNum) - 1);
        const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
        
        forecastData.push({
          period: monthName,
          actual_revenue: revenue,
          predicted_revenue: revenue,
          confidence_interval: { lower: revenue * 0.9, upper: revenue * 1.1 },
          trend: 'stable'
        });
      });

      // Gerar previsões para os próximos 6 meses
      if (historicalData.length >= 3) {
        const recentRevenues = historicalData.slice(-3).map(d => d.revenue);
        const avgRevenue = recentRevenues.reduce((sum, rev) => sum + rev, 0) / recentRevenues.length;
        
        // Calcular tendência
        const trend = recentRevenues[recentRevenues.length - 1] > recentRevenues[0] ? 'up' : 
                     recentRevenues[recentRevenues.length - 1] < recentRevenues[0] ? 'down' : 'stable';
        
        const trendMultiplier = trend === 'up' ? 1.05 : trend === 'down' ? 0.95 : 1.0;

        for (let i = 1; i <= 6; i++) {
          const futureDate = new Date();
          futureDate.setMonth(futureDate.getMonth() + i);
          const monthName = futureDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
          
          const basePredict = avgRevenue * Math.pow(trendMultiplier, i);
          const variance = basePredict * 0.15; // 15% de variância
          
          forecastData.push({
            period: monthName,
            actual_revenue: 0,
            predicted_revenue: basePredict,
            confidence_interval: {
              lower: basePredict - variance,
              upper: basePredict + variance
            },
            trend
          });
        }
      }

      return forecastData;
    },
    enabled: !!user?.id,
  });
};
