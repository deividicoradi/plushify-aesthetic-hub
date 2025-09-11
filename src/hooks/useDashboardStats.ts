
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  totalClients: number;
  activeClients: number;
  newThisMonth: number;
  totalAppointments: number;
  weeklyAppointments: number;
  monthlyRevenue: number;
  loading: boolean;
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activeClients: 0,
    newThisMonth: 0,
    totalAppointments: 0,
    weeklyAppointments: 0,
    monthlyRevenue: 0,
    loading: true
  });
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);

  const fetchDashboardStats = async () => {
    if (!user) return;

    try {
      setStats(prev => ({ ...prev, loading: true }));

      // Buscar estatísticas de clientes
      const { count: totalClients } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: activeClients } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'Ativo');

      // Buscar novos clientes este mês
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: newThisMonth } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString());

      // Buscar agendamentos totais
      const { count: totalAppointments } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Buscar agendamentos desta semana
      const startOfWeek = new Date();
      const dayOfWeek = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - dayOfWeek;
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);

      const { count: weeklyAppointments } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('appointment_date', startOfWeek.toISOString().split('T')[0]);

      // Buscar receita mensal (pagamentos deste mês)
      const { data: monthlyPayments } = await supabase
        .from('payments')
        .select('amount')
        .eq('user_id', user.id)
        .eq('status', 'pago')
        .gte('payment_date', startOfMonth.toISOString());

      const monthlyRevenue = monthlyPayments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;

      setStats({
        totalClients: totalClients || 0,
        activeClients: activeClients || 0,
        newThisMonth: newThisMonth || 0,
        totalAppointments: totalAppointments || 0,
        weeklyAppointments: weeklyAppointments || 0,
        monthlyRevenue,
        loading: false
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas do dashboard:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    if (!user || isSubscribed) return;
    
    setIsSubscribed(true);
    fetchDashboardStats();

    // Debounce para evitar múltiplas atualizações
    let refreshTimeout: NodeJS.Timeout;
    
    const debouncedRefresh = () => {
      clearTimeout(refreshTimeout);
      refreshTimeout = setTimeout(() => {
        fetchDashboardStats();
      }, 3000); // Aguardar 3 segundos antes de atualizar
    };

    // Single channel para todas as mudanças
    const dashboardChannel = supabase
      .channel(`dashboard-stats-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `user_id=eq.${user.id}`
        },
        debouncedRefresh
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients',
          filter: `user_id=eq.${user.id}`
        },
        debouncedRefresh
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
          filter: `user_id=eq.${user.id}`
        },
        debouncedRefresh
      )
      .subscribe();

    return () => {
      clearTimeout(refreshTimeout);
      supabase.removeChannel(dashboardChannel);
      setIsSubscribed(false);
    };
  }, [user, isSubscribed]);

  return {
    ...stats,
    refetch: fetchDashboardStats
  };
};
