import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ClientGiftCard } from '@/hooks/packages/useGiftCards';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

interface RedeemGiftCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  giftCard: ClientGiftCard | null;
  onRedeem: (giftCardId: string, amount: number, note?: string) => Promise<unknown>;
}

export const RedeemGiftCardDialog: React.FC<RedeemGiftCardDialogProps> = ({
  open,
  onOpenChange,
  giftCard,
  onRedeem,
}) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setAmount('');
    setNote('');
  };

  const numericAmount = parseFloat(amount) || 0;
  const exceedsBalance = !!giftCard && numericAmount > giftCard.balance;

  const handleSubmit = async () => {
    if (!giftCard || numericAmount <= 0 || exceedsBalance) return;
    setSubmitting(true);
    try {
      await onRedeem(giftCard.id, numericAmount, note || undefined);
      reset();
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) reset(); onOpenChange(next); }}>
      <DialogContent className="max-w-md p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Registrar Uso do Vale-presente</DialogTitle>
        </DialogHeader>

        {giftCard && (
          <div className="space-y-4">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Saldo disponível: <span className="font-semibold text-foreground">{formatCurrency(giftCard.balance)}</span>
            </p>

            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Valor usado (R$) *</Label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={giftCard.balance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="flex h-9 sm:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm"
              />
              {exceedsBalance && (
                <p className="text-xs text-destructive">Valor maior que o saldo disponível.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Observação</Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ex: abatido no pagamento de 25/07"
                rows={2}
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || numericAmount <= 0 || exceedsBalance}
                className="w-full sm:w-auto"
              >
                {submitting ? 'Registrando...' : 'Registrar'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
