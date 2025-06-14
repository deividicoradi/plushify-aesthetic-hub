
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface LoyaltyClient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  totalPoints: number;
  totalSpent: number;
  appointmentsCount: number;
  lastVisit?: string;
  tier: 'Bronze' | 'Prata' | 'Ouro' | 'Diamante';
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
  const [stats, setStats] = useState<LoyaltyStats>({
    totalClients: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    averageTicket: 0,
    pointsDistributed: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const calculateTier = (totalSpent: number): 'Bronze' | 'Prata' | 'Ouro' | 'Diamante' => {
    if (totalSpent >= 2000) return 'Diamante';
    if (totalSpent >= 1000) return 'Ouro';
    if (totalSpent >= 500) return 'Prata';
    return 'Bronze';
  };

  const fetchLoyaltyData = async () => {
    if (!user) return;

    try {
      setLoading(true);

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

      // Processar dados de fidelidade baseado em pagamentos
      const loyaltyClients: LoyaltyClient[] = clientsData?.map(client => {
        const clientPayments = paymentsData?.filter(payment => payment.client_id === client.id) || [];
        const totalSpent = clientPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
        const totalPoints = Math.floor(totalSpent); // 1 ponto por real gasto
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
    stats,
    loading,
    refetch: fetchLoyaltyData
  };
};
