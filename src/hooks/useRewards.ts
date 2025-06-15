
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  type: 'discount' | 'service' | 'product' | 'experience';
  tier: 'Bronze' | 'Prata' | 'Ouro' | 'Diamante';
  available: boolean;
  popular: boolean;
}

export const useRewards = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Dados padrão de recompensas para demonstração
  const defaultRewards: Reward[] = [
    {
      id: '1',
      title: 'Desconto 10%',
      description: 'Em qualquer serviço',
      pointsCost: 100,
      type: 'discount',
      tier: 'Bronze',
      available: true,
      popular: true
    },
    {
      id: '2',
      title: 'Limpeza de Pele Grátis',
      description: 'Serviço completo',
      pointsCost: 250,
      type: 'service',
      tier: 'Prata',
      available: true,
      popular: false
    },
    {
      id: '3',
      title: 'Kit Cuidados Premium',
      description: 'Produtos exclusivos',
      pointsCost: 400,
      type: 'product',
      tier: 'Ouro',
      available: true,
      popular: true
    },
    {
      id: '4',
      title: 'Day Spa Completo',
      description: 'Experiência exclusiva VIP',
      pointsCost: 800,
      type: 'experience',
      tier: 'Diamante',
      available: false,
      popular: false
    }
  ];

  const fetchRewards = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Por enquanto, vamos usar os dados padrão
      // Quando implementarmos a tabela de rewards no futuro, podemos substituir por:
      // const { data, error } = await supabase
      //   .from('rewards')
      //   .select('*')
      //   .eq('user_id', user.id);
      
      setRewards(defaultRewards);
    } catch (error) {
      console.error('Erro ao buscar recompensas:', error);
      setRewards(defaultRewards);
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
