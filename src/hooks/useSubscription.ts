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

  const subscribeToPlan = async (planId: string, isYearly: boolean = false) => {
    console.log('🎯 Iniciando subscribeToPlan:', { planId, isYearly, userEmail: user?.email });
    
    if (!user || !session) {
      console.error('❌ Usuário não autenticado');
      toast.error("Você precisa estar logado para assinar um plano");
      return null;
    }

    if (!session.access_token) {
      console.error('❌ Token de acesso não encontrado');
      toast.error("Erro de autenticação. Faça login novamente.");
      return null;
    }

    try {
      setIsLoading(true);
      console.log('💳 Enviando dados para create-checkout-session:', { 
        planId, 
        isYearly,
        userEmail: user.email
      });

      const requestData = { 
        planId, 
        isYearly: isYearly || false,
        userEmail: user.email 
      };

      console.log('📤 Dados sendo enviados:', JSON.stringify(requestData));

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: requestData,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📦 Resposta da edge function:', { data, error });

      if (error) {
        console.error('❌ Erro retornado pela função:', error);
        
        if (error.message?.includes('STRIPE_SECRET_KEY')) {
          toast.error("Sistema de pagamento não configurado");
        } else if (error.message?.includes('não autenticado')) {
          toast.error("Erro de autenticação. Faça login novamente");
        } else if (error.message?.includes('Formato de dados inválido')) {
          toast.error("Erro nos dados do plano. Tente novamente");
        } else {
          toast.error(`Erro: ${error.message}`);
        }
        return null;
      }

      if (!data) {
        console.error('❌ Resposta vazia da função');
        toast.error("Erro interno. Tente novamente");
        return null;
      }

      if (data.success && data.url) {
        console.log('✅ URL de checkout recebida:', data.url);
        toast.success("Redirecionando para pagamento...");
        return data.url;
      } else {
        console.error('❌ Resposta inválida:', data);
        toast.error(data.error || "Erro ao processar pagamento");
        return null;
      }

    } catch (error) {
      console.error('💥 Erro crítico:', error);
      toast.error("Erro interno do sistema");
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
