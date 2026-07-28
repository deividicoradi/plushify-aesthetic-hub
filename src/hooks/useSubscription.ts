
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type PlanType = 'trial' | 'professional' | 'premium' | 'enterprise';

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_type: PlanType;
  status: string;
  started_at: string;
  expires_at?: string;
  trial_ends_at?: string;
  cancel_at_period_end?: boolean;
  payment_kind?: string | null;
  abacate_subscription_id?: string | null;
  abacate_customer_id?: string | null;
  abacate_checkout_id?: string | null;
  billing_interval?: 'month' | 'year' | null;
  created_at: string;
  updated_at: string;
}

interface SubscriptionQueryResult {
  subscription: UserSubscription | null;
  currentPlan: PlanType;
}

// React Query, com cache compartilhado por user.id — cada tela (Sidebar,
// FeatureGuard, GlobalHeader, ProtectedRoute...) chamava este hook direto
// com useState local, então cada uma tinha sua própria cópia começando em
// currentPlan='trial'/loading=true e refazia a consulta do zero a cada
// navegação. Numa conta Professional/Premium isso piscava um "Trial" (cadeado
// premium na Sidebar, mensagens de upgrade) por 1-2s em toda tela nova até a
// consulta responder. Com cache compartilhado, só a primeira tela da sessão
// paga esse custo; as demais reaproveitam o resultado já carregado.
const computeEffectivePlan = (data: UserSubscription): PlanType => {
  // Mesma lógica de public.get_user_plan() no banco: trial_ends_at ou
  // expires_at vencidos rebaixam o plano efetivo pra 'trial' mesmo com
  // a linha ainda status='active' (nada re-escreve plan_type no banco
  // quando vence — o rebaixamento é só de leitura, em todo lugar que
  // decide o plano). Antes disso, currentPlan usava plan_type cru e
  // ignorava as duas datas: uma assinatura paga vencida continuava
  // liberada no app indefinidamente.
  const now = new Date();
  const trialActive = !!data.trial_ends_at && new Date(data.trial_ends_at) > now;
  const notExpired = !data.expires_at || new Date(data.expires_at) > now;
  return trialActive ? 'trial' : (notExpired ? data.plan_type : 'trial');
};

export const useSubscription = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['subscription', user?.id];

  const { data, isLoading } = useQuery({
    queryKey,
    enabled: !!user,
    staleTime: 60_000,
    queryFn: async (): Promise<SubscriptionQueryResult> => {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user!.id)
        .in('status', ['active', 'trial_active'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar assinatura:', error);
        return { subscription: null, currentPlan: 'trial' };
      }

      if (!data) {
        if (import.meta.env.DEV) console.log('Nenhuma assinatura encontrada, usando trial');
        return { subscription: null, currentPlan: 'trial' };
      }

      return { subscription: data, currentPlan: computeEffectivePlan(data) };
    },
  });

  const subscription = data?.subscription ?? null;
  const currentPlan = data?.currentPlan ?? 'trial';
  const loading = !!user && isLoading;

  // Trial creation is server-only (edge function `start-trial` → `start_subscription` RPC).
  // Direct client INSERT on user_subscriptions is blocked by RLS to prevent plan escalation.

  // Após retorno do checkout AbacatePay, apenas re-lê a tabela user_subscriptions
  // (que é atualizada pelo webhook da AbacatePay). Não consulta gateway externo.
  const checkSubscriptionStatus = async (): Promise<boolean> => {
    if (!user) return false;
    const result = await queryClient.fetchQuery({ queryKey, staleTime: 0 });
    return (result as SubscriptionQueryResult).currentPlan !== 'trial';
  };

  const hasFeatureAccess = async (featureName: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('has_feature_access', {
        feature_name: featureName
      });

      if (error) {
        console.error('Erro ao verificar acesso:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Erro ao verificar acesso:', error);
      return false;
    }
  };

  const refetch = () => queryClient.invalidateQueries({ queryKey });

  return {
    subscription,
    currentPlan,
    loading,
    hasFeatureAccess,
    checkSubscriptionStatus,
    refetch,
  };
};
