import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AuthorizationPasswordSetup } from './AuthorizationPasswordSetup';
import { useAuthorizationPassword } from '@/hooks/useAuthorizationPassword';
import { 
  Shield, 
  Lock, 
  AlertTriangle, 
  CheckCircle, 
  Key, 
  Database,
  Eye,
  EyeOff
} from 'lucide-react';

interface SecurityMetric {
  label: string;
  status: 'good' | 'warning' | 'critical';
  description: string;
  action?: string;
}

export const SecurityDashboard: React.FC = () => {
  const [passwordSetupOpen, setPasswordSetupOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { verifyPassword } = useAuthorizationPassword();

  const securityMetrics: SecurityMetric[] = [
    {
      label: 'Autenticação Segura',
      status: 'good',
      description: 'Sistema de autenticação com RLS ativado'
    },
    {
      label: 'Criptografia de Dados',
      status: 'good', 
      description: 'Tokens e dados sensíveis criptografados'
    },
    {
      label: 'Controle de Acesso',
      status: 'good',
      description: 'Row Level Security (RLS) configurado'
    },
    {
      label: 'Auditoria de Ações',
      status: 'good',
      description: 'Log de atividades e mudanças críticas'
    },
    {
      label: 'Proteção XSS/CSRF',
      status: 'good',
      description: 'Headers de segurança e sanitização implementados'
    },
    {
      label: 'Rate Limiting',
      status: 'good',
      description: 'Limitação de tentativas de login'
    }
  ];

  const getStatusIcon = (status: SecurityMetric['status']) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: SecurityMetric['status']) => {
    switch (status) {
      case 'good':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'warning':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'critical':
        return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  const testAuthPassword = async () => {
    try {
      // Test with a dummy password to trigger setup if not configured
      await verifyPassword('test');
    } catch (error) {
      if (error instanceof Error && error.message.includes('not configured')) {
        setPasswordSetupOpen(true);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Painel de Segurança
          </h2>
          <p className="text-muted-foreground">
            Monitore e configure as medidas de segurança do sistema
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2"
        >
          {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showDetails ? 'Ocultar Detalhes' : 'Ver Detalhes'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {securityMetrics.map((metric, index) => (
          <Card key={index} className={`border-l-4 ${getStatusColor(metric.status)}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                {getStatusIcon(metric.status)}
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{metric.description}</p>
              {metric.action && (
                <Button size="sm" className="mt-2">
                  {metric.action}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Configurações de Segurança
          </CardTitle>
          <CardDescription>
            Configure medidas adicionais de proteção
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Senha de Autorização</h4>
              <p className="text-sm text-muted-foreground">
                Senha adicional para operações sensíveis como exclusão de dados
              </p>
            </div>
            <Button onClick={() => setPasswordSetupOpen(true)} size="sm">
              Configurar
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Teste de Senha</h4>
              <p className="text-sm text-muted-foreground">
                Verificar se a senha de autorização está funcionando
              </p>
            </div>
            <Button onClick={testAuthPassword} variant="outline" size="sm">
              Testar
            </Button>
          </div>
        </CardContent>
      </Card>

      {showDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Medidas de Segurança Implementadas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription>
                <strong>Criptografia de Tokens:</strong> Todos os tokens de acesso são armazenados criptografados no banco de dados.
              </AlertDescription>
            </Alert>
            
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Row Level Security (RLS):</strong> Cada usuário só pode acessar seus próprios dados.
              </AlertDescription>
            </Alert>
            
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Auditoria Completa:</strong> Todas as ações críticas são registradas para auditoria.
              </AlertDescription>
            </Alert>
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Detecção de Ameaças:</strong> Sistema monitora tentativas de ataques e ações suspeitas.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      <AuthorizationPasswordSetup 
        open={passwordSetupOpen}
        onOpenChange={setPasswordSetupOpen}
        onSuccess={() => {
          console.log('Password configured successfully');
        }}
      />
    </div>
  );
};