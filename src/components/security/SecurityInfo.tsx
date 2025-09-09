import React from 'react';
import { Shield, Lock, Eye, Database, FileText, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SecurityInfoProps {
  showDetails?: boolean;
}

export const SecurityInfo: React.FC<SecurityInfoProps> = ({ showDetails = false }) => {
  const securityFeatures = [
    {
      icon: Shield,
      title: 'Row Level Security (RLS)',
      description: 'Todos os dados são protegidos por políticas RLS que garantem que usuários só acessem seus próprios dados.',
      status: 'active'
    },
    {
      icon: Lock,
      title: 'Dados Sensíveis Mascarados',
      description: 'Informações como CPF, telefone e email podem ser mascaradas para proteção adicional.',
      status: 'active'
    },
    {
      icon: Eye,
      title: 'Auditoria de Acesso',
      description: 'Todos os acessos a dados sensíveis são registrados para monitoramento de segurança.',
      status: 'active'
    },
    {
      icon: Database,
      title: 'Funções Seguras',
      description: 'Uso de funções SECURITY DEFINER para controle rigoroso de acesso aos dados.',
      status: 'active'
    }
  ];

  const dataTypes = [
    { name: 'Informações de Clientes', fields: 'Nome, Email, Telefone, CPF, Endereço', protection: 'RLS + Mascaramento' },
    { name: 'Dados de Profissionais', fields: 'Email, Telefone, Especialidades', protection: 'RLS + Auditoria' },
    { name: 'Contatos WhatsApp', fields: 'Nome, Telefone', protection: 'RLS + Log de Acesso' },
    { name: 'Informações Financeiras', fields: 'Pagamentos, Despesas', protection: 'RLS + Criptografia' }
  ];

  if (!showDetails) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Dados protegidos por Row Level Security e auditoria de acesso ativa.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Proteção de Dados Implementada
          </CardTitle>
          <CardDescription>
            Medidas de segurança ativas para proteção de informações sensíveis dos clientes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {securityFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <IconComponent className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{feature.title}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {feature.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            Dados Protegidos
          </CardTitle>
          <CardDescription>
            Tipos de dados sensíveis e suas respectivas proteções
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dataTypes.map((dataType, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{dataType.name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {dataType.protection}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{dataType.fields}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Importante:</strong> As medidas de segurança estão ativas e monitorando todos os acessos. 
          Para relatórios de auditoria ou questões de segurança, consulte os logs do sistema.
        </AlertDescription>
      </Alert>
    </div>
  );
};