import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WhatsAppConnectionCard } from '@/components/whatsapp/WhatsAppConnectionCard';
import { WhatsAppConversations } from '@/components/whatsapp/WhatsAppConversations';
import { WhatsAppQuickSend } from '@/components/whatsapp/WhatsAppQuickSend';
import { WhatsAppFeatureGuard } from '@/components/whatsapp/WhatsAppFeatureGuard';
// Removed: SecureWhatsAppConnection - replaced with Cloud API
// Removed: WhatsAppSecurityDashboard - replaced with Cloud API
import { useWhatsAppRESTAPI } from '@/hooks/useWhatsAppRESTAPI';
import { WhatsAppStatsPanel } from '@/components/whatsapp/WhatsAppStatsPanel';
import { MessageCircle, Users, Send, Activity } from 'lucide-react';

export default function WhatsApp() {
  const { session, messages, contacts, stats, loading } = useWhatsAppRESTAPI();
  const [activeTab, setActiveTab] = useState('connection');

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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'conectado':
        return 'Conectado';
      case 'pareando':
        return 'Pareando';
      case 'conectando':
        return 'Conectando';
      default:
        return 'Desconectado';
    }
  };

  // Usar estatísticas do novo sistema
  const totalContacts = stats.total_contacts;
  const sentMessages = stats.messages_sent;
  const receivedMessages = stats.messages_received;
  const responseRate = stats.response_rate;

  return (
    <WhatsAppFeatureGuard>
      <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">WhatsApp Business</h1>
          <p className="text-muted-foreground">
            Gerencie suas conversas e conecte-se com seus clientes
          </p>
        </div>
        <Badge 
          variant="outline"
          className={`${getStatusColor(session.status)} text-white border-0`}
        >
          <Activity className="w-3 h-3 mr-1" />
          {getStatusText(session.status)}
        </Badge>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Contatos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContacts}</div>
            <p className="text-xs text-muted-foreground">
              Contatos ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens Enviadas</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sentMessages}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 30 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens Recebidas</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{receivedMessages}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 30 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Resposta</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{responseRate}%</div>
            <p className="text-xs text-muted-foreground">
              Engajamento médio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="connection">Conexão</TabsTrigger>
          <TabsTrigger value="conversations">Conversas</TabsTrigger>
          <TabsTrigger value="quick-send">Envio Rápido</TabsTrigger>
          <TabsTrigger value="settings">Estatísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="connection" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WhatsAppConnectionCard />
          </div>
        </TabsContent>

        <TabsContent value="conversations" className="space-y-4">
          <WhatsAppConversations />
        </TabsContent>

        <TabsContent value="quick-send" className="space-y-4">
          <WhatsAppQuickSend />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="space-y-6">
            <WhatsAppStatsPanel />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Status do WPPConnect</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Recursos Disponíveis</h3>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li>✅ Conexão via QR Code com WPPConnect</li>
                      <li>✅ Envio e recebimento de mensagens de texto</li>
                      <li>✅ Gerenciamento de contatos</li>
                      <li>✅ Histórico de conversas</li>
                      <li>✅ Sessão persistente no servidor</li>
                      <li>✅ Webhooks para QR code e eventos</li>
                      <li>✅ Estatísticas em tempo real</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Como Funciona</h3>
                    <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                      <li>Servidor WPPConnect hospedado externamente</li>
                      <li>Conexão via Edge Functions do Supabase</li>
                      <li>QR Code atualizado via webhook</li>
                      <li>Sessão mantida no servidor WPPConnect</li>
                      <li>Dados salvos no banco Supabase</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Segurança</h3>
                    <ul className="text-sm space-y-1 list-disc list-inside text-green-600">
                      <li>🔒 Token seguro para comunicação com servidor</li>
                      <li>🔒 Row Level Security (RLS) ativo</li>
                      <li>🔒 Webhook verificado com token</li>
                      <li>🔒 Dados isolados por usuário</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Informações da Sessão</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 text-sm">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant="outline">{getStatusText(session.status)}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Tipo de Integração:</span>
                      <span className="font-mono text-xs">WPPConnect</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Contatos:</span>
                      <span>{totalContacts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mensagens:</span>
                      <span>{sentMessages + receivedMessages}</span>
                    </div>
                    {session.last_activity && (
                      <div className="flex justify-between">
                        <span>Última Atividade:</span>
                        <span className="text-xs">{new Date(session.last_activity).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t space-y-2">
                    <h4 className="font-medium text-sm">Observações Importantes</h4>
                    <p className="text-xs text-muted-foreground">
                      • A sessão é mantida no servidor WPPConnect
                    </p>
                    <p className="text-xs text-muted-foreground">
                      • O QR Code é atualizado automaticamente via webhook
                    </p>
                    <p className="text-xs text-muted-foreground">
                      • Configure os segredos WPP_SERVER_URL e WPP_SERVER_TOKEN nas Edge Functions
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
    </WhatsAppFeatureGuard>
  );
}