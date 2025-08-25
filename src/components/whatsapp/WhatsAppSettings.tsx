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
  const [serverUrl, setServerUrl] = useState<string>('');
  useEffect(() => { setServerUrl(localStorage.getItem('WHATSAPP_SERVER_URL') || ''); }, []);

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
  const sentMessages = messages.filter(m => m.direcao === 'enviada').length;
  const receivedMessages = messages.filter(m => m.direcao === 'recebida').length;

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
                        : 'WhatsApp não está conectado'
                      }
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">
                  {getStatusText()}
                </Badge>
              </div>

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
              <CardTitle>Servidor WhatsApp</CardTitle>
              <CardDescription>Integração automática com WhatsApp Web</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Servidor Configurado</p>
                    <p className="text-xs text-muted-foreground">https://whatsapp.plushify.com.br</p>
                  </div>
                </div>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Configuração automática:</strong> O servidor WhatsApp está pré-configurado. 
                    Basta clicar em "Conectar WhatsApp" para começar a usar.
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