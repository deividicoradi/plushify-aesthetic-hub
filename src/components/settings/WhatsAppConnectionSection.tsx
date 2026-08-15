import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, Loader2, Unplug, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type WaStatus = 'disconnected' | 'connecting' | 'connected' | 'failed';

// Fluxo: connect() cria/inicia a sessão no gateway OpenWA -> poll de status
// a cada 3s mostrando o QR code até status virar "connected" -> para o poll.
// Tudo passa pela edge function whatsapp-proxy; o front nunca vê a API key
// do OpenWA nem fala direto com o gateway.
export function WhatsAppConnectionSection() {
  const [status, setStatus] = useState<WaStatus>('disconnected');
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const loadCurrentSession = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('wa_sessions')
      .select('status, phone_number')
      .maybeSingle();
    if (!error && data) {
      setStatus(data.status as WaStatus);
      setPhoneNumber(data.phone_number);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCurrentSession();
    return () => stopPolling();
  }, []);

  const pollStatus = () => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      const { data, error } = await supabase.functions.invoke('whatsapp-proxy', {
        body: { action: 'status' },
      });
      if (error) return;

      const connected = data?.status?.status === 'connected' || data?.status?.connected === true;
      if (connected) {
        setStatus('connected');
        setPhoneNumber(data?.status?.phoneNumber ?? data?.status?.phone ?? null);
        setQrImage(null);
        stopPolling();
        toast({ title: 'WhatsApp conectado!', description: 'Agora você pode enviar mensagens para seus clientes.' });
        return;
      }

      // Ainda conectando: busca um QR code novo (ele expira e é rotacionado pelo gateway).
      const { data: qrData } = await supabase.functions.invoke('whatsapp-proxy', {
        body: { action: 'qr' },
      });
      const qrValue = qrData?.qr?.qr ?? qrData?.qr?.image ?? qrData?.qr?.data ?? null;
      if (qrValue) setQrImage(qrValue);
    }, 3000);
  };

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-proxy', {
        body: { action: 'connect' },
      });
      if (error || data?.error) {
        throw new Error(data?.error || error?.message || 'Falha ao conectar');
      }
      setStatus('connecting');
      pollStatus();
    } catch (err: any) {
      toast({ title: 'Erro ao conectar WhatsApp', description: err.message, variant: 'destructive' });
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-proxy', {
        body: { action: 'disconnect' },
      });
      if (error || data?.error) {
        throw new Error(data?.error || error?.message || 'Falha ao desconectar');
      }
      stopPolling();
      setStatus('disconnected');
      setPhoneNumber(null);
      setQrImage(null);
      toast({ title: 'WhatsApp desconectado' });
    } catch (err: any) {
      toast({ title: 'Erro ao desconectar', description: err.message, variant: 'destructive' });
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        Carregando status do WhatsApp...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-semibold">WhatsApp</h3>
        {status === 'connected' && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-destructive hover:text-destructive"
            onClick={handleDisconnect}
            disabled={disconnecting}
          >
            {disconnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unplug className="w-4 h-4" />}
            Desconectar
          </Button>
        )}
        {status === 'disconnected' && (
          <Button onClick={handleConnect} size="sm" className="gap-2" disabled={connecting}>
            {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
            Conectar WhatsApp
          </Button>
        )}
      </div>

      {status === 'connected' && (
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          Conectado{phoneNumber ? ` — ${phoneNumber}` : ''}. Lembretes de agendamento serão enviados por este número.
        </p>
      )}

      {status === 'disconnected' && (
        <p className="text-sm text-muted-foreground">
          Conecte o WhatsApp do seu negócio para enviar lembretes automáticos de agendamento aos seus clientes.
        </p>
      )}

      {status === 'connecting' && (
        <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
          <p className="text-sm font-medium">Abra o WhatsApp no celular e escaneie o QR code</p>
          <p className="text-xs text-muted-foreground">Menu → Aparelhos conectados → Conectar um aparelho</p>
          {qrImage ? (
            <div className="w-48 h-48 bg-white p-2 rounded">
              <img src={qrImage} alt="QR code para conectar o WhatsApp" className="w-full h-full" />
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Gerando QR code...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
