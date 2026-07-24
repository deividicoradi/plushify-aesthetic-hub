
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const sb: any = supabase;

export interface LoyaltyTierInfo {
  id: string;
  name: string;
  min_spent: number;
}

export interface LoyaltyClient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  totalPoints: number;
  totalSpent: number;
  appointmentsCount: number;
  lastVisit?: string;
  tier: string;
}

export interface LoyaltyStats {
  totalClients: number;
  totalAppointments: number;
  totalRevenue: number;
  averageTicket: number;
  pointsDistributed: number;
}

export const useLoyalty = () => {
  const [clients, setClients] = useState<LoyaltyClient[]>([]);
  const [tiers, setTiers] = useState<LoyaltyTierInfo[]>([]);
  const [stats, setStats] = useState<LoyaltyStats>({
    totalClients: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    averageTicket: 0,
    pointsDistributed: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchLoyaltyData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      await sb.rpc('ensure_loyalty_defaults');

      // Buscar todos os clientes
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select(`
          id,
          name,
          email,
          phone,
          last_visit
        `)
        .eq('user_id', user.id);

      if (clientsError) throw clientsError;

      // Buscar pagamentos pagos para calcular gastos dos clientes
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select(`
          id,
          client_id,
          amount,
          status
        `)
        .eq('user_id', user.id)
        .eq('status', 'pago');

      if (paymentsError) throw paymentsError;

      // Buscar configuração real do programa (pontos por real gasto e níveis)
      const [settingsResult, tiersResult] = await Promise.all([
        sb.from('loyalty_settings').select('points_per_currency').eq('user_id', user.id).maybeSingle(),
        sb.from('loyalty_tiers').select('id, name, min_spent').eq('user_id', user.id).order('min_spent', { ascending: false }),
      ]);

      const pointsPerCurrency = settingsResult.data?.points_per_currency ?? 1;
      const tierList: LoyaltyTierInfo[] = tiersResult.data ?? [];

      const calculateTier = (totalSpent: number): string =>
        tierList.find(t => totalSpent >= Number(t.min_spent))?.name ?? 'Bronze';

      // Processar dados de fidelidade baseado em pagamentos
      const loyaltyClients: LoyaltyClient[] = clientsData?.map(client => {
        const clientPayments = paymentsData?.filter(payment => payment.client_id === client.id) || [];
        const totalSpent = clientPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
        const totalPoints = Math.floor(totalSpent * pointsPerCurrency);
        const appointmentsCount = clientPayments.length; // Usando pagamentos como proxy para agendamentos
        const tier = calculateTier(totalSpent);

        return {
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          totalPoints,
          totalSpent,
          appointmentsCount,
          lastVisit: client.last_visit,
          tier
        };
      }) || [];

      // Ordenar por pontos (maior para menor)
      loyaltyClients.sort((a, b) => b.totalPoints - a.totalPoints);

      // Calcular estatísticas
      const totalRevenue = paymentsData?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
      const totalAppointments = paymentsData?.length || 0;
      const pointsDistributed = loyaltyClients.reduce((sum, client) => sum + client.totalPoints, 0);

      const statsData: LoyaltyStats = {
        totalClients: clientsData?.length || 0,
        totalAppointments,
        totalRevenue,
        averageTicket: totalAppointments > 0 ? totalRevenue / totalAppointments : 0,
        pointsDistributed
      };

      setClients(loyaltyClients);
      setTiers(tierList);
      setStats(statsData);
    } catch (error: any) {
      console.error('Erro ao buscar dados de fidelidade:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoyaltyData();
  }, [user]);

  return {
    clients,
    tiers,
    stats,
    loading,
    refetch: fetchLoyaltyData
  };
};
