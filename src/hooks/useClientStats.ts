
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ClientStats {
  totalClients: number;
  activeClients: number;
  newThisMonth: number;
  loading: boolean;
}

export const useClientStats = () => {
  const [stats, setStats] = useState<ClientStats>({
    totalClients: 0,
    activeClients: 0,
    newThisMonth: 0,
    loading: true
  });
  const { user } = useAuth();

  const fetchClientStats = async () => {
    if (!user) return;

    try {
      setStats(prev => ({ ...prev, loading: true }));

      // Buscar total de clientes
      const { count: totalClients, error: totalError } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (totalError) throw totalError;

      // Buscar clientes ativos
      const { count: activeClients, error: activeError } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'Ativo');

      if (activeError) throw activeError;

      // Buscar novos clientes este mês
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: newThisMonth, error: newError } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString());

      if (newError) throw newError;

      setStats({
        totalClients: totalClients || 0,
        activeClients: activeClients || 0,
        newThisMonth: newThisMonth || 0,
        loading: false
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas de clientes:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchClientStats();
  }, [user]);

  return {
    ...stats,
    refetch: fetchClientStats
  };
};
