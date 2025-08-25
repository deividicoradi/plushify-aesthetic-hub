import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Smartphone, Wifi, WifiOff, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { useWhatsAppIntegration } from '@/hooks/useWhatsAppIntegration';
import { useState, useEffect } from 'react';

export const WhatsAppConnectionCard = () => {
  const { 
    session, 
    loading, 
    error, 
    connectWhatsApp, 
    disconnectWhatsApp, 
    retry,
    clearError 
  } = useWhatsAppIntegration();
  
  const [qrProgress, setQrProgress] = useState(0);

  // QR code progress simulation
  useEffect(() => {
    if (session.status === 'pareando' && session.qrCode) {
      const interval = setInterval(() => {
        setQrProgress(prev => (prev >= 100 ? 0 : prev + 2));
      }, 100);
      return () => clearInterval(interval);
    } else {
      setQrProgress(0);
    }
  }, [session.status, session.qrCode]);

  const getStatusIcon = () => {
    switch (session.status) {
      case 'conectado':
        return <Wifi className="w-5 h-5 text-green-500" />;
      case 'pareando':
        return <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />;
      default:
        return <WifiOff className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (session.status) {
      case 'conectado':
        return 'Conectado';
      case 'pareando':
        return 'Pareando';
      default:
        return 'Desconectado';
    }
  };

  const getStatusVariant = () => {
    switch (session.status) {
      case 'conectado':
        return 'default';
      case 'pareando':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (session.status === 'pareando' && session.qrCode) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Smartphone className="w-5 h-5" />
            Conectar WhatsApp
          </CardTitle>
          <CardDescription>
            Escaneie o QR Code com seu celular
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-white rounded-lg border-2 border-dashed border-border">
              <img 
                src={session.qrCode} 
                alt="QR Code WhatsApp"
                className="w-48 h-48 object-contain"
                style={{ imageRendering: 'crisp-edges' }}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Atualizando QR Code...</span>
              <span>{Math.round(qrProgress)}%</span>
            </div>
            <Progress value={qrProgress} className="h-2" />
          </div>

          <Alert>
            <Smartphone className="h-4 w-4" />
            <AlertDescription>
              1. Abra o WhatsApp no seu celular<br/>
              2. Toque em <strong>Menu</strong> ou <strong>Configurações</strong><br/>
              3. Toque em <strong>Aparelhos conectados</strong><br/>
              4. Toque em <strong>Conectar um aparelho</strong><br/>
              5. Aponte a câmera para este código
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={connectWhatsApp}
              disabled={loading}
              className="flex-1"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Gerar Novo QR
            </Button>
            <Button 
              variant="ghost" 
              onClick={disconnectWhatsApp}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            WhatsApp Business
          </CardTitle>
          <Badge variant={getStatusVariant()} className="flex items-center gap-1">
            {getStatusIcon()}
            {getStatusText()}
          </Badge>
        </div>
        <CardDescription>
          Conecte seu WhatsApp para enviar mensagens diretamente do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error.message}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={retry}
                className="ml-2"
              >
                Tentar Novamente
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-1">
            <div className="font-medium text-foreground">Recursos</div>
            <ul className="text-muted-foreground space-y-1">
              <li>• Envio de mensagens</li>
              <li>• Histórico de conversas</li>
              <li>• Sincronização em tempo real</li>
            </ul>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-foreground">Segurança</div>
            <ul className="text-muted-foreground space-y-1">
              <li>• Criptografia ponta a ponta</li>
              <li>• Dados privados</li>
              <li>• Sessão segura</li>
            </ul>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-foreground">Status</div>
            <ul className="text-muted-foreground space-y-1">
              <li>• ID: {session.id || 'Não conectado'}</li>
              <li>• Pronto: {session.ready ? 'Sim' : 'Não'}</li>
              <li>• Última atualização: {new Date().toLocaleTimeString()}</li>
            </ul>
          </div>
        </div>

        {session.status === 'conectado' && (
          <Alert>
            <Wifi className="h-4 w-4" />
            <AlertDescription>
              WhatsApp conectado com sucesso! Você pode enviar mensagens através do sistema.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          {session.status === 'conectado' ? (
            <Button 
              variant="destructive" 
              onClick={disconnectWhatsApp}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <WifiOff className="w-4 h-4 mr-2" />
              )}
              Desconectar
            </Button>
          ) : (
            <Button 
              onClick={connectWhatsApp}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Wifi className="w-4 h-4 mr-2" />
              )}
              Conectar WhatsApp
            </Button>
          )}
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Importante:</strong> Mantenha seu celular conectado à internet. 
            A sessão será mantida enquanto o WhatsApp estiver ativo no seu dispositivo.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};