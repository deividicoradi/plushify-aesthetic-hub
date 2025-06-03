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
      console.log('🔍 Verificando assinatura para usuário:', user.email);

      const { data, error } = await supabase.functions.invoke('verify-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('❌ Erro na função verify-subscription:', error);
        setSubscriptionInfo({
          isSubscribed: false,
          tier: 'free',
          expiresAt: null,
        });
        return;
      }

      console.log('📊 Dados de assinatura recebidos:', data);

      if (data && data.subscribed && data.subscription_tier) {
        console.log('✅ Assinatura ativa encontrada:', data.subscription_tier);
        setSubscriptionInfo({
          isSubscribed: true,
          tier: data.subscription_tier as SubscriptionTier,
          expiresAt: data.subscription_end ? new Date(data.subscription_end) : null,
        });
      } else {
        console.log('📝 Nenhuma assinatura ativa, mantendo como free');
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

  const subscribeToPlan = async (planId: string, isYearly: boolean) => {
    if (!user || !session) {
      toast.error("Você precisa estar logado para assinar um plano");
      return null;
    }

    try {
      setIsLoading(true);
      console.log('💳 Criando sessão de checkout:', { 
        planId, 
        isYearly, 
        userEmail: user.email,
        sessionToken: session.access_token ? 'Presente' : 'Ausente'
      });

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          planId, 
          isYearly,
          userEmail: user.email 
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (error) {
        console.error('❌ Erro na função create-checkout-session:', error);
        
        if (error.message?.includes('STRIPE_SECRET_KEY')) {
          toast.error("Sistema de pagamento não configurado. Entre em contato com o suporte.");
        } else if (error.message?.includes('User not authenticated')) {
          toast.error("Erro de autenticação. Faça login novamente.");
        } else {
          toast.error(`Erro no sistema de pagamento: ${error.message}`);
        }
        return null;
      }

      console.log('📦 Resposta da função create-checkout-session:', data);

      if (data && data.url) {
        console.log('🔗 URL de checkout recebida:', data.url);
        return data.url;
      } else {
        console.error('❌ Resposta inválida da função:', data);
        toast.error("Erro interno no sistema de pagamento.");
        return null;
      }
    } catch (error) {
      console.error('💥 Erro crítico ao processar pagamento:', error);
      toast.error("Erro interno do sistema. Entre em contato com o suporte.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Função para verificar se uma funcionalidade está disponível
  const hasFeature = (requiredTier: SubscriptionTier) => {
    const tierLevels = {
      'free': 0,
      'starter': 1,
      'pro': 2,
      'premium': 3
    };
    
    return tierLevels[subscriptionInfo.tier] >= tierLevels[requiredTier];
  };

  // Função para obter informações do plano atual
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

  // Verificar assinatura quando o usuário faz login ou a sessão muda
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
