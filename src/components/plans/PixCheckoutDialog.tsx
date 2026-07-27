import React from 'react';
import { Copy, CheckCircle2, Loader2, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { usePixCheckout } from '@/hooks/usePixCheckout';

interface PixCheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planType: 'professional' | 'premium';
  billingPeriod: 'monthly' | 'annual';
  planName: string;
  onPaid: () => void;
}

export const PixCheckoutDialog: React.FC<PixCheckoutDialogProps> = ({
  open,
  onOpenChange,
  planType,
  billingPeriod,
  planName,
  onPaid,
}) => {
  const { createPixCharge, charge, status, loading, reset } = usePixCheckout();
  const { toast } = useToast();
  const requestedRef = React.useRef(false);

  React.useEffect(() => {
    if (open && !requestedRef.current) {
      requestedRef.current = true;
      createPixCharge(planType, billingPeriod, onPaid);
    }
    if (!open) {
      requestedRef.current = false;
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleCopy = () => {
    if (!charge) return;
    navigator.clipboard.writeText(charge.brCode);
    toast({ title: 'Código copiado!', description: 'Cole no app do seu banco para pagar.' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pagar com PIX — {planName}</DialogTitle>
          <DialogDescription>
            Escaneie o QR Code ou copie o código abaixo no app do seu banco.
          </DialogDescription>
        </DialogHeader>

        {loading && !charge && (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Gerando QR Code PIX...</p>
          </div>
        )}

        {charge && status === 'pending' && (
          <div className="flex flex-col items-center gap-4">
            <img
              src={charge.brCodeBase64}
              alt="QR Code PIX"
              className="w-56 h-56 rounded-lg border border-border"
            />
            <Button variant="outline" className="w-full" onClick={handleCopy}>
              <Copy className="w-4 h-4 mr-2" />
              Copiar código PIX
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Aguardando pagamento...</span>
            </div>
          </div>
        )}

        {status === 'paid' && (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            <p className="font-medium">Pagamento confirmado!</p>
            <p className="text-sm text-muted-foreground text-center">
              Seu plano já está ativo. Redirecionando...
            </p>
          </div>
        )}

        {status === 'expired' && (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <Clock className="w-12 h-12 text-destructive" />
            <p className="font-medium">QR Code expirado</p>
            <p className="text-sm text-muted-foreground text-center">
              Feche esta janela e tente novamente para gerar um novo código.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
