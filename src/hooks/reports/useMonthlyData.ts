
import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface MonthlyData {
  month: string;
  revenue: number;
  appointments: number;
  newClients: number;
}

export const useMonthlyData = () => {
  const { user } = useAuth();
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMonthlyData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      console.log('📅 Buscando dados mensais dos últimos 6 meses para:', user.id);

      // Buscar dados dos últimos 6 meses em paralelo para melhor performance
      const [paymentsResult, cashClosuresResult, clientsResult, appointmentsResult] = await Promise.all([
        // Buscar apenas pagamentos com status 'pago' e usar payment_date para filtro temporal
        supabase
          .from('payments')
          .select('paid_amount, payment_date')
          .eq('user_id', user.id)
          .eq('status', 'pago')
          .gte('payment_date', sixMonthsAgo.toISOString())
          .not('payment_date', 'is', null),
        
        // Buscar fechamentos de caixa
        supabase
          .from('cash_closures')
          .select('total_income, closure_date')
          .eq('user_id', user.id)
          .gte('closure_date', format(sixMonthsAgo, 'yyyy-MM-dd')),
        
        supabase
          .from('clients')
          .select('created_at')
          .eq('user_id', user.id)
          .gte('created_at', sixMonthsAgo.toISOString()),
        
        supabase
          .from('appointments')
          .select('created_at')
          .eq('user_id', user.id)
          .gte('created_at', sixMonthsAgo.toISOString())
      ]);

      console.log('💳 Pagamentos recebidos para dados mensais:', paymentsResult.data);
      console.log('🏦 Fechamentos de caixa para dados mensais:', cashClosuresResult.data);

      const payments = paymentsResult.data || [];
      const cashClosures = cashClosuresResult.data || [];
      const clients = clientsResult.data || [];
      const appointments = appointmentsResult.data || [];

      // Agrupar por mês
      const monthlyDataMap = new Map<string, MonthlyData>();

      // Inicializar últimos 6 meses
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = format(date, 'yyyy-MM');
        const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
        
        monthlyDataMap.set(monthKey, {
          month: monthName,
          revenue: 0,
          appointments: 0,
          newClients: 0
        });
      }

      // Agregar receitas dos pagamentos usando payment_date
      payments.forEach(payment => {
        if (payment.payment_date) {
          // payment_date é timestamptz (UTC); .slice(0,7) pegaria o mês errado
          // pra pagamentos feitos nas últimas horas do dia no fuso do Brasil.
          const monthKey = format(parseISO(payment.payment_date), 'yyyy-MM');
          const existing = monthlyDataMap.get(monthKey);
          if (existing) {
            const amount = Number(payment.paid_amount) || 0;
            existing.revenue += amount;
            console.log(`💰 Adicionando ${amount} ao mês ${monthKey} (pagamento)`);
          }
        }
      });

      // Agregar receitas dos fechamentos de caixa
      cashClosures.forEach(closure => {
        if (closure.closure_date) {
          const monthKey = format(parseISO(closure.closure_date), 'yyyy-MM');
          const existing = monthlyDataMap.get(monthKey);
          if (existing) {
            const amount = Number(closure.total_income) || 0;
            existing.revenue += amount;
            console.log(`🏦 Adicionando ${amount} ao mês ${monthKey} (fechamento)`);
          }
        }
      });

      // Agregar agendamentos
      appointments.forEach(appointment => {
        const monthKey = format(parseISO(appointment.created_at), 'yyyy-MM');
        const existing = monthlyDataMap.get(monthKey);
        if (existing) {
          existing.appointments += 1;
        }
      });

      // Agregar novos clientes
      clients.forEach(client => {
        const monthKey = format(parseISO(client.created_at), 'yyyy-MM');
        const existing = monthlyDataMap.get(monthKey);
        if (existing) {
          existing.newClients += 1;
        }
      });

      const finalData = Array.from(monthlyDataMap.values());
      console.log('📊 Dados mensais finais:', finalData);
      setMonthlyData(finalData);
    } catch (err: any) {
      console.error('❌ Erro ao buscar dados mensais:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyData();
  }, [user]);

  return {
    monthlyData,
    loading,
    refetch: fetchMonthlyData
  };
};
