import React from 'react';
import { MessageCircle, Smartphone, Wifi, WifiOff, Settings, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useWhatsApp } from '@/hooks/useWhatsApp';

export const WhatsAppSettings: React.FC = () => {
  const { session, contacts, messages, connectWhatsApp, disconnectWhatsApp, loading } = useWhatsApp();

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
      
      {/* Configurações avançadas */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações Avançadas</CardTitle>
          <CardDescription>
            Configurações adicionais do WhatsApp Business
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Mensagem de boas-vindas</h4>
              <p className="text-sm text-muted-foreground">
                Enviar mensagem automática para novos contatos
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Em breve
            </Button>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Resposta automática</h4>
              <p className="text-sm text-muted-foreground">
                Configurar mensagens automáticas fora do expediente
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Em breve
            </Button>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Integração com agendamentos</h4>
              <p className="text-sm text-muted-foreground">
                Enviar lembretes automáticos de consultas
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Em breve
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};