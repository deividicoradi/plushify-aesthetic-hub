import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  QrCode, 
  Smartphone, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface QRConnectionStatus {
  status: 'disconnected' | 'qr_ready' | 'connecting' | 'connected' | 'error';
  qr?: string;
  message?: string;
  sessionId?: string;
}

const WhatsAppQRScanner = () => {
  const [connectionStatus, setConnectionStatus] = useState<QRConnectionStatus>({
    status: 'disconnected'
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Verificar se já existe uma sessão ativa
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-session', {
        body: { action: 'status' }
      });

      if (data?.status) {
        setConnectionStatus({
          status: data.status === 'open' ? 'connected' : 'disconnected',
          sessionId: data.sessionId,
          message: data.message
        });
      }
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
    }
  };

  const startConnection = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-session', {
        body: { action: 'start' }
      });

      if (error) {
        throw error;
      }

      if (data?.qr) {
        setConnectionStatus({
          status: 'qr_ready',
          qr: data.qr,
          sessionId: data.sessionId
        });
        
        // Iniciar polling para verificar status da conexão
        startStatusPolling(data.sessionId);
      }
    } catch (error) {
      console.error('Erro ao iniciar conexão:', error);
      setConnectionStatus({
        status: 'error',
        message: 'Erro ao gerar QR Code. Tente novamente.'
      });
      toast.error('Erro ao conectar WhatsApp');
    } finally {
      setIsLoading(false);
    }
  };

  const startStatusPolling = (sessionId: string) => {
    const interval = setInterval(async () => {
      try {
        const { data } = await supabase.functions.invoke('whatsapp-session', {
          body: { action: 'status', sessionId }
        });

        if (data?.status === 'open') {
          setConnectionStatus({
            status: 'connected',
            sessionId,
            message: 'WhatsApp conectado com sucesso!'
          });
          clearInterval(interval);
          toast.success('WhatsApp conectado!');
        } else if (data?.status === 'close') {
          setConnectionStatus({
            status: 'error',
            message: 'Conexão perdida. Reconecte seu WhatsApp.'
          });
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Erro no polling:', error);
        clearInterval(interval);
      }
    }, 3000);

    // Limpar polling após 2 minutos
    setTimeout(() => clearInterval(interval), 120000);
  };

  const disconnect = async () => {
    try {
      await supabase.functions.invoke('whatsapp-session', {
        body: { action: 'logout', sessionId: connectionStatus.sessionId }
      });

      setConnectionStatus({ status: 'disconnected' });
      toast.success('WhatsApp desconectado');
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      toast.error('Erro ao desconectar');
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus.status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'connecting':
      case 'qr_ready':
        return <Wifi className="w-5 h-5 text-blue-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <WifiOff className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = () => {
    switch (connectionStatus.status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400">Conectado</Badge>;
      case 'qr_ready':
        return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400">Aguardando Scan</Badge>;
      case 'connecting':
        return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400">Conectando</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      default:
        return <Badge variant="secondary">Desconectado</Badge>;
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          {getStatusIcon()}
          Conexão WhatsApp
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="connection" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="connection">Conexão</TabsTrigger>
            <TabsTrigger value="instructions">Como Usar</TabsTrigger>
          </TabsList>

          <TabsContent value="connection" className="space-y-6">
            {connectionStatus.status === 'disconnected' && (
              <div className="text-center space-y-4">
                <div className="p-6 bg-accent/50 rounded-lg">
                  <Smartphone className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2 text-foreground">Conecte seu WhatsApp</h3>
                  <p className="text-muted-foreground text-sm">
                    Escaneie o QR Code com seu WhatsApp para conectar e enviar mensagens automáticas
                  </p>
                </div>
                <Button 
                  onClick={startConnection} 
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Gerando QR Code...
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4 mr-2" />
                      Conectar WhatsApp
                    </>
                  )}
                </Button>
              </div>
            )}

            {connectionStatus.status === 'qr_ready' && connectionStatus.qr && (
              <div className="text-center space-y-4">
                <div className="p-4 bg-background rounded-lg border-2 border-dashed border-border inline-block">
                  <img 
                    src={connectionStatus.qr} 
                    alt="QR Code WhatsApp"
                    className="w-64 h-64 mx-auto"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-foreground">Escaneie o QR Code</h3>
                  <p className="text-muted-foreground text-sm">
                    1. Abra o WhatsApp no seu celular<br/>
                    2. Toque em "Dispositivos vinculados"<br/>
                    3. Toque em "Vincular um dispositivo"<br/>
                    4. Escaneie este QR Code
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={startConnection}
                  size="sm"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Gerar Novo QR
                </Button>
              </div>
            )}

            {connectionStatus.status === 'connected' && (
              <div className="text-center space-y-4">
                <div className="p-6 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4" />
                  <h3 className="text-lg font-medium text-green-800 dark:text-green-400 mb-2">
                    WhatsApp Conectado!
                  </h3>
                  <p className="text-green-700 dark:text-green-300 text-sm">
                    Agora você pode enviar mensagens automáticas para seus clientes
                  </p>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={checkExistingSession} size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Verificar Status
                  </Button>
                  <Button variant="destructive" onClick={disconnect} size="sm">
                    Desconectar
                  </Button>
                </div>
              </div>
            )}

            {connectionStatus.status === 'error' && (
              <div className="text-center space-y-4">
                <div className="p-6 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <AlertCircle className="w-16 h-16 mx-auto text-red-600 mb-4" />
                  <h3 className="text-lg font-medium text-red-800 dark:text-red-400 mb-2">
                    Erro na Conexão
                  </h3>
                  <p className="text-red-700 dark:text-red-300 text-sm">
                    {connectionStatus.message || 'Houve um problema ao conectar o WhatsApp'}
                  </p>
                </div>
                <Button onClick={startConnection} size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar Novamente
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="instructions" className="space-y-4">
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-3 text-foreground">Como funciona?</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>• Conecte seu WhatsApp pessoal ou comercial via QR Code</p>
                  <p>• O sistema usa seu WhatsApp para enviar mensagens automáticas</p>
                  <p>• Mensagens são enviadas através da sua conta, mantendo legitimidade</p>
                  <p>• Você mantém controle total sobre as mensagens enviadas</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3 text-foreground">Vantagens</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>✅ Sem custos por mensagem</p>
                  <p>✅ Usa seu próprio WhatsApp</p>
                  <p>✅ Maior taxa de entrega</p>
                  <p>✅ Controle total sobre automações</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3 text-foreground">Importante</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>⚠️ Mantenha o WhatsApp conectado no celular</p>
                  <p>⚠️ Use com moderação para evitar bloqueios</p>
                  <p>⚠️ Respeite as políticas do WhatsApp</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default WhatsAppQRScanner;
