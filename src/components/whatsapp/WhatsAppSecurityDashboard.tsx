import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { Shield, Database, Lock, Activity, AlertTriangle, Clock } from 'lucide-react';
import * as whatsappApi from '@/api/whatsapp';

interface SecurityAuditLog {
  id: string;
  event: string;
  created_at: string;
  metadata: any;
  ip_address?: string | null;
  user_agent?: string | null;
  session_id: string;
  user_id: string;
}

export const WhatsAppSecurityDashboard = () => {
  const { user } = useAuth();
  const [securityLogs, setSecurityLogs] = useState<SecurityAuditLog[]>([]);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSecurityData();
    }
  }, [user]);

  const loadSecurityData = async () => {
    if (!user) return;

    try {
      // Carregar logs de segurança
      const logs = await whatsappApi.fetchWhatsAppSessionLogs(user.id);

      // Carregar informações da sessão atual usando RPC seguro
      const session = await whatsappApi.getActiveSessionForUser(user.id);

      setSecurityLogs((logs || []).map(log => ({
        ...log,
        ip_address: log.ip_address as string | null,
        user_agent: log.user_agent as string | null
      })));
      setSessionInfo(session);
    } catch (error) {
      console.error('Erro ao carregar dados de segurança:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCleanupExpiredSessions = async () => {
    try {
      const data = await whatsappApi.cleanupExpiredSessions() as number;
      if (data && data > 0) {
        alert(`${data} sessões expiradas foram limpas`);
        loadSecurityData();
      } else {
        alert('Nenhuma sessão expirada encontrada');
      }
    } catch (error) {
      console.error('Erro ao limpar sessões:', error);
    }
  };

  const getEventIcon = (event: string) => {
    switch (event) {
      case 'SESSION_CREATED':
      case 'SESSION_CONNECTED':
        return <Shield className="w-4 h-4 text-green-600" />;
      case 'SESSION_DISCONNECTED':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'SESSION_EXPIRED':
        return <Clock className="w-4 h-4 text-red-600" />;
      case 'RATE_LIMITED':
        return <Shield className="w-4 h-4 text-orange-600" />;
      case 'LOGIN_ATTEMPT':
        return <Lock className="w-4 h-4 text-blue-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getEventColor = (event: string) => {
    switch (event) {
      case 'SESSION_CREATED':
      case 'SESSION_CONNECTED':
        return 'bg-green-100 text-green-800';
      case 'SESSION_DISCONNECTED':
        return 'bg-yellow-100 text-yellow-800';
      case 'SESSION_EXPIRED':
        return 'bg-red-100 text-red-800';
      case 'RATE_LIMITED':
        return 'bg-orange-100 text-orange-800';
      case 'LOGIN_ATTEMPT':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando dados de segurança...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status da Sessão Atual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Status da Sessão Atual
          </CardTitle>
          <CardDescription>
            Informações de segurança da sua sessão WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessionInfo ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge 
                    className={
                      sessionInfo.status === 'conectado' ? 'bg-green-100 text-green-800' :
                      sessionInfo.status === 'pareando' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }
                  >
                    {sessionInfo.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Expira em:</span>
                  <span className="text-sm">
                    {sessionInfo.expires_at ? 
                      new Date(sessionInfo.expires_at).toLocaleString() : 
                      'N/A'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Última atividade:</span>
                  <span className="text-sm">
                    {new Date(sessionInfo.last_activity).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">IP Address:</span>
                  <span className="text-sm font-mono">
                    {sessionInfo.ip_address || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Tokens:</span>
                  <Badge variant="secondary">
                    {sessionInfo.access_token ? 'Criptografados' : 'Não configurados'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Servidor:</span>
                  <span className="text-sm font-mono">
                    {sessionInfo.server_url?.replace('http://', '').replace('https://', '') || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              Nenhuma sessão ativa encontrada
            </div>
          )}
        </CardContent>
      </Card>

      {/* Logs de Auditoria */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Logs de Auditoria
              </CardTitle>
              <CardDescription>
                Últimas atividades de segurança registradas
              </CardDescription>
            </div>
            <Button onClick={handleCleanupExpiredSessions} variant="outline" size="sm">
              Limpar Expiradas
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {securityLogs.length > 0 ? (
            <div className="space-y-3">
              {securityLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getEventIcon(log.event)}
                    <div>
                      <Badge className={getEventColor(log.event)} variant="secondary">
                        {log.event.replace(/_/g, ' ')}
                      </Badge>
                      <div className="text-sm text-muted-foreground mt-1">
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {log.ip_address && (
                      <div className="text-xs font-mono text-muted-foreground">
                        {log.ip_address}
                      </div>
                    )}
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {JSON.stringify(log.metadata).slice(0, 50)}...
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              Nenhum log de auditoria encontrado
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recursos de Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Recursos de Segurança Implementados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Criptografia & Tokens</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>✓ Tokens criptografados com pgcrypto</li>
                <li>✓ Renovação automática de tokens</li>
                <li>✓ Validação de expiração em tempo real</li>
                <li>✓ Isolamento de sessões por usuário</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Auditoria & Controle</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>✓ Log completo de eventos de sessão</li>
                <li>✓ Rate limiting (30 req/min)</li>
                <li>✓ Controle de IP e User-Agent</li>
                <li>✓ Limpeza automática de sessões expiradas</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Políticas de Segurança</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>✓ Row Level Security (RLS) ativo</li>
                <li>✓ Uma sessão ativa por usuário</li>
                <li>✓ Triggers de validação automática</li>
                <li>✓ Índices otimizados para performance</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Monitoramento</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>✓ Rastreamento de tentativas de login</li>
                <li>✓ Detecção de atividade suspeita</li>
                <li>✓ Alertas de rate limiting</li>
                <li>✓ Logs detalhados com metadata</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};