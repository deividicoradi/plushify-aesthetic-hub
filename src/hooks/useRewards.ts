
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  type: 'discount' | 'service' | 'product' | 'experience';
  tier: string;
  available: boolean;
  popular: boolean;
}

const sb: any = supabase;

export const useRewards = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchRewards = async () => {
    if (!user) return;
    try {
      setLoading(true);
      await sb.rpc('ensure_loyalty_defaults');
      const { data, error } = await sb
        .from('loyalty_rewards')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true)
        .order('points_cost');
      if (error) throw error;
      const mapped: Reward[] = (data ?? []).map((r: any) => ({
        id: r.id,
        title: r.title,
        description: r.description ?? '',
        pointsCost: Number(r.points_cost) || 0,
        type: (['discount', 'service', 'product', 'experience'].includes(r.reward_type) ? r.reward_type : 'discount') as Reward['type'],
        tier: r.tier_name || 'Bronze',
        available: !!r.available,
        popular: !!r.popular,
      }));
      setRewards(mapped);
    } catch (error) {
      console.error('Erro ao buscar recompensas:', error);
      setRewards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, [user]);

  return {
    rewards,
    loading,
    refetch: fetchRewards
  };
};
