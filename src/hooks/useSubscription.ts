
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/components/ui/sonner";
import { SubscriptionTier, SubscriptionInfo } from '@/types/subscription';
import { hasFeature, getCurrentPlanInfo } from '@/utils/subscriptionHelpers';
import { fetchSubscriptionData, createCheckoutSession } from '@/services/subscriptionService';

export type { SubscriptionTier, SubscriptionInfo } from '@/types/subscription';

export const useSubscription = () => {
  const { user, session } = useAuth();
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
    if (!user || !session) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await fetchSubscriptionData(user, session);
      setSubscriptionInfo(data);
    } catch (error) {
      console.error('💥 Erro ao verificar assinatura:', error);
      setSubscriptionInfo({
        isSubscribed: false,
        tier: 'free',
        expiresAt: null,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToPlan = async (planId: string, isYearly: boolean = false) => {
    if (!user || !session) {
      toast.error("Você precisa estar logado para assinar um plano");
      return null;
    }

    try {
      setIsLoading(true);
      const url = await createCheckoutSession(planId, isYearly, user, session);
      toast.success("Redirecionando para pagamento...");
      return url;
    } catch (error: any) {
      console.error('💥 Erro crítico:', error);
      toast.error(error.message || "Erro interno do sistema");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const hasSubscriptionFeature = (requiredTier: SubscriptionTier) => {
    return hasFeature(subscriptionInfo.tier, requiredTier);
  };

  const getPlanInfo = () => {
    return getCurrentPlanInfo(
      subscriptionInfo.tier,
      subscriptionInfo.isSubscribed,
      subscriptionInfo.expiresAt
    );
  };

  useEffect(() => {
    if (user && session) {
      fetchSubscription();
    } else {
      setSubscriptionInfo({
        isSubscribed: false,
        tier: 'free',
        expiresAt: null,
      });
      setIsLoading(false);
    }
  }, [user, session]);

  return {
    ...subscriptionInfo,
    isLoading,
    fetchSubscription,
    subscribeToPlan,
    hasFeature: hasSubscriptionFeature,
    getCurrentPlanInfo: getPlanInfo,
  };
};
