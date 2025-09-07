import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWhatsAppRESTAPI } from '@/hooks/useWhatsAppRESTAPI';
import EnhancedQRCodeDisplay from './EnhancedQRCodeDisplay';
import EnhancedStatusIndicator from './EnhancedStatusIndicator';
import EnhancedMessageSender from './EnhancedMessageSender';
import WhatsAppNotificationCenter from './WhatsAppNotificationCenter';
import { 
  Wifi, 
  WifiOff, 
  MessageSquare 
} from 'lucide-react';

export const WhatsAppConnectionCard: React.FC = () => {
  const { 
    session, 
    connectWhatsApp, 
    disconnectWhatsApp, 
    sendMessage,
    getSessionStatus,
    loading,
    messages,
    stats
  } = useWhatsAppRESTAPI();

  const isConnected = session.status === 'conectado';
  const connectionQuality = isConnected ? 'good' : 'unknown';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                WhatsApp Business
              </CardTitle>
              <CardDescription>
                Gerencie sua conexão e envie mensagens
              </CardDescription>
            </div>
            <WhatsAppNotificationCenter />
          </div>
        </CardHeader>
        
        <CardContent>
          <EnhancedStatusIndicator
            status={session.status}
            lastActivity={session.last_activity}
            connectionQuality={connectionQuality}
            messageCount={messages.length}
            showDetails={true}
          />
        </CardContent>
      </Card>

      {/* Connection Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Code / Connection */}
        <div>
          {session.status === 'pareando' || session.status === 'conectando' ? (
            <EnhancedQRCodeDisplay
              qrCode={session.qr_code}
              status={session.status}
              onRefresh={getSessionStatus}
              isLoading={loading}
            />
          ) : (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  {isConnected ? (
                    <Wifi className="w-5 h-5 text-green-500" />
                  ) : (
                    <WifiOff className="w-5 h-5 text-gray-500" />
                  )}
                  Conexão WhatsApp
                </CardTitle>
                <CardDescription>
                  {isConnected 
                    ? 'Sua sessão está ativa e funcionando'
                    : 'Conecte seu WhatsApp para começar a usar'
                  }
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-center">
                  <EnhancedStatusIndicator
                    status={session.status}
                    lastActivity={session.last_activity}
                    connectionQuality={connectionQuality}
                    messageCount={messages.length}
                    showDetails={false}
                  />
                </div>
                
                <div className="flex gap-2">
                  {!isConnected ? (
                    <Button 
                      onClick={connectWhatsApp} 
                      disabled={loading}
                      className="flex-1 hover-scale transition-all duration-200"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Conectando...
                        </>
                      ) : (
                        <>
                          <Wifi className="w-4 h-4 mr-2" />
                          Conectar WhatsApp
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button 
                      variant="destructive"
                      onClick={disconnectWhatsApp} 
                      disabled={loading}
                      className="flex-1 hover-scale transition-all duration-200"
                    >
                      <WifiOff className="w-4 h-4 mr-2" />
                      Desconectar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Message Sender */}
        <div>
          <EnhancedMessageSender
            onSendMessage={sendMessage}
            isConnected={isConnected}
            isLoading={loading}
          />
        </div>
      </div>

      {/* Stats Summary */}
      {isConnected && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base">Resumo da Sessão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="hover-scale transition-all duration-200">
                <div className="text-2xl font-bold text-blue-600">{stats.total_contacts}</div>
                <div className="text-sm text-muted-foreground">Contatos</div>
              </div>
              <div className="hover-scale transition-all duration-200">
                <div className="text-2xl font-bold text-green-600">{stats.messages_sent}</div>
                <div className="text-sm text-muted-foreground">Enviadas</div>
              </div>
              <div className="hover-scale transition-all duration-200">
                <div className="text-2xl font-bold text-purple-600">{stats.messages_received}</div>
                <div className="text-sm text-muted-foreground">Recebidas</div>
              </div>
              <div className="hover-scale transition-all duration-200">
                <div className="text-2xl font-bold text-orange-600">
                  {stats.messages_sent + stats.messages_received > 0 
                    ? Math.round((stats.messages_received / (stats.messages_sent + stats.messages_received)) * 100)
                    : 0
                  }%
                </div>
                <div className="text-sm text-muted-foreground">Taxa Resposta</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};