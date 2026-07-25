import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface Referral {
  id: string;
  referred_email: string | null;
  status: 'pending' | 'rewarded';
  created_at: string;
  rewarded_at: string | null;
}

export const useReferrals = () => {
  const { user } = useAuth();
  const [code, setCode] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [{ data: codeData, error: codeError }, { data: referralsData, error: referralsError }] = await Promise.all([
        supabase.rpc('get_or_create_referral_code'),
        supabase
          .from('referrals')
          .select('id, referred_email, status, created_at, rewarded_at')
          .order('created_at', { ascending: false }),
      ]);

      if (codeError) throw codeError;
      if (referralsError) throw referralsError;

      setCode(codeData as string);
      setReferrals((referralsData || []) as Referral[]);
    } catch (error) {
      console.error('Erro ao carregar dados de indicação:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const referralLink = code ? `${window.location.origin}/?ref=${code}` : '';
  const rewardedCount = referrals.filter((r) => r.status === 'rewarded').length;
  const pendingCount = referrals.filter((r) => r.status === 'pending').length;

  return {
    code,
    referralLink,
    referrals,
    rewardedCount,
    pendingCount,
    loading,
    refetch: fetchAll,
  };
};
