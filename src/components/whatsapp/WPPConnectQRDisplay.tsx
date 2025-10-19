import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, RefreshCw, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface WPPConnectQRDisplayProps {
  sessionStatus: string;
  onRefresh?: () => void;
}

export const WPPConnectQRDisplay: React.FC<WPPConnectQRDisplayProps> = ({ 
  sessionStatus,
  onRefresh 
}) => {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const response = await supabase
          .from('whatsapp_sessions' as any)
          .select('qr_code, status')
          .eq('user_id', user.id)
          .single();

        const session = response.data as any;
        
        if (session?.qr_code) {
          setQrCode(session.qr_code);
        }
      } catch (error) {
        console.error('Error fetching QR code:', error);
      }
    };

    if (sessionStatus === 'pareando') {
      fetchQRCode();

      // Poll for QR code updates
      const interval = setInterval(fetchQRCode, 5000);
      return () => clearInterval(interval);
    } else {
      setQrCode(null);
    }
  }, [sessionStatus]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
    } finally {
      setLoading(false);
    }
  };

  if (sessionStatus === 'conectado') {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-green-700 dark:text-green-300">WhatsApp Conectado!</CardTitle>
          <CardDescription className="text-green-600 dark:text-green-400">
            Sua sessão está ativa e pronta para enviar mensagens
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (sessionStatus !== 'pareando' || !qrCode) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <QrCode className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <CardTitle>Escaneie o QR Code</CardTitle>
        <CardDescription>
          Abra o WhatsApp no seu celular e escaneie o código abaixo
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-white p-4 rounded-lg flex justify-center">
          <img 
            src={qrCode} 
            alt="QR Code WhatsApp" 
            className="w-64 h-64 object-contain"
          />
        </div>
        
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="font-semibold">Como conectar:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Abra o WhatsApp no seu celular</li>
            <li>Toque em Menu (⋮) ou Configurações</li>
            <li>Selecione "Aparelhos conectados"</li>
            <li>Toque em "Conectar um aparelho"</li>
            <li>Aponte o celular para esta tela</li>
          </ol>
        </div>

        <Button 
          onClick={handleRefresh}
          disabled={loading}
          variant="outline"
          className="w-full"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Atualizando...' : 'Atualizar QR Code'}
        </Button>
      </CardContent>
    </Card>
  );
};
