import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface LoyaltySettings {
  id: string;
  user_id: string;
  points_active: boolean;
  points_per_currency: number;
  points_validity_days: number | null;
  vip_criteria: any;
  how_it_works: Array<{ id: string; icon?: string; title: string; description: string; active: boolean }>;
}
export interface LoyaltyTier {
  id: string; user_id: string; name: string; min_spent: number; min_points: number;
  color: string; benefit: string | null; description: string | null; sort_order: number; active: boolean;
}
export interface LoyaltyChallenge {
  id: string; user_id: string; title: string; description: string | null;
  goal_type: string; target_value: number; period_start: string | null; period_end: string | null;
  reward: string | null; difficulty: string; audience: string; status: string; created_at: string;
}
export interface LoyaltyReward {
  id: string; user_id: string; title: string; description: string | null; points_cost: number;
  reward_type: string; tier_name: string | null; validity_days: number | null;
  popular: boolean; available: boolean; active: boolean;
}

const sb: any = supabase;

export function useLoyaltyConfig() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<LoyaltySettings | null>(null);
  const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
  const [challenges, setChallenges] = useState<LoyaltyChallenge[]>([]);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      await sb.rpc('ensure_loyalty_defaults');
      const [s, t, c, r] = await Promise.all([
        sb.from('loyalty_settings').select('*').eq('user_id', user.id).maybeSingle(),
        sb.from('loyalty_tiers').select('*').eq('user_id', user.id).order('sort_order'),
        sb.from('loyalty_challenges').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        sb.from('loyalty_rewards').select('*').eq('user_id', user.id).order('points_cost'),
      ]);
      setSettings(s.data ?? null);
      setTiers(t.data ?? []);
      setChallenges(c.data ?? []);
      setRewards(r.data ?? []);
    } catch (e: any) {
      console.error('loyalty config load', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const saveSettings = async (patch: Partial<LoyaltySettings>) => {
    if (!user) return;
    const { error } = await sb.from('loyalty_settings').update(patch).eq('user_id', user.id);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Configuração salva' });
    load();
  };

  const upsertTier = async (tier: Partial<LoyaltyTier> & { id?: string }) => {
    if (!user) return;
    const payload = { ...tier, user_id: user.id };
    const { error } = tier.id
      ? await sb.from('loyalty_tiers').update(payload).eq('id', tier.id).eq('user_id', user.id)
      : await sb.from('loyalty_tiers').insert(payload);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    load();
  };
  const deleteTier = async (id: string) => {
    const { error } = await sb.from('loyalty_tiers').delete().eq('id', id);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    load();
  };

  const upsertChallenge = async (c: Partial<LoyaltyChallenge> & { id?: string }) => {
    if (!user) return;
    const payload = { ...c, user_id: user.id };
    const { error } = c.id
      ? await sb.from('loyalty_challenges').update(payload).eq('id', c.id).eq('user_id', user.id)
      : await sb.from('loyalty_challenges').insert(payload);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    load();
  };
  const deleteChallenge = async (id: string) => {
    const { error } = await sb.from('loyalty_challenges').delete().eq('id', id);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    load();
  };

  const upsertReward = async (r: Partial<LoyaltyReward> & { id?: string }) => {
    if (!user) return;
    const payload = { ...r, user_id: user.id };
    const { error } = r.id
      ? await sb.from('loyalty_rewards').update(payload).eq('id', r.id).eq('user_id', user.id)
      : await sb.from('loyalty_rewards').insert(payload);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    load();
  };
  const deleteReward = async (id: string) => {
    const { error } = await sb.from('loyalty_rewards').delete().eq('id', id);
    if (error) { toast({ title: 'Erro', description: error.message, variant: 'destructive' }); return; }
    load();
  };

  return {
    settings, tiers, challenges, rewards, loading, refetch: load,
    saveSettings, upsertTier, deleteTier, upsertChallenge, deleteChallenge, upsertReward, deleteReward,
  };
}