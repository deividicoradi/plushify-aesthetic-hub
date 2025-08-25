import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageCircle, Send, Loader2, AlertTriangle } from 'lucide-react';
import { useWhatsAppIntegration } from '@/hooks/useWhatsAppIntegration';
import { WhatsAppConnectionCard } from './WhatsAppConnectionCard';

interface WhatsAppQuickSendProps {
  phone?: string;
  clientName?: string;
  defaultMessage?: string;
  trigger?: React.ReactNode;
}

export const WhatsAppQuickSend = ({ 
  phone = '', 
  clientName = '',
  defaultMessage = '',
  trigger 
}: WhatsAppQuickSendProps) => {
  const { session, sendMessage } = useWhatsAppIntegration();
  const [open, setOpen] = useState(false);
  const [messageText, setMessageText] = useState(defaultMessage);
  const [phoneNumber, setPhoneNumber] = useState(phone);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!messageText.trim() || !phoneNumber.trim()) {
      setError('Telefone e mensagem são obrigatórios');
      return;
    }

    setSending(true);
    setError(null);

    try {
      await sendMessage(phoneNumber, messageText);
      setOpen(false);
      setMessageText(defaultMessage);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar mensagem');
    } finally {
      setSending(false);
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.slice(0, 15);
  };

  const DefaultTrigger = () => (
    <Button variant="outline" size="sm">
      <MessageCircle className="w-4 h-4 mr-2" />
      WhatsApp
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <DefaultTrigger />}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Enviar via WhatsApp
            {clientName && <span className="text-muted-foreground">- {clientName}</span>}
          </DialogTitle>
        </DialogHeader>

        {session.status !== 'conectado' ? (
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                WhatsApp não está conectado. Conecte primeiro para enviar mensagens.
              </AlertDescription>
            </Alert>
            <WhatsAppConnectionCard />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Telefone</label>
              <Input
                placeholder="11999999999"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(formatPhone(e.target.value))}
                maxLength={15}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Apenas números (DDD + número)
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Mensagem</label>
              <Textarea
                placeholder="Digite sua mensagem..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="resize-none"
                rows={4}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {messageText.length}/1000 caracteres
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={sending}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSend}
                disabled={sending || !messageText.trim() || !phoneNumber.trim()}
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Enviar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};