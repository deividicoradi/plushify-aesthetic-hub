import React, { useState } from 'react';
import { Ban, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const formatBRL = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const CancelSubscriptionSection: React.FC = () => {
  const { subscription, currentPlan, loading, refetch } = useSubscription();
  const [open, setOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [result, setResult] = useState<{ kind: 'month' | 'year'; estimated_refund?: number; penalty?: number; months_remaining?: number } | null>(null);

  if (loading || !subscription || currentPlan === 'trial' || subscription.cancel_at_period_end) {
    return null;
  }

  const isAnnual = subscription.billing_interval === 'year';

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      const { data, error } = await supabase.rpc('self_cancel_subscription');
      if (error) throw error;
      const res = data as { kind: 'month' | 'year'; estimated_refund?: number; penalty?: number; months_remaining?: number };
      setResult(res);
      if (res.kind === 'month') {
        toast({ title: 'Assinatura cancelada', description: 'Você mantém acesso até o fim do período já pago, sem multa.' });
      } else {
        toast({ title: 'Solicitação registrada', description: 'Nosso time vai processar o reembolso proporcional em breve.' });
      }
      refetch();
    } catch (err) {
      toast({ title: 'Erro ao cancelar', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-muted rounded-lg">
            <Ban className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <CardTitle className="text-base sm:text-lg">Cancelar assinatura</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {isAnnual ? 'Plano anual — cancelamento antecipado' : 'Plano mensal'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {isAnnual ? (
          <p className="text-sm text-muted-foreground">
            Seu plano é anual. Ao cancelar antes do fim dos 12 meses, você recebe reembolso proporcional aos
            meses ainda não utilizados, descontada uma multa de 10% (conforme os Termos de Uso). A solicitação
            é registrada na hora e nosso time processa o reembolso em seguida — seu acesso continua ativo até lá.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Você pode cancelar a qualquer momento, sem multa. O cancelamento é imediato e você mantém acesso
            até o fim do período já pago — não haverá nova cobrança depois disso.
          </p>
        )}
        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => setOpen(true)}>
          <Ban className="w-4 h-4 mr-2" />
          Cancelar assinatura
        </Button>
      </CardContent>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setResult(null); }}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Cancelar assinatura?</DialogTitle>
            <DialogDescription>
              {isAnnual
                ? 'Vamos calcular o reembolso proporcional (menos 10% de multa) e registrar a solicitação agora.'
                : 'Isso interrompe a renovação. Você mantém acesso até o fim do período já pago.'}
            </DialogDescription>
          </DialogHeader>

          {result ? (
            <div className="space-y-3">
              {result.kind === 'month' ? (
                <p className="text-sm">Cancelado. Você continua com acesso até o fim do período já pago.</p>
              ) : (
                <div className="space-y-1 text-sm">
                  <p>Chamado registrado — nosso time vai processar:</p>
                  <ul className="list-disc pl-5 space-y-0.5 text-muted-foreground">
                    <li>Meses restantes: {result.months_remaining}</li>
                    <li>Multa (10%): {formatBRL(result.penalty ?? 0)}</li>
                    <li>Reembolso estimado: {formatBRL(result.estimated_refund ?? 0)}</li>
                  </ul>
                </div>
              )}
              <Button className="w-full" onClick={() => setOpen(false)}>Fechar</Button>
            </div>
          ) : (
            <Button
              variant="destructive"
              className="w-full gap-2"
              disabled={isCancelling}
              onClick={handleCancel}
            >
              {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
              Confirmar cancelamento
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};
