import React, { useEffect, useState } from 'react';
import { MessageCircle, Smartphone, Wifi, WifiOff, Settings, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { WhatsAppMonitoring } from './WhatsAppMonitoring';
import { WhatsAppChat } from './WhatsAppChat';

export const WhatsAppSettings: React.FC = () => {
  const { session, contacts, messages, connectWhatsApp, disconnectWhatsApp, loading } = useWhatsApp();
  
  console.log('WhatsApp Settings - Session:', session);
  console.log('WhatsApp Settings - Status:', session.status);
  if (session.qr_code) {
    console.log('WhatsApp Settings - QR Code disponível:', session.qr_code);
  }

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
        return 'Pareando';
      default:
        return 'Desconectado';
    }
  };

  const totalMessages = messages.length;
  const sentMessages = messages.filter(m => m.direction === 'sent').length;
  const receivedMessages = messages.filter(m => m.direction === 'received').length;

  return (
    <Tabs defaultValue="chat" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="chat" className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          Chat
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Configurações
        </TabsTrigger>
        <TabsTrigger value="monitoring" className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Monitoramento
        </TabsTrigger>
      </TabsList>

      <TabsContent value="chat" className="mt-6">
        <WhatsAppChat />
      </TabsContent>

      <TabsContent value="settings" className="mt-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-green-600" />
                Status do WhatsApp
              </CardTitle>
              <CardDescription>
                Configurações e informações da conexão com WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status da conexão */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
                  <div>
                    <h4 className="font-medium">Status da Conexão</h4>
                    <p className="text-sm text-muted-foreground">
                      {session.status === 'conectado' 
                        ? 'WhatsApp conectado e funcionando'
                        : session.status === 'pareando' 
                        ? 'Pareando com WhatsApp - Escaneie o QR Code'
                        : 'WhatsApp não está conectado'
                      }
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">
                  {getStatusText()}
                </Badge>
              </div>

              {/* QR Code quando estiver pareando */}
              {session.status === 'pareando' && session.qr_code && typeof session.qr_code === 'string' && (
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-green-300 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <h3 className="text-lg font-semibold mb-4 text-green-800 dark:text-green-200">
                    QR Code Gerado
                  </h3>
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <img 
                      src={session.qr_code} 
                      alt="QR Code do WhatsApp" 
                      className="w-64 h-64 mx-auto"
                    />
                  </div>
                  <p className="text-sm text-center text-green-700 dark:text-green-300 mt-4 max-w-md">
                    <strong>Escaneie o QR Code com seu WhatsApp para conectar</strong>
                    <br />
                    1. Abra o WhatsApp no seu celular
                    <br />
                    2. Vá em Menu → Dispositivos conectados
                    <br />
                    3. Toque em "Conectar um dispositivo"
                    <br />
                    4. Aponte a câmera para este QR Code
                  </p>
                </div>
              )}

              {/* Indicador de carregamento do QR Code */}
              {session.status === 'pareando' && !session.qr_code && (
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-yellow-300 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mb-4"></div>
                  <p className="text-sm text-center text-yellow-700 dark:text-yellow-300">
                    Gerando QR Code... Aguarde um momento.
                  </p>
                </div>
              )}

              {/* Ações */}
              <div className="flex gap-2">
                {session.status === 'conectado' ? (
                  <Button
                    onClick={disconnectWhatsApp}
                    disabled={loading}
                    variant="destructive"
                  >
                    <WifiOff className="h-4 w-4 mr-2" />
                    Desconectar
                  </Button>
                ) : (
                  <Button
                    onClick={connectWhatsApp}
                    disabled={loading}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <Wifi className="h-4 w-4 mr-2" />
                    {loading ? 'Conectando...' : 'Conectar WhatsApp'}
                  </Button>
                )}
              </div>

              <Separator />

              {/* Estatísticas */}
              <div>
                <h4 className="font-medium mb-4">Estatísticas</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{contacts.length}</div>
                    <div className="text-sm text-muted-foreground">Contatos</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{sentMessages}</div>
                    <div className="text-sm text-muted-foreground">Enviadas</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{receivedMessages}</div>
                    <div className="text-sm text-muted-foreground">Recebidas</div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Informações importantes */}
              <div className="space-y-3">
                <h4 className="font-medium">Informações Importantes</h4>
                
                <Alert>
                  <Smartphone className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Celular conectado:</strong> Mantenha seu celular com WhatsApp conectado à internet para que o sistema funcione corretamente.
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <Settings className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Sessão única:</strong> Apenas um dispositivo pode estar conectado por vez. Desconectar aqui não afeta seu WhatsApp principal.
                  </AlertDescription>
                </Alert>
                
                {session.status !== 'conectado' && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Funcionalidade limitada:</strong> Para enviar e receber mensagens, é necessário conectar o WhatsApp primeiro.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Informações sobre o servidor */}
          <Card>
            <CardHeader>
              <CardTitle>Servidor WhatsApp VPS</CardTitle>
              <CardDescription>Configuração do servidor externo WhatsApp</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Servidor VPS Configurado</p>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                    URL do servidor: <code className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-xs font-mono">http://31.97.30.241:8787</code>
                  </p>
                  <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded">
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      <strong>📁 Localização da configuração:</strong> Esta URL está definida no arquivo:
                      <br />
                      <code className="font-mono">src/hooks/useWhatsAppIntegration.ts</code> (linha 38)
                      <br />
                      <br />
                      <strong>Para alterar o servidor:</strong> Modifique a constante <code>WHATSAPP_SERVER_URL</code> neste arquivo.
                    </p>
                  </div>
                </div>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Servidor externo:</strong> Este sistema usa um servidor Node.js rodando em VPS para gerenciar as conexões WhatsApp Web.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* Recursos Disponíveis */}
          <Card>
            <CardHeader>
              <CardTitle>Recursos Disponíveis</CardTitle>
              <CardDescription>
                Funcionalidades da integração WhatsApp direta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-sm mb-2 text-green-800 dark:text-green-200">
                  ✅ Recursos Implementados
                </h4>
                <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
                  <li>• Conexão direta com WhatsApp Web</li>
                  <li>• Interface de chat integrada na aplicação</li>
                  <li>• Gerenciamento de contatos automático</li>
                  <li>• Histórico completo de mensagens</li>
                  <li>• Envio e recebimento em tempo real</li>
                  <li>• Monitoramento de status da conexão</li>
                </ul>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Vantagem:</strong> Esta solução é mais simples que usar Chatwoot, 
                  pois integra o chat diretamente na sua aplicação sem depender de sistemas externos.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="monitoring" className="mt-6">
        <WhatsAppMonitoring />
      </TabsContent>
    </Tabs>
  );
};