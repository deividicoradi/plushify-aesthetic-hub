
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/components/ui/sonner";

export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'premium';

export type SubscriptionInfo = {
  isSubscribed: boolean;
  tier: SubscriptionTier;
  expiresAt: Date | null;
  isLoading: boolean;
};

export const useSubscription = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionInfo, setSubscriptionInfo] = useState<{
    isSubscribed: boolean;
    tier: SubscriptionTier;
    expiresAt: Date | null;
  }>({
    isSubscribed: false,
    tier: 'free',
    expiresAt: null,
  });

  const fetchSubscription = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Verificar assinatura no servidor
      const { data, error } = await supabase.functions.invoke('verify-subscription');

      if (error) {
        throw error;
      }

      if (data.subscribed && data.subscription_tier) {
        setSubscriptionInfo({
          isSubscribed: true,
          tier: data.subscription_tier as SubscriptionTier,
          expiresAt: data.subscription_end ? new Date(data.subscription_end) : null,
        });
      } else {
        setSubscriptionInfo({
          isSubscribed: false,
          tier: 'free',
          expiresAt: null,
        });
      }
    } catch (error) {
      console.error('Erro ao verificar assinatura:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToPlan = async (planId: string, isYearly: boolean) => {
    try {
      if (!user) {
        toast.error("Você precisa estar logado para assinar um plano");
        return null;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { planId, isYearly },
      });

      if (error) {
        throw error;
      }

      return data.url;
    } catch (error) {
      console.error('Erro ao iniciar assinatura:', error);
      toast.error("Erro ao processar o pagamento. Por favor, tente novamente.");
      return null;
    }
  };

  // Verificar assinatura ao carregar e quando o usuário mudar
  useEffect(() => {
    fetchSubscription();
  }, [user]);

  return {
    ...subscriptionInfo,
    isLoading,
    fetchSubscription,
    subscribeToPlan,
  };
};
