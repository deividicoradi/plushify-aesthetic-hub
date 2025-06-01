
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

      // Verificar assinatura no servidor - com tratamento de erro melhorado
      const { data, error } = await supabase.functions.invoke('verify-subscription');

      if (error) {
        console.error('Erro na função verify-subscription:', error);
        // Se a função não existir ou der erro, continuar com estado padrão
        setSubscriptionInfo({
          isSubscribed: false,
          tier: 'free',
          expiresAt: null,
        });
        return;
      }

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
      console.error('Erro ao verificar assinatura:', error);
      // Em caso de erro, manter estado padrão
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
    try {
      if (!user) {
        toast.error("Você precisa estar logado para assinar um plano");
        return null;
      }

      setIsLoading(true);

      // Verificar se a função existe antes de chamar
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { planId, isYearly },
      });

      if (error) {
        console.error('Erro na função create-checkout-session:', error);
        
        // Se a função não existir, mostrar mensagem mais específica
        if (error.message?.includes('not found') || error.message?.includes('404')) {
          toast.error("Sistema de pagamento ainda não configurado. Entre em contato com o suporte.");
        } else {
          toast.error("Erro ao processar o pagamento. Por favor, tente novamente em alguns instantes.");
        }
        return null;
      }

      if (data && data.url) {
        return data.url;
      } else {
        toast.error("Não foi possível gerar o link de pagamento. Tente novamente.");
        return null;
      }
    } catch (error) {
      console.error('Erro ao iniciar assinatura:', error);
      toast.error("Erro interno do sistema. Por favor, entre em contato com o suporte.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Função para simular assinatura (desenvolvimento)
  const simulateSubscription = async (planTier: SubscriptionTier) => {
    if (planTier === 'free') {
      setSubscriptionInfo({
        isSubscribed: false,
        tier: 'free',
        expiresAt: null,
      });
      toast.success("Plano alterado para Gratuito!");
      return;
    }

    setSubscriptionInfo({
      isSubscribed: true,
      tier: planTier,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
    });
    
    const planNames = {
      starter: 'Starter',
      pro: 'Pro',
      premium: 'Premium'
    };
    
    toast.success(`Assinatura do plano ${planNames[planTier]} ativada com sucesso! (Simulação)`);
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
    simulateSubscription, // Para desenvolvimento/demonstração
  };
};
