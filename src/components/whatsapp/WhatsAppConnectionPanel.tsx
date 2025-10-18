import React, { useEffect, useState } from 'react';
import { QrCode, Smartphone, Wifi, MessageCircle, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useWhatsApp, WhatsAppSession } from '@/hooks/useWhatsApp';

interface PanelProps {
  session?: WhatsAppSession;
  connectWhatsApp?: () => Promise<void>;
  loading?: boolean;
}

export const WhatsAppConnectionPanel: React.FC<PanelProps> = ({ session: sessionProp, connectWhatsApp: connectProp, loading: loadingProp }) => {
  const hook = useWhatsApp();
  const session = sessionProp ?? hook.session;
  const connectWhatsApp = connectProp ?? hook.connectWhatsApp;
  const disconnectWhatsApp = hook.disconnectWhatsApp;
  const loading = loadingProp ?? hook.loading;
  const [progress, setProgress] = useState(0);

  console.log('WhatsApp Connection Panel - Session:', session);
  console.log('WhatsApp Connection Panel - Status:', session.status);

  // Manter o QR Code e status atualizados durante o pareamento
  useEffect(() => {
    if (session.status === 'pareando' || session.status === 'conectando') {
      const id = setInterval(() => {
        hook.getSessionStatus();
      }, 3000); // Verificar a cada 3 segundos
      return () => clearInterval(id);
    }
  }, [session.status, hook]);

  // Simular progresso quando em estado de pareamento
  useEffect(() => {
    if (session.status === 'pareando' || session.status === 'conectando') {
      const interval = setInterval(() => {
        setProgress(prev => (prev >= 90 ? 20 : prev + 10));
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [session.status]);

  const getStatusColor = () => {
    switch (session.status) {
      case 'conectado':
        return 'bg-green-500';
      case 'conectando':
      case 'pareando':
        return 'bg-yellow-500';
      default:
        return 'bg-red-500';
    }
  };

  const getStatusText = () => {
    switch (session.status) {
      case 'conectado':
        return 'Conectado';
      case 'conectando':
        return 'Conectando';
      case 'pareando':
        return 'Aguardando QR Code';
      default:
        return 'Desconectado';
    }
  };

  // WhatsApp Cloud API não usa QR Code - conexão automática via credenciais
  if (session.status === 'conectando') {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center space-y-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto">
            <Wifi className="w-8 h-8 text-yellow-600 dark:text-yellow-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Verificando Credenciais...</h3>
            <p className="text-muted-foreground">Testando conexão com WhatsApp Cloud API</p>
          </div>
          <Progress value={30} className="w-full max-w-xs mx-auto" />
        </div>
      </div>
    );
  }

  // Main connection screen
  return (
    <div className="flex-1 bg-background">
      {/* Conteúdo principal */}
      <div className="flex flex-col items-center justify-center p-8 space-y-8">
        {/* Ícone grande do WhatsApp */}
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center">
          <MessageCircle className="w-12 h-12 text-white" />
        </div>

        {/* Título e descrição */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold text-foreground">WhatsApp Business</h1>
          <p className="text-muted-foreground text-center max-w-sm">
            Conecte seu WhatsApp para começar a conversar com seus clientes
          </p>
        </div>

        {/* Cards de recursos */}
        <div className="w-full max-w-sm space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-lg border bg-card/50">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Conecte seu celular</h3>
              <p className="text-sm text-muted-foreground">
                Use o WhatsApp do seu celular para se conectar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-lg border bg-card/50">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Converse com clientes</h3>
              <p className="text-sm text-muted-foreground">
                Envie e receba mensagens diretamente do sistema
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-lg border bg-card/50">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0">
              <QrCode className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Histórico integrado</h3>
              <p className="text-sm text-muted-foreground">
                Todas as conversas ficam salvas no sistema
              </p>
            </div>
          </div>
        </div>

        {/* Status da conexão */}
        <div className="flex items-center justify-between p-4 border rounded-lg max-w-sm w-full">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
            <div>
              <h4 className="font-medium">Status da Conexão</h4>
              <p className="text-sm text-muted-foreground">
                {session.status === 'conectado' 
                  ? 'WhatsApp conectado e funcionando'
                  : 'WhatsApp não está conectado'
                }
              </p>
            </div>
          </div>
          <Badge variant="secondary">
            {getStatusText()}
          </Badge>
        </div>

        {/* Aviso importante */}
        <Alert className="max-w-sm">
          <Wifi className="h-4 w-4" />
          <AlertDescription>
            <strong>Importante:</strong> Mantenha seu celular conectado à internet durante o uso.
          </AlertDescription>
        </Alert>

        {/* Botões de ação */}
        <div className="flex gap-2 w-full max-w-sm">
          {session.status === 'conectado' ? (
            <Button
              onClick={disconnectWhatsApp}
              disabled={loading}
              variant="destructive"
              size="lg"
              className="flex-1"
            >
              <WifiOff className="w-5 h-5 mr-2" />
              Desconectar
            </Button>
          ) : (
            <Button
              onClick={connectWhatsApp}
              disabled={loading}
              size="lg"
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                  Conectando...
                </>
              ) : (
                <>
                  <QrCode className="w-5 h-5 mr-3" />
                  Conectar WhatsApp
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};