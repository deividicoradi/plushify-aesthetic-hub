
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

const sb: any = supabase;

export const useChallenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchChallenges = async () => {
    if (!user) return;

    try {
      setLoading(true);
      await sb.rpc('ensure_loyalty_defaults');
      const [configured, paymentsData, clientsData] = await Promise.all([
        sb.from('loyalty_challenges').select('*').eq('user_id', user.id).in('status', ['active']).order('created_at', { ascending: false }),
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

      const progressFor = (goalType: string, target: number) => {
        if (goalType === 'visits') return Math.min(paymentsThisMonth.length, target);
        if (goalType === 'spending') return Math.min(totalSpentThisMonth, target);
        if (goalType === 'referral') return Math.min(totalClients, target);
        return 0;
      };

      const mapped: Challenge[] = (configured.data ?? []).map((c: any) => {
        const target = Number(c.target_value) || 1;
        const current = progressFor(c.goal_type, target);
        return {
          id: c.id,
          title: c.title,
          description: c.description ?? '',
          target,
          current,
          reward: c.reward ?? '',
          type: (['visits', 'spending', 'referral', 'frequency'].includes(c.goal_type) ? c.goal_type : 'visits') as Challenge['type'],
          difficulty: (['easy', 'medium', 'hard'].includes(c.difficulty) ? c.difficulty : 'easy') as Challenge['difficulty'],
          expiresAt: c.period_end ?? new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
          completed: current >= target,
        };
      });

      setChallenges(mapped);
    } catch (error) {
      console.error('Erro ao buscar desafios:', error);
      setChallenges([]);
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
