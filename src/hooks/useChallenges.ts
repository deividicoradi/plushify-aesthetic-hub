
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  reward: string;
  type: 'visits' | 'spending' | 'referral' | 'frequency';
  difficulty: 'easy' | 'medium' | 'hard';
  expiresAt: string;
  completed: boolean;
}

export const useChallenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchChallenges = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Buscar dados reais para calcular progresso dos desafios
      const [paymentsData, clientsData] = await Promise.all([
        supabase
          .from('payments')
          .select('amount, status, created_at')
          .eq('user_id', user.id)
          .eq('status', 'pago'),
        supabase
          .from('clients')
          .select('id')
          .eq('user_id', user.id)
      ]);

      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const paymentsThisMonth = paymentsData.data?.filter(payment => 
        new Date(payment.created_at) >= thisMonth
      ) || [];

      const totalSpentThisMonth = paymentsThisMonth.reduce((sum, payment) => 
        sum + (payment.amount || 0), 0
      );

      const totalClients = clientsData.data?.length || 0;

      // Gerar desafios dinâmicos baseados nos dados reais
      const dynamicChallenges: Challenge[] = [
        {
          id: '1',
          title: 'Cliente Frequente',
          description: 'Realize 5 agendamentos este mês',
          target: 5,
          current: Math.min(paymentsThisMonth.length, 5),
          reward: '50 pontos bônus',
          type: 'visits',
          difficulty: 'easy',
          expiresAt: '2025-01-31',
          completed: paymentsThisMonth.length >= 5
        },
        {
          id: '2',
          title: 'Grande Investidor',
          description: 'Gaste R$ 500 em serviços',
          target: 500,
          current: Math.min(totalSpentThisMonth, 500),
          reward: '100 pontos + desconto 10%',
          type: 'spending',
          difficulty: 'medium',
          expiresAt: '2025-01-31',
          completed: totalSpentThisMonth >= 500
        },
        {
          id: '3',
          title: 'Embaixador VIP',
          description: 'Indique 3 novos clientes',
          target: 3,
          current: Math.min(totalClients, 3),
          reward: '200 pontos + brinde especial',
          type: 'referral',
          difficulty: 'hard',
          expiresAt: '2025-01-31',
          completed: totalClients >= 3
        }
      ];

      setChallenges(dynamicChallenges);
    } catch (error) {
      console.error('Erro ao buscar desafios:', error);
      // Fallback para dados padrão em caso de erro
      setChallenges([
        {
          id: '1',
          title: 'Cliente Frequente',
          description: 'Realize 5 agendamentos este mês',
          target: 5,
          current: 0,
          reward: '50 pontos bônus',
          type: 'visits',
          difficulty: 'easy',
          expiresAt: '2025-01-31',
          completed: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, [user]);

  return {
    challenges,
    loading,
    refetch: fetchChallenges
  };
};
