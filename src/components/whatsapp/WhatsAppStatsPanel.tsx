import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWhatsAppRESTAPI } from '@/hooks/useWhatsAppRESTAPI';
import { 
  MessageCircle, 
  Users, 
  Send, 
  TrendingUp, 
  Activity,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const WhatsAppStatsPanel = () => {
  const { session, stats, loading } = useWhatsAppRESTAPI();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'conectado':
        return 'bg-green-500 text-white border-green-500';
      case 'pareando':
        return 'bg-yellow-500 text-white border-yellow-500';
      case 'conectando':
        return 'bg-blue-500 text-white border-blue-500';
      case 'expirado':
        return 'bg-red-500 text-white border-red-500';
      default:
        return 'bg-gray-500 text-white border-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'conectado':
        return 'Conectado';
      case 'pareando':
        return 'Aguardando QR Code';
      case 'conectando':
        return 'Conectando...';
      case 'expirado':
        return 'Sessão Expirada';
      default:
        return 'Desconectado';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'conectado':
        return <CheckCircle className="w-4 h-4" />;
      case 'pareando':
      case 'conectando':
        return <Clock className="w-4 h-4" />;
      default:
        return <XCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Status da Conexão</CardTitle>
              <CardDescription>
                Estado atual da integração WhatsApp
              </CardDescription>
            </div>
            <Badge 
              variant="outline" 
              className={getStatusColor(session.status)}
            >
              {getStatusIcon(session.status)}
              {getStatusText(session.status)}
            </Badge>
          </div>
        </CardHeader>
        {session.last_activity && (
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="w-4 h-4" />
              Última atividade: {formatDistanceToNow(new Date(session.last_activity), { 
                addSuffix: true, 
                locale: ptBR 
              })}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Contatos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_contacts}</div>
            <p className="text-xs text-muted-foreground">
              Contatos únicos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens Enviadas</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.messages_sent}</div>
            <p className="text-xs text-muted-foreground">
              Total enviadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens Recebidas</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.messages_received}</div>
            <p className="text-xs text-muted-foreground">
              Total recebidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Resposta</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.response_rate}%</div>
            <p className="text-xs text-muted-foreground">
              Engajamento médio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Session Details */}
      {session.session_id && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detalhes da Sessão</CardTitle>
            <CardDescription>
              Informações técnicas da conexão atual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              
              {session.server_url && (
                <div>
                  <div className="font-medium">Servidor</div>
                  <div className="text-muted-foreground font-mono text-xs">
                    {session.server_url}
                  </div>
                </div>
              )}
              
              {session.created_at && (
                <div>
                  <div className="font-medium">Criada em</div>
                  <div className="text-muted-foreground">
                    {formatDistanceToNow(new Date(session.created_at), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </div>
                </div>
              )}
              
              {session.expires_at && (
                <div>
                  <div className="font-medium">Expira em</div>
                  <div className="text-muted-foreground">
                    {formatDistanceToNow(new Date(session.expires_at), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Indicadores de Performance</CardTitle>
          <CardDescription>
            Métricas em tempo real do WhatsApp Business
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status da Conexão</span>
              <Badge 
                variant={session.status === 'conectado' ? 'default' : 'secondary'}
                className={session.status === 'conectado' ? 'bg-green-500' : ''}
              >
                {session.status === 'conectado' ? 'Online' : 'Offline'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Autenticação</span>
              <Badge variant={session.session_id ? 'default' : 'destructive'}>
                {session.session_id ? 'Autenticado' : 'Não autenticado'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Rate Limiting</span>
              <Badge variant="default" className="bg-blue-500">
                Ativo (30 req/min)
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Criptografia</span>
              <Badge variant="default" className="bg-purple-500">
                Tokens seguros
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};