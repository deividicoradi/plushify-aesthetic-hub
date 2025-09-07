import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Smartphone, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useWhatsAppRESTAPI } from '@/hooks/useWhatsAppRESTAPI';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function WhatsAppConnectionCard() {
  const { 
    session, 
    loading, 
    error, 
    connectWhatsApp, 
    disconnectWhatsApp, 
    getSessionStatus,
    clearError
  } = useWhatsAppRESTAPI();
  
  const [showQRModal, setShowQRModal] = useState(false);
  const [refreshingQR, setRefreshingQR] = useState(false);

  // Mostrar modal QR quando status for pareando
  useEffect(() => {
    if (session.status === 'pareando' && session.qr_code) {
      setShowQRModal(true);
    } else if (session.status === 'conectado') {
      setShowQRModal(false);
    }
  }, [session.status, session.qr_code]);

  const handleConnect = async () => {
    clearError();
    const success = await connectWhatsApp();
    if (success && session.status === 'pareando') {
      setShowQRModal(true);
    }
  };

  const handleDisconnect = async () => {
    setShowQRModal(false);
    await disconnectWhatsApp();
  };

  const handleRefreshQR = async () => {
    setRefreshingQR(true);
    try {
      await getSessionStatus();
    } catch (error) {
      console.warn('Erro ao atualizar QR:', error);
    } finally {
      setRefreshingQR(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'conectado':
        return <Wifi className="w-4 h-4 text-green-500" />;
      case 'pareando':
        return <Smartphone className="w-4 h-4 text-yellow-500" />;
      default:
        return <WifiOff className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'conectado':
        return 'Conectado';
      case 'pareando':
        return 'Aguardando QR Code';
      case 'conectando':
        return 'Conectando...';
      default:
        return 'Desconectado';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'conectado':
        return 'bg-green-500';
      case 'pareando':
        return 'bg-yellow-500';
      case 'conectando':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(session.status)}
            Status da Conexão WhatsApp
          </CardTitle>
          <Badge 
            variant="outline"
            className={`${getStatusColor(session.status)} text-white border-0`}
          >
            {getStatusText(session.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription className="flex items-center justify-between">
              <span>{error.message}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearError}
              >
                Fechar
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Connection Controls */}
        <div className="flex gap-2">
          {session.status === 'desconectado' && (
            <Button 
              onClick={handleConnect}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Conectar WhatsApp
            </Button>
          )}

          {session.status === 'conectado' && (
            <Button 
              onClick={handleDisconnect}
              variant="destructive"
              disabled={loading}
            >
              Desconectar
            </Button>
          )}

          {session.status === 'pareando' && (
            <Button 
              onClick={() => setShowQRModal(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              Ver QR Code
            </Button>
          )}
        </div>

        {/* QR Code Modal */}
        <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center">Conectar WhatsApp</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  1. Abra o WhatsApp no seu celular<br/>
                  2. Vá em Aparelhos conectados<br/>
                  3. Toque em "Conectar um aparelho"<br/>
                  4. Escaneie o código abaixo
                </p>
                
                {session.qr_code ? (
                  <div className="flex justify-center">
                    <div className="p-4 bg-white rounded-lg border">
                      <img 
                        src={session.qr_code} 
                        alt="QR Code WhatsApp" 
                        className="w-64 h-64"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <div className="p-8 bg-muted rounded-lg border flex flex-col items-center">
                      <Loader2 className="w-8 h-8 animate-spin mb-2" />
                      <span className="text-sm">Gerando QR Code...</span>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2 justify-center mt-4">
                  <Button 
                    onClick={handleRefreshQR}
                    variant="outline"
                    disabled={refreshingQR}
                    size="sm"
                  >
                    {refreshingQR ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Atualizar
                  </Button>
                  <Button 
                    onClick={() => setShowQRModal(false)}
                    variant="outline"
                    size="sm"
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Connected Status */}
        {session.status === 'conectado' && (
          <Alert>
            <Wifi className="h-4 w-4" />
            <AlertDescription>
              WhatsApp conectado com sucesso! Você pode agora enviar e receber mensagens.
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && session.status === 'conectando' && (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Conectando ao WhatsApp...</span>
          </div>
        )}

        {/* Connection Info */}
        <div className="text-sm text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>ID da Sessão:</span>
            <span className="font-mono">{session.session_id || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <span>{getStatusText(session.status)}</span>
          </div>
          {session.last_activity && (
            <div className="flex justify-between">
              <span>Última Atividade:</span>
              <span className="text-xs">{new Date(session.last_activity).toLocaleString()}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}