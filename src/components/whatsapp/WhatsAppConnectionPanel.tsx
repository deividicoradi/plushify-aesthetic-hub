import React from 'react';
import { QrCode, Smartphone, Wifi, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useWhatsApp } from '@/hooks/useWhatsApp';

export const WhatsAppConnectionPanel: React.FC = () => {
  const { session, connectWhatsApp, loading } = useWhatsApp();

  if (session.status === 'pareando' && session.qrCode) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center space-y-6">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle>Escaneie o QR Code</CardTitle>
            <CardDescription>
              Use o WhatsApp no seu celular para escanear o código
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="bg-white p-4 rounded-lg mb-4">
              <img 
                src={session.qrCode} 
                alt="QR Code WhatsApp" 
                className="w-full h-auto max-w-[200px] mx-auto"
              />
            </div>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 justify-center">
                <Smartphone className="w-4 h-4" />
                <span>Abra o WhatsApp no seu celular</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <QrCode className="w-4 h-4" />
                <span>Toque em Menu → Dispositivos conectados</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <Wifi className="w-4 h-4" />
                <span>Escaneie este código QR</span>
              </div>
            </div>

            <Progress value={60} className="mt-4" />
            <p className="text-xs text-muted-foreground mt-2">
              Aguardando pareamento...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (session.status === 'conectando') {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center space-y-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto">
            <Wifi className="w-8 h-8 text-yellow-600 dark:text-yellow-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Conectando...</h3>
            <p className="text-muted-foreground">Estabelecendo conexão com WhatsApp</p>
          </div>
          <Progress value={30} className="w-full max-w-xs mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 flex flex-col justify-center space-y-6">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
          <MessageCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">WhatsApp Business</h2>
          <p className="text-muted-foreground">
            Conecte seu WhatsApp para começar a conversar com seus clientes
          </p>
        </div>
      </div>

      <Card className="w-full">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Smartphone className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-medium">Conecte seu celular</h4>
                <p className="text-sm text-muted-foreground">
                  Use o WhatsApp do seu celular para se conectar
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <MessageCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-medium">Converse com clientes</h4>
                <p className="text-sm text-muted-foreground">
                  Envie e receba mensagens diretamente do sistema
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <QrCode className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h4 className="font-medium">Histórico integrado</h4>
                <p className="text-sm text-muted-foreground">
                  Todas as conversas ficam salvas no sistema
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Wifi className="h-4 w-4" />
        <AlertDescription>
          <strong>Importante:</strong> Mantenha seu celular conectado à internet durante o uso.
        </AlertDescription>
      </Alert>

      <Button
        onClick={connectWhatsApp}
        disabled={loading}
        size="lg"
        className="w-full bg-green-500 hover:bg-green-600"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Conectando...
          </>
        ) : (
          <>
            <QrCode className="w-5 h-5 mr-2" />
            Conectar WhatsApp
          </>
        )}
      </Button>
    </div>
  );
};