import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface PixCharge {
  id: string;
  brCode: string;
  brCodeBase64: string;
  expiresAt: string;
  externalId: string;
}

// Fluxo de pagamento PIX avulso (QR Code), separado do checkout com cartão
// (useAbacateCheckout) — usa abacate-create-pix-charge (endpoint /v2/transparents/create
// da AbacatePay, o único que aceita PIX pra esta loja hoje; o checkout normal com
// PIX retorna "PIX Automático is not available for this store").
export const usePixCheckout = () => {
  const [loading, setLoading] = useState(false);
  const [charge, setCharge] = useState<PixCharge | null>(null);
  const [status, setStatus] = useState<'idle' | 'pending' | 'paid' | 'expired'>('idle');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const createPixCharge = async (
    planType: 'professional' | 'premium',
    billingPeriod: 'monthly' | 'annual',
    onPaid: () => void,
  ): Promise<void> => {
    if (!user) {
      toast({ title: 'Erro de Autenticação', description: 'Você precisa estar logado para continuar.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    setStatus('idle');
    setCharge(null);
    try {
      const { data, error } = await supabase.functions.invoke('abacate-create-pix-charge', {
        body: { plan_type: planType, billing_period: billingPeriod },
      });

      if (error) throw error;
      if (!data?.brCode) throw new Error('QR Code PIX não recebido');

      setCharge(data as PixCharge);
      setStatus('pending');

      // Expira em 1h (expiresIn=3600 configurado no backend) — paramos o
      // polling um pouco antes pra não ficar chamando a API indefinidamente.
      const expiresAtMs = new Date(data.expiresAt).getTime();

      pollRef.current = setInterval(async () => {
        if (Date.now() > expiresAtMs) {
          setStatus('expired');
          stopPolling();
          return;
        }
        try {
          const { data: statusData, error: statusError } = await supabase.functions.invoke('abacate-check-pix-status', {
            body: { id: data.id, externalId: data.externalId },
          });
          if (statusError) return;
          if (statusData?.status === 'PAID') {
            setStatus('paid');
            stopPolling();
            toast({ title: 'Pagamento confirmado!', description: 'Seu plano foi ativado com sucesso.' });
            onPaid();
          }
        } catch {
          // Silencioso: um erro de polling isolado não deve interromper o fluxo,
          // a próxima tentativa (3s depois) pode funcionar normalmente.
        }
      }, 3000);
    } catch (error: any) {
      toast({
        title: 'Erro ao gerar PIX',
        description: error?.message ?? 'Não foi possível gerar a cobrança PIX. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const reset = useCallback(() => {
    stopPolling();
    setCharge(null);
    setStatus('idle');
  }, [stopPolling]);

  return { createPixCharge, charge, status, loading, reset };
};
