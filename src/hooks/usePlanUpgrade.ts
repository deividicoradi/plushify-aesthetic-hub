import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UpgradeQuote {
  current_plan_type: string;
  current_billing_interval: string;
  current_expires_at: string;
  remaining_days: number;
  credit_cents: number;
  new_plan_type: string;
  new_billing_interval: string;
  new_price_cents: number;
  charge_now_cents: number;
}

// Upgrade de plano pago (ex: Profissional -> Premium) com crédito
// proporcional pelos dias não usados do plano atual — não passa mais pelo
// checkout de preço cheio (useAbacateCheckout), porque isso cobraria o
// cliente duas vezes pelo mesmo período sem devolver nada do que já foi
// pago (risco de contestação de cobrança / reclamação via CDC).
export const usePlanUpgrade = () => {
  const [quote, setQuote] = useState<UpgradeQuote | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const { toast } = useToast();

  const fetchQuote = async (
    newPlanType: 'professional' | 'premium',
    newBillingInterval: 'month' | 'year',
  ): Promise<boolean> => {
    setLoadingQuote(true);
    setQuote(null);
    try {
      const { data, error } = await supabase.functions.invoke('abacate-get-upgrade-quote', {
        body: { new_plan_type: newPlanType, new_billing_interval: newBillingInterval },
      });
      if (error) throw error;
      if (!data || data.error) throw new Error(data?.detail || data?.error || 'Não foi possível calcular o upgrade.');
      setQuote(data as UpgradeQuote);
      return true;
    } catch (error: any) {
      toast({
        title: 'Erro ao calcular upgrade',
        description: error?.message ?? 'Tente novamente em instantes.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoadingQuote(false);
    }
  };

  const confirmUpgrade = async (
    newPlanType: 'professional' | 'premium',
    newBillingInterval: 'month' | 'year',
  ): Promise<boolean> => {
    setConfirming(true);
    try {
      const { data, error } = await supabase.functions.invoke('abacate-create-upgrade-checkout', {
        body: { new_plan_type: newPlanType, new_billing_interval: newBillingInterval },
      });
      if (error) throw error;
      if (!data?.url) throw new Error(data?.detail || data?.error || 'Não foi possível iniciar o pagamento do upgrade.');

      const checkoutUrl = new URL(data.url);
      if (!checkoutUrl.hostname.endsWith('abacatepay.com')) {
        throw new Error('URL de checkout inválida');
      }

      window.location.href = data.url;
      return true;
    } catch (error: any) {
      toast({
        title: 'Erro ao confirmar upgrade',
        description: error?.message ?? 'Tente novamente em instantes.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setConfirming(false);
    }
  };

  const reset = () => setQuote(null);

  return { quote, loadingQuote, confirming, fetchQuote, confirmUpgrade, reset };
};
