import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WhatsAppConnectionCard } from '@/components/whatsapp/WhatsAppConnectionCard';
import { WhatsAppConversations } from '@/components/whatsapp/WhatsAppConversations';
import { WhatsAppStatusBadge } from '@/components/whatsapp/WhatsAppStatusBadge';
import WhatsAppScalabilityDashboard from '@/components/whatsapp/WhatsAppScalabilityDashboard';
import { WhatsAppMonitoringDashboard } from '@/components/whatsapp/WhatsAppMonitoringDashboard';
import { WhatsAppMetricsCollector } from '@/components/whatsapp/WhatsAppMetricsCollector';
import { useWhatsAppIntegration } from '@/hooks/useWhatsAppIntegration';
import { useAuth } from '@/contexts/AuthContext';
import { 
  MessageCircle, 
  Settings, 
  TrendingUp, 
  Users, 
  Send,
  MessageSquare,
  Activity
} from 'lucide-react';

export default function WhatsAppDashboard() {
  const { session, contacts, messages } = useWhatsAppIntegration();
  const { user } = useAuth();

  // Calculate stats
  const totalContacts = contacts.length;
  const sentMessages = messages.filter(m => m.direcao === 'enviada').length;
  const receivedMessages = messages.filter(m => m.direcao === 'recebida').length;
  const totalMessages = messages.length;

  return (
    <div className="flex min-h-screen bg-background">
        <DashboardSidebar />
        
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Coletor de métricas em background */}
            <WhatsAppMetricsCollector 
              userId={user?.id} 
              sessionId={session?.id || 'dashboard'} 
            />
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">WhatsApp Business</h1>
                <p className="text-muted-foreground">
                  Gerencie suas conversas e conecte com seus clientes
                </p>
              </div>
              <WhatsAppStatusBadge session={session} />
            </div>

          {/* Stats Cards with Enhanced Design */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover-scale transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Contatos</CardTitle>
                <div className="relative">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  {totalContacts > 0 && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold animate-fade-in">{totalContacts}</div>
                <p className="text-xs text-muted-foreground">
                  {totalContacts === 1 ? 'Contato ativo' : 'Contatos ativos'} no WhatsApp
                </p>
              </CardContent>
            </Card>

            <Card className="hover-scale transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mensagens Enviadas</CardTitle>
                <div className="relative">
                  <Send className="h-4 w-4 text-muted-foreground" />
                  {sentMessages > 0 && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 animate-fade-in">{sentMessages}</div>
                <p className="text-xs text-muted-foreground">
                  Total de mensagens enviadas
                </p>
              </CardContent>
            </Card>

            <Card className="hover-scale transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mensagens Recebidas</CardTitle>
                <div className="relative">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  {receivedMessages > 0 && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600 animate-fade-in">{receivedMessages}</div>
                <p className="text-xs text-muted-foreground">
                  Total de mensagens recebidas
                </p>
              </CardContent>
            </Card>

            <Card className="hover-scale transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Resposta</CardTitle>
                <TrendingUp className={`h-4 w-4 ${
                  totalMessages > 0 && (receivedMessages / totalMessages) > 0.5 
                    ? 'text-green-500' 
                    : 'text-muted-foreground'
                }`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold animate-fade-in ${
                  totalMessages > 0 && (receivedMessages / totalMessages) > 0.5 
                    ? 'text-green-600' 
                    : 'text-orange-600'
                }`}>
                  {totalMessages > 0 ? Math.round((receivedMessages / totalMessages) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Porcentagem de respostas
                </p>
              </CardContent>
            </Card>
          </div>

            {/* Main Content */}
          <Tabs defaultValue="conversations" className="space-y-6">
            <TabsList>
              <TabsTrigger value="conversations" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Conversas
              </TabsTrigger>
              <TabsTrigger value="scalability" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Escalabilidade
              </TabsTrigger>
              <TabsTrigger value="monitoring" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Monitoramento
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configurações
              </TabsTrigger>
            </TabsList>

            <TabsContent value="conversations">
              <WhatsAppConversations />
            </TabsContent>

            <TabsContent value="scalability">
              <WhatsAppScalabilityDashboard />
            </TabsContent>

            <TabsContent value="monitoring">
              <WhatsAppMonitoringDashboard />
            </TabsContent>

            <TabsContent value="settings">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <WhatsAppConnectionCard />
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Informações do Sistema</CardTitle>
                      <CardDescription>
                        Detalhes técnicos da integração WhatsApp
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium">Servidor</div>
                          <div className="text-muted-foreground">whatsapp.plushify.com.br</div>
                        </div>
                        <div>
                          <div className="font-medium">Protocolo</div>
                          <div className="text-muted-foreground">HTTPS + WebSocket</div>
                        </div>
                        <div>
                          <div className="font-medium">Biblioteca</div>
                          <div className="text-muted-foreground">whatsapp-web.js</div>
                        </div>
                        <div>
                          <div className="font-medium">Autenticação</div>
                          <div className="text-muted-foreground">Bearer Token</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="font-medium">Recursos Disponíveis</div>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Envio e recebimento de mensagens de texto</li>
                          <li>• Sincronização em tempo real</li>
                          <li>• Histórico de conversas</li>
                          <li>• Gerenciamento de contatos</li>
                          <li>• Status de entrega</li>
                          <li>• Sessão persistente</li>
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <div className="font-medium">Limitações</div>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Apenas mensagens de texto</li>
                          <li>• Dependente da conexão do celular</li>
                          <li>• Uma sessão por usuário</li>
                          <li>• Sujeito às políticas do WhatsApp</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
  );
}