import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
  const queryKey = ['referrals', user?.id];

  const { data, isLoading } = useQuery({
    queryKey,
    enabled: !!user?.id,
    staleTime: 60_000,
    queryFn: async () => {
      const [{ data: codeData, error: codeError }, { data: referralsData, error: referralsError }] = await Promise.all([
        supabase.rpc('get_or_create_referral_code'),
        supabase
          .from('referrals')
          .select('id, referred_email, status, created_at, rewarded_at')
          .order('created_at', { ascending: false }),
      ]);

      if (codeError) throw codeError;
      if (referralsError) throw referralsError;

      return {
        code: codeData as string,
        referrals: (referralsData || []) as Referral[],
      };
    },
  });

  const code = data?.code ?? null;
  const referrals = data?.referrals ?? [];
  const referralLink = code ? `${window.location.origin}/?ref=${code}` : '';
  const rewardedCount = referrals.filter((r) => r.status === 'rewarded').length;
  const pendingCount = referrals.filter((r) => r.status === 'pending').length;

  return {
    code,
    referralLink,
    referrals,
    rewardedCount,
    pendingCount,
    loading: isLoading,
    refetch: () => queryClient.invalidateQueries({ queryKey }),
  };
};
