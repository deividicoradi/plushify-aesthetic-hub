
import { useState, useEffect } from 'react';
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
  created_at: string;
  updated_at: string;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<PlanType>('trial');

  const fetchSubscription = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch the most recent active subscription
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['active', 'trial_active'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar assinatura:', error);
        setCurrentPlan('trial');
        setLoading(false);
        return;
      }

      if (data) {
        setSubscription(data);
        setCurrentPlan(data.plan_type);
      } else {
        // No active subscription found, default to trial
        setCurrentPlan('trial');
        if (import.meta.env.DEV) console.log('Nenhuma assinatura encontrada, usando trial');
      }
    } catch (error) {
      console.error('Erro ao buscar assinatura:', error);
      setCurrentPlan('trial');
    } finally {
      setLoading(false);
    }
  };

  // Trial creation is server-only (edge function `start-trial` → `start_subscription` RPC).
  // Direct client INSERT on user_subscriptions is blocked by RLS to prevent plan escalation.

  // Após retorno do checkout AbacatePay, apenas re-lê a tabela user_subscriptions
  // (que é atualizada pelo webhook da AbacatePay). Não consulta gateway externo.
  const checkSubscriptionStatus = async (): Promise<boolean> => {
    if (!user) return false;
    await fetchSubscription();
    return currentPlan !== 'trial';
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

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  return {
    subscription,
    currentPlan,
    loading,
    hasFeatureAccess,
    checkSubscriptionStatus,
    refetch: fetchSubscription
  };
};
