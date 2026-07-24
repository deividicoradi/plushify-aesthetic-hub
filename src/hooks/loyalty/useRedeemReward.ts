import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const sb: any = supabase;

export function useRedeemReward() {
  const [redeeming, setRedeeming] = useState(false);

  const redeem = async (clientId: string, rewardId: string): Promise<boolean> => {
    setRedeeming(true);
    try {
      const { error } = await sb.rpc('redeem_loyalty_reward', {
        p_client_id: clientId,
        p_reward_id: rewardId,
      });
      if (error) {
        toast({ title: 'Não foi possível resgatar', description: error.message, variant: 'destructive' });
        return false;
      }
      toast({ title: 'Recompensa resgatada com sucesso' });
      return true;
    } finally {
      setRedeeming(false);
    }
  };

  return { redeem, redeeming };
}
