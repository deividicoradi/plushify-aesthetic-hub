import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Loader2, CheckCircle2, Unlink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type WaStatus = 'disconnected' | 'connecting' | 'connected' | 'failed';

interface WaState {
  status: WaStatus;
  phone_number?: string | null;
  qrcode?: { base64?: string; pairingCode?: string } | null;
}

async function callWhatsAppProxy(action: string) {
  const { data, error } = await supabase.functions.invoke('whatsapp-proxy', { body: { action } });
  if (error) throw error;
  return data;
}

export function WhatsAppConnectionSection() {
  const [state, setState] = useState<WaState>({ status: 'disconnected' });
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const pollStatus = () => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const data = await callWhatsAppProxy('status');
        setState((prev) => ({ ...prev, status: data.status, phone_number: data.phone_number }));
        if (data.status === 'connected' || data.status === 'disconnected' || data.status === 'failed') {
          stopPolling();
        }
      } catch (err) {
        console.error('Erro ao consultar status do WhatsApp:', err);
      }
    }, 3000);
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await callWhatsAppProxy('status');
        setState({ status: data.status, phone_number: data.phone_number });
        if (data.status === 'connecting') pollStatus();
      } catch (err) {
        console.error('Erro ao carregar sessão do WhatsApp:', err);
      } finally {
        setLoading(false);
      }
    })();
    return stopPolling;
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const data = await callWhatsAppProxy('connect');
      setState({ status: data.status, qrcode: data.qrcode });
      if (data.status === 'connecting') pollStatus();
    } catch (err) {
      console.error('Erro ao conectar WhatsApp:', err);
      toast({ title: 'Erro ao conectar', description: 'Não foi possível iniciar a conexão. Tente novamente.', variant: 'destructive' });
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    stopPolling();
    try {
      await callWhatsAppProxy('disconnect');
      setState({ status: 'disconnected' });
      toast({ title: 'WhatsApp desconectado' });
    } catch (err) {
      console.error('Erro ao desconectar WhatsApp:', err);
      toast({ title: 'Erro ao desconectar', description: 'Tente novamente em instantes.', variant: 'destructive' });
    }
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <MessageCircle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base sm:text-lg">WhatsApp</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Conecte seu WhatsApp para trocar mensagens com seus clientes
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Carregando...
          </div>
        ) : state.status === 'connected' ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span>
                Conectado{state.phone_number ? ` — ${state.phone_number}` : ''}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={handleDisconnect} className="gap-2 w-full sm:w-auto">
              <Unlink className="w-4 h-4" />
              Desconectar
            </Button>
          </div>
        ) : state.status === 'connecting' && state.qrcode?.base64 ? (
          <div className="flex flex-col items-center gap-3 py-2">
            <img src={state.qrcode.base64} alt="QR code de conexão do WhatsApp" className="w-48 h-48 rounded-lg border" />
            <p className="text-sm text-muted-foreground text-center">
              Abra o WhatsApp no seu celular, vá em Aparelhos conectados e escaneie o código acima.
            </p>
          </div>
        ) : state.status === 'connecting' ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Gerando QR code...
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Conecte o WhatsApp que você usa com seus clientes para enviar mensagens direto pelo Plushify.
            </p>
            <Button onClick={handleConnect} disabled={connecting} className="gap-2">
              {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
              Conectar WhatsApp
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
