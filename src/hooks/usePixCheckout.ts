import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// Pagamento com PIX via checkout hospedado da AbacatePay (redirect, mesmo
// padrão de useAbacateCheckout) — troca feita em 2026-07-27 depois de
// confirmar que produtos com ciclo de assinatura bloqueiam PIX ("PIX
// Automático is not available for this store"), mas os produtos avulsos
// (sem ciclo) aceitam PIX normalmente. abacate-create-pix-charge usa esse
// catálogo avulso e devolve a URL do checkout hospedado, que já mostra PIX
// e cartão juntos na mesma tela.
export const usePixCheckout = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const createPixCheckout = async (
    planType: 'professional' | 'premium',
    billingPeriod: 'monthly' | 'annual',
  ): Promise<boolean> => {
    if (!user) {
      toast({ title: 'Erro de Autenticação', description: 'Você precisa estar logado para continuar.', variant: 'destructive' });
      return false;
    }

    if (loading) return false;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('abacate-create-pix-charge', {
        body: { plan_type: planType, billing_period: billingPeriod },
      });

      if (error) throw error;
      if (!data?.url) throw new Error('URL de checkout não recebida');

      const checkoutUrl = new URL(data.url);
      if (!checkoutUrl.hostname.endsWith('abacatepay.com')) {
        throw new Error('URL de checkout inválida');
      }

      window.location.href = data.url;
      return true;
    } catch (error: any) {
      toast({
        title: 'Erro ao iniciar pagamento PIX',
        description: error?.message ?? 'Não foi possível iniciar o checkout. Tente novamente.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { createPixCheckout, loading };
};
