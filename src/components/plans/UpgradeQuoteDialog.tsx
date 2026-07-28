import React, { useEffect, useState } from 'react';
import { Loader2, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { usePlanUpgrade } from '@/hooks/usePlanUpgrade';

const PLAN_LABELS: Record<string, string> = {
  professional: 'Profissional',
  premium: 'Premium',
};

const formatBRL = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

interface UpgradeQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newPlanType: 'professional' | 'premium';
  newBillingInterval: 'month' | 'year';
}

export const UpgradeQuoteDialog: React.FC<UpgradeQuoteDialogProps> = ({
  open,
  onOpenChange,
  newPlanType,
  newBillingInterval,
}) => {
  const { quote, loadingQuote, confirming, fetchQuote, confirmUpgrade, reset } = usePlanUpgrade();
  const [accepted, setAccepted] = useState(false);
  const requestedRef = React.useRef(false);

  useEffect(() => {
    if (open && !requestedRef.current) {
      requestedRef.current = true;
      fetchQuote(newPlanType, newBillingInterval);
    }
    if (!open) {
      requestedRef.current = false;
      setAccepted(false);
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleConfirm = () => {
    if (!accepted) return;
    void confirmUpgrade(newPlanType, newBillingInterval);
  };

  const cycleLabel = newBillingInterval === 'year' ? 'ano' : 'mês';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Upgrade pra {PLAN_LABELS[newPlanType]}
          </DialogTitle>
          <DialogDescription>
            Confira o valor antes de confirmar — o crédito do seu plano atual já está descontado.
          </DialogDescription>
        </DialogHeader>

        {loadingQuote && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Calculando o valor do upgrade...</p>
          </div>
        )}

        {quote && !loadingQuote && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 text-sm">
              <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground">
                {PLAN_LABELS[quote.current_plan_type] ?? quote.current_plan_type}
              </span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                {PLAN_LABELS[quote.new_plan_type] ?? quote.new_plan_type}
              </span>
            </div>

            <div className="rounded-lg border border-border divide-y">
              <div className="flex justify-between px-4 py-3 text-sm">
                <span className="text-muted-foreground">Dias restantes no plano atual</span>
                <span className="font-medium">{quote.remaining_days} dias</span>
              </div>
              <div className="flex justify-between px-4 py-3 text-sm">
                <span className="text-muted-foreground">Crédito proporcional</span>
                <span className="font-medium text-emerald-600">− {formatBRL(quote.credit_cents)}</span>
              </div>
              <div className="flex justify-between px-4 py-3 text-sm">
                <span className="text-muted-foreground">Valor cheio do novo plano</span>
                <span className="font-medium">{formatBRL(quote.new_price_cents)}</span>
              </div>
              <div className="flex justify-between px-4 py-3 bg-muted/50">
                <span className="font-semibold">Você paga hoje</span>
                <span className="font-bold text-lg">{formatBRL(quote.charge_now_cents)}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              A partir da confirmação, seu plano vira {PLAN_LABELS[quote.new_plan_type]} imediatamente,
              válido por 1 {cycleLabel === 'ano' ? 'ano' : 'mês'} a partir de hoje.
            </p>

            <div className="flex items-start gap-2">
              <Checkbox
                id="upgrade-terms"
                checked={accepted}
                onCheckedChange={(v) => setAccepted(!!v)}
                className="mt-0.5"
              />
              <Label htmlFor="upgrade-terms" className="text-xs text-muted-foreground font-normal leading-snug">
                Ao confirmar, você concorda com a cobrança de {formatBRL(quote.charge_now_cents)} hoje e
                com a alteração do seu plano pra {PLAN_LABELS[quote.new_plan_type]}.
              </Label>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={confirming}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!quote || !accepted || confirming}>
            {confirming ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              'Confirmar upgrade'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
