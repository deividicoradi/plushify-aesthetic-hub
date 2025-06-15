
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useStripeCheckout = () => {
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

  const createCheckout = async (planType: 'professional' | 'premium', billingPeriod: 'monthly' | 'annual' = 'monthly') => {
    try {
      setLoading(true);
      
      // SEGURANÇA: Verificar se usuário está autenticado
      if (!user) {
        toast({
          title: "Erro de Autenticação",
          description: "Você precisa estar logado para continuar.",
          variant: "destructive",
        });
        return;
      }

      // SEGURANÇA: Validação local dos parâmetros
      validateCheckoutInput(planType, billingPeriod);
      
      console.log('SECURITY: Creating checkout with validated params', { 
        planType, 
        billingPeriod, 
        userId: user.id 
      });

      // SEGURANÇA: Chamar função com parâmetros validados
      const { data, error } = await supabase.functions.invoke('create-checkout', {
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
        // SEGURANÇA: Verificar se URL é válida antes de redirecionar
        try {
          const checkoutUrl = new URL(data.url);
          if (!checkoutUrl.hostname.includes('checkout.stripe.com')) {
            throw new Error('URL de checkout inválida');
          }
          
          console.log('SECURITY: Valid checkout URL received, redirecting');
          window.open(data.url, '_blank');
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
        title: "Erro de Segurança",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    try {
      setLoading(true);
      
      // SEGURANÇA: Verificar autenticação
      if (!user) {
        toast({
          title: "Erro de Autenticação",
          description: "Você precisa estar logado para acessar o portal.",
          variant: "destructive",
        });
        return;
      }

      console.log('SECURITY: Opening customer portal for user', { userId: user.id });
      
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) {
        console.error('SECURITY: Customer portal error', error);
        throw error;
      }

      if (data?.url) {
        // SEGURANÇA: Verificar se URL do portal é válida
        try {
          const portalUrl = new URL(data.url);
          if (!portalUrl.hostname.includes('billing.stripe.com')) {
            throw new Error('URL do portal inválida');
          }
          
          console.log('SECURITY: Valid portal URL received, redirecting');
          window.open(data.url, '_blank');
        } catch (urlError) {
          console.error('SECURITY: Invalid portal URL', { url: data.url });
          throw new Error('URL do portal inválida recebida');
        }
      } else {
        throw new Error('Nenhuma URL do portal foi recebida');
      }
    } catch (error: any) {
      console.error('SECURITY: Portal access failed', error);
      
      toast({
        title: "Erro",
        description: "Não foi possível abrir o portal de gerenciamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    createCheckout,
    openCustomerPortal,
    loading
  };
};
