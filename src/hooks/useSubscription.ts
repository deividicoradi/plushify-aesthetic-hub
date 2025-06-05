
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
      console.log('🔍 Verificando assinatura para:', user.email);

      const { data, error } = await supabase.functions.invoke('verify-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('❌ Erro na verificação:', error);
        setSubscriptionInfo({
          isSubscribed: false,
          tier: 'free',
          expiresAt: null,
        });
        return;
      }

      console.log('📊 Dados recebidos:', data);

      if (data && data.subscribed && data.subscription_tier) {
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
    console.log('🎯 Iniciando assinatura:', { planId, isYearly, userEmail: user?.email });
    
    if (!user || !session) {
      toast.error("Você precisa estar logado para assinar um plano");
      return null;
    }

    try {
      setIsLoading(true);
      console.log('💳 Criando sessão de checkout...');

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          planId, 
          isYearly 
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📦 Resposta:', { data, error });

      if (error) {
        console.error('❌ Erro:', error);
        toast.error(`Erro: ${error.message}`);
        return null;
      }

      if (!data || !data.success || !data.url) {
        console.error('❌ Resposta inválida:', data);
        toast.error("Erro ao processar pagamento");
        return null;
      }

      console.log('✅ URL de checkout:', data.url);
      toast.success("Redirecionando para pagamento...");
      return data.url;

    } catch (error) {
      console.error('💥 Erro crítico:', error);
      toast.error("Erro interno do sistema");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const hasFeature = (requiredTier: SubscriptionTier) => {
    const tierLevels = {
      'free': 0,
      'starter': 1,
      'pro': 2,
      'premium': 3
    };
    
    return tierLevels[subscriptionInfo.tier] >= tierLevels[requiredTier];
  };

  const getCurrentPlanInfo = () => {
    const planNames = {
      free: 'Gratuito',
      starter: 'Starter',
      pro: 'Pro',
      premium: 'Premium'
    };
    
    return {
      name: planNames[subscriptionInfo.tier],
      tier: subscriptionInfo.tier,
      isSubscribed: subscriptionInfo.isSubscribed,
      expiresAt: subscriptionInfo.expiresAt
    };
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
    hasFeature,
    getCurrentPlanInfo,
  };
};
