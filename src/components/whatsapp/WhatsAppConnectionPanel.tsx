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
            <div className="bg-white dark:bg-gray-100 p-4 rounded-lg mb-4 border">
              {session.qrCode ? (
                <img 
                  src={session.qrCode} 
                  alt="QR Code WhatsApp" 
                  className="w-full h-auto max-w-[200px] mx-auto"
                  onLoad={() => console.log('QR Code carregado com sucesso')}
                  onError={(e) => {
                    console.error('Erro ao carregar QR Code:', session.qrCode);
                    e.currentTarget.src = '/lovable-uploads/ff398e71-2a2a-4da0-9e55-7039622dc732.png';
                  }}
                />
              ) : (
                <div className="w-[200px] h-[200px] mx-auto bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <QrCode className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-500 text-sm">Gerando QR Code...</p>
                  </div>
                </div>
              )}
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-semibold">WhatsApp</span>
          <div className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-medium">
            WhatsApp Desconectado
          </div>
        </div>
      </div>

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

        {/* Aviso importante */}
        <Alert className="max-w-sm">
          <Wifi className="h-4 w-4" />
          <AlertDescription>
            <strong>Importante:</strong> Mantenha seu celular conectado à internet durante o uso.
          </AlertDescription>
        </Alert>

        {/* Botão de conectar */}
        <Button
          onClick={connectWhatsApp}
          disabled={loading}
          size="lg"
          className="w-full max-w-sm bg-green-500 hover:bg-green-600 text-white font-semibold"
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
      </div>
    </div>
  );
};