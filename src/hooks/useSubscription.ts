
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
  billing_interval?: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
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
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(); // Use maybeSingle ao invés de single

      if (error) {
        console.error('Erro ao buscar assinatura:', error);
        // Em caso de erro, definir como trial sem tentar criar
        setCurrentPlan('trial');
        setLoading(false);
        return;
      }

      if (data) {
        setSubscription(data);
        setCurrentPlan(data.plan_type);
      } else {
        // Se não encontrar assinatura, apenas definir como trial
        // Não tentar criar automaticamente para evitar erros de RLS
        setCurrentPlan('trial');
        console.log('Nenhuma assinatura encontrada, usando trial');
      }
    } catch (error) {
      console.error('Erro ao buscar assinatura:', error);
      setCurrentPlan('trial');
    } finally {
      setLoading(false);
    }
  };

  const createTrialSubscription = async () => {
    if (!user) return;

    try {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 3);

      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          plan_type: 'trial',
          trial_ends_at: trialEndDate.toISOString(),
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar assinatura trial:', error);
        return;
      }

      setSubscription(data);
      setCurrentPlan('trial');
    } catch (error) {
      console.error('Erro ao criar assinatura trial:', error);
    }
  };

  const checkSubscriptionStatus = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');

      if (error) {
        console.error('Erro ao verificar assinatura:', error);
        return false;
      }

      if (data) {
        setCurrentPlan(data.plan_type);
        // Refetch local subscription data after Stripe check
        await fetchSubscription();
        return data.subscribed || false;
      }

      return false;
    } catch (error) {
      console.error('Erro ao verificar assinatura:', error);
      return false;
    }
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
