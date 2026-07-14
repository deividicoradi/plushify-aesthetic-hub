import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// Hook único de checkout — usa exclusivamente AbacatePay.
export const useAbacateCheckout = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // SEGURANÇA: Validação local antes de enviar para o backend
  const validateCheckoutInput = (planType: string, billingPeriod: string) => {
    const validPlans = ['professional', 'premium'];
    const validPeriods = ['monthly', 'annual'];
    
    if (!validPlans.includes(planType)) {
      throw new Error('Tipo de plano inválido');
    }
    
    if (!validPeriods.includes(billingPeriod)) {
      throw new Error('Período de cobrança inválido');
    }
    
    return true;
  };

  const createCheckout = async (
    planType: 'professional' | 'premium',
    billingPeriod: 'monthly' | 'annual' = 'monthly',
  ): Promise<boolean> => {
    // Evitar múltiplas chamadas simultâneas
    if (loading) {
      console.log('SECURITY: Checkout already in progress, ignoring duplicate request');
      return false;
    }

    try {
      setLoading(true);
      
      // SEGURANÇA: Verificar se usuário está autenticado
      if (!user) {
        toast({
          title: "Erro de Autenticação",
          description: "Você precisa estar logado para continuar.",
          variant: "destructive",
        });
        return false;
      }

      // SEGURANÇA: Validação local dos parâmetros
      validateCheckoutInput(planType, billingPeriod);
      
      console.log('SECURITY: Creating checkout with validated params', { 
        planType, 
        billingPeriod, 
        userId: user.id 
      });

      const { data, error } = await supabase.functions.invoke('abacate-create-subscription', {
        body: { 
          plan_type: planType, // Apenas valores validados
          billing_period: billingPeriod // Apenas valores validados
        }
      });

      if (error) {
        console.error('SECURITY: Checkout error received', error);
        throw error;
      }

      if (data?.url) {
        // Verificar se URL é da AbacatePay antes de redirecionar
        try {
          const checkoutUrl = new URL(data.url);
          if (!checkoutUrl.hostname.endsWith('abacatepay.com')) {
            throw new Error('URL de checkout inválida');
          }
          
          console.log('SECURITY: Valid checkout URL received, redirecting');
          window.location.href = data.url;
          return true;
        } catch (urlError) {
          console.error('SECURITY: Invalid checkout URL', { url: data.url });
          throw new Error('URL de checkout inválida recebida');
        }
      } else {
        throw new Error('Nenhuma URL de checkout foi recebida');
      }

    } catch (error: any) {
      console.error('SECURITY: Checkout process failed', error);
      
      let errorMessage = "Não foi possível iniciar o checkout. Tente novamente.";
      
      // SEGURANÇA: Diferentes mensagens baseadas no tipo de erro
      if (error.message?.includes('Acesso negado')) {
        errorMessage = "Acesso negado. Verifique suas permissões.";
      } else if (error.message?.includes('autenticação') || error.message?.includes('auth')) {
        errorMessage = "Erro de autenticação. Faça login novamente.";
      } else if (error.message?.includes('inválido')) {
        errorMessage = "Dados inválidos. Tente novamente.";
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
    return false;
  };

  // AbacatePay não possui um portal do cliente self-service equivalente ao Stripe.
  // Mantido como stub para preservar a assinatura pública anterior; instrui o usuário
  // a entrar em contato com o suporte para gerenciar/cancelar a assinatura.
  const openCustomerPortal = async () => {
    toast({
      title: 'Gerenciar assinatura',
      description:
        'Para alterar ou cancelar sua assinatura, entre em contato com o suporte da Plushify.',
    });
  };

  return {
    createCheckout,
    openCustomerPortal,
    loading
  };
};
