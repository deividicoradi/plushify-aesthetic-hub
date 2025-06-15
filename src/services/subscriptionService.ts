
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionTier } from '@/types/subscription';

export const fetchSubscriptionData = async (user: any, session: any) => {
  if (!user || !session) {
    return {
      isSubscribed: false,
      tier: 'free' as SubscriptionTier,
      expiresAt: null,
    };
  }

  try {
    console.log('🔍 Verificando assinatura para:', user.email);

    const { data, error } = await supabase.functions.invoke('verify-subscription', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      console.error('❌ Erro na verificação:', error);
      return {
        isSubscribed: false,
        tier: 'free' as SubscriptionTier,
        expiresAt: null,
      };
    }

    console.log('📊 Dados recebidos:', data);

    if (data && data.subscribed && data.subscription_tier) {
      return {
        isSubscribed: true,
        tier: data.subscription_tier as SubscriptionTier,
        expiresAt: data.subscription_end ? new Date(data.subscription_end) : null,
      };
    } else {
      return {
        isSubscribed: false,
        tier: 'free' as SubscriptionTier,
        expiresAt: null,
      };
    }
  } catch (error) {
    console.error('💥 Erro ao verificar assinatura:', error);
    return {
      isSubscribed: false,
      tier: 'free' as SubscriptionTier,
      expiresAt: null,
    };
  }
};

export const createCheckoutSession = async (
  planId: string,
  isYearly: boolean,
  user: any,
  session: any
) => {
  console.log('🎯 Iniciando assinatura:', { planId, isYearly, userEmail: user?.email });
  
  if (!user || !session) {
    throw new Error("Você precisa estar logado para assinar um plano");
  }

  try {
    console.log('💳 Criando sessão de checkout...');
    
    const payload = {
      planId: planId,
      isYearly: isYearly
    };
    
    console.log('📋 Payload sendo enviado:', payload);

    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: payload,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📦 Resposta:', { data, error });

    if (error) {
      console.error('❌ Erro:', error);
      throw new Error(`Erro: ${error.message}`);
    }

    if (!data || !data.success || !data.url) {
      console.error('❌ Resposta inválida:', data);
      throw new Error("Erro ao processar pagamento");
    }

    console.log('✅ URL de checkout:', data.url);
    return data.url;

  } catch (error) {
    console.error('💥 Erro crítico:', error);
    throw error;
  }
};
