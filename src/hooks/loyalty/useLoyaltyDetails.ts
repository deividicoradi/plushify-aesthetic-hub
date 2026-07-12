import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type LoyaltyMetric = 'vip' | 'challenges' | 'redemptions' | 'points';

const sb: any = supabase;

export function useLoyaltyDetails(metric: LoyaltyMetric | null, open: boolean) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [clientsMap, setClientsMap] = useState<Record<string, string>>({});
  const [rewardsMap, setRewardsMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open || !metric || !user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        if (metric === 'vip') {
          const [clients, payments] = await Promise.all([
            sb.from('clients').select('id,name,email,phone,status,last_visit,created_at').eq('user_id', user.id),
            sb.from('payments').select('client_id,amount,status,payment_date,created_at').eq('user_id', user.id).eq('status', 'pago'),
          ]);
          const settings = await sb.from('loyalty_settings').select('points_per_currency').eq('user_id', user.id).maybeSingle();
          const ppc = settings.data?.points_per_currency ?? 1;
          const byClient: Record<string, { spent: number; count: number; last: string | null }> = {};
          for (const p of payments.data ?? []) {
            if (!p.client_id) continue;
            const b = (byClient[p.client_id] ??= { spent: 0, count: 0, last: null });
            b.spent += Number(p.amount) || 0;
            b.count += 1;
            const d = p.payment_date || p.created_at;
            if (!b.last || (d && d > b.last)) b.last = d;
          }
          const tiers = await sb.from('loyalty_tiers').select('name,min_spent').eq('user_id', user.id).order('min_spent', { ascending: false });
          const tierList = tiers.data ?? [];
          const list = (clients.data ?? [])
            .filter((c: any) => (c.status ?? 'Ativo') === 'Ativo')
            .map((c: any) => {
              const b = byClient[c.id] || { spent: 0, count: 0, last: c.last_visit };
              const tier = tierList.find((t: any) => b.spent >= Number(t.min_spent))?.name ?? 'Bronze';
              return {
                id: c.id, name: c.name, email: c.email, phone: c.phone,
                tier, points: Math.floor(b.spent * ppc), spent: b.spent,
                appointments: b.count, last: b.last,
              };
            })
            .sort((a: any, b: any) => b.spent - a.spent);
          if (!cancelled) setRows(list);
        } else if (metric === 'challenges') {
          const { data } = await sb.from('loyalty_challenges').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
          if (!cancelled) setRows(data ?? []);
        } else if (metric === 'redemptions') {
          const [red, cl, rw] = await Promise.all([
            sb.from('loyalty_reward_redemptions').select('*').eq('user_id', user.id).order('redeemed_at', { ascending: false }),
            sb.from('clients').select('id,name').eq('user_id', user.id),
            sb.from('loyalty_rewards').select('id,title').eq('user_id', user.id),
          ]);
          if (!cancelled) {
            setRows(red.data ?? []);
            setClientsMap(Object.fromEntries((cl.data ?? []).map((c: any) => [c.id, c.name])));
            setRewardsMap(Object.fromEntries((rw.data ?? []).map((r: any) => [r.id, r.title])));
          }
        } else if (metric === 'points') {
          const [tx, cl] = await Promise.all([
            sb.from('loyalty_point_transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(2000),
            sb.from('clients').select('id,name').eq('user_id', user.id),
          ]);
          if (!cancelled) {
            setRows(tx.data ?? []);
            setClientsMap(Object.fromEntries((cl.data ?? []).map((c: any) => [c.id, c.name])));
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [metric, open, user]);

  return { loading, rows, clientsMap, rewardsMap };
}