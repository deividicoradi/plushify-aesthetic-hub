import React, { useState } from 'react';
import { Ban, Loader2, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

const REASON_OPTIONS: Record<string, string> = {
  preco: 'O preço está acima do que eu esperava',
  pouco_uso: 'Não estou usando o suficiente',
  faltou_recurso: 'Faltou uma funcionalidade que eu precisava',
  encontrei_outro: 'Encontrei outra ferramenta',
  problema_tecnico: 'Tive problemas técnicos',
  outro: 'Outro motivo',
};

type Step = 'retention' | 'confirm' | 'result';

export const CancelSubscriptionSection: React.FC = () => {
  const { subscription, currentPlan, loading, refetch } = useSubscription();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('retention');
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [result, setResult] = useState<{ kind: 'month' | 'year'; estimated_refund?: number; penalty?: number; months_remaining?: number } | null>(null);

  if (loading || !subscription || currentPlan === 'trial' || subscription.cancel_at_period_end) {
    return null;
  }

  const isAnnual = subscription.billing_interval === 'year';

  const resetAndClose = () => {
    setOpen(false);
    setStep('retention');
    setReason('');
    setComment('');
    setResult(null);
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      const { data, error } = await supabase.rpc('self_cancel_subscription', {
        p_reason: reason || null,
        p_comment: comment.trim() || null,
      });
      if (error) throw error;
      const res = data as { kind: 'month' | 'year'; estimated_refund?: number; penalty?: number; months_remaining?: number };
      setResult(res);
      setStep('result');
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

      <Dialog open={open} onOpenChange={(o) => { if (!o) resetAndClose(); else setOpen(true); }}>
        <DialogContent className="sm:max-w-[440px]">
          {step === 'retention' && (
            <>
              <DialogHeader>
                <DialogTitle>Antes de você ir...</DialogTitle>
                <DialogDescription>
                  Sem compromisso, sua resposta nos ajuda a melhorar. Você pode seguir direto pro cancelamento
                  quando quiser.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Select value={reason} onValueChange={setReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Por que você está cancelando? (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(REASON_OPTIONS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Quer contar mais alguma coisa? (opcional)"
                    rows={2}
                  />
                </div>
                <div className="rounded-md bg-muted/60 p-3 flex items-start gap-2.5">
                  <MessageCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Se for sobre preço ou alguma dificuldade, fala com a gente antes —
                    plushify.suporte@gmail.com. Às vezes resolvemos rapidinho.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" onClick={resetAndClose}>Manter minha assinatura</Button>
                  <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setStep('confirm')}>
                    Continuar com o cancelamento
                  </Button>
                </div>
              </div>
            </>
          )}

          {step === 'confirm' && (
            <>
              <DialogHeader>
                <DialogTitle>Cancelar assinatura?</DialogTitle>
                <DialogDescription>
                  {isAnnual
                    ? 'Vamos calcular o reembolso proporcional (menos 10% de multa) e registrar a solicitação agora.'
                    : 'Isso interrompe a renovação. Você mantém acesso até o fim do período já pago.'}
                </DialogDescription>
              </DialogHeader>
              <Button
                variant="destructive"
                className="w-full gap-2"
                disabled={isCancelling}
                onClick={handleCancel}
              >
                {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                Confirmar cancelamento
              </Button>
            </>
          )}

          {step === 'result' && result && (
            <>
              <DialogHeader>
                <DialogTitle>Cancelar assinatura?</DialogTitle>
              </DialogHeader>
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
                <Button className="w-full" onClick={resetAndClose}>Fechar</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};
