import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, XCircle, Clock } from 'lucide-react';

const systemStatus = [
  {
    name: "API Principal",
    status: "operational",
    description: "Serviços de autenticação e dados",
    uptime: "99.9%"
  },
  {
    name: "Dashboard Web",
    status: "operational", 
    description: "Interface principal da aplicação",
    uptime: "99.8%"
  },
  {
    name: "Sistema de Pagamentos",
    status: "operational",
    description: "Processamento de transações",
    uptime: "99.9%"
  },
  {
    name: "Notificações",
    status: "degraded",
    description: "Emails e notificações push",
    uptime: "98.5%"
  },
  {
    name: "Backup e Sincronização",
    status: "operational",
    description: "Backup automático dos dados",
    uptime: "99.7%"
  }
];

const recentIncidents = [
  {
    id: 1,
    title: "Lentidão no sistema de notificações",
    status: "investigating",
    date: "2024-01-15 14:30",
    description: "Identificamos lentidão no envio de notificações por email. Estamos investigando."
  },
  {
    id: 2,
    title: "Manutenção programada concluída",
    status: "resolved",
    date: "2024-01-10 02:00",
    description: "Manutenção programada do banco de dados concluída com sucesso."
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'operational':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'degraded':
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    case 'down':
      return <XCircle className="w-5 h-5 text-red-500" />;
    case 'investigating':
      return <Clock className="w-5 h-5 text-blue-500" />;
    default:
      return <CheckCircle className="w-5 h-5 text-green-500" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'operational':
      return <Badge className="bg-green-100 text-green-800">Operacional</Badge>;
    case 'degraded':
      return <Badge className="bg-yellow-100 text-yellow-800">Degradado</Badge>;
    case 'down':
      return <Badge className="bg-red-100 text-red-800">Indisponível</Badge>;
    case 'investigating':
      return <Badge className="bg-blue-100 text-blue-800">Investigando</Badge>;
    case 'resolved':
      return <Badge className="bg-green-100 text-green-800">Resolvido</Badge>;
    default:
      return <Badge>Desconhecido</Badge>;
  }
};

const Status = () => {
  const overallStatus = systemStatus.every(service => service.status === 'operational') 
    ? 'operational' 
    : 'degraded';

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Status do Sistema
            </h1>
            <div className="flex items-center gap-3">
              {getStatusIcon(overallStatus)}
              <span className="text-xl text-muted-foreground">
                {overallStatus === 'operational' 
                  ? 'Todos os sistemas operacionais' 
                  : 'Alguns sistemas com problemas'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Current Status */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Status Atual dos Serviços
          </h2>
          
          <div className="space-y-4">
            {systemStatus.map((service, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(service.status)}
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {service.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {service.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          Uptime: {service.uptime}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Últimos 30 dias
                        </div>
                      </div>
                      {getStatusBadge(service.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Incidents */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Incidentes Recentes
          </h2>
          
          {recentIncidents.length > 0 ? (
            <div className="space-y-4">
              {recentIncidents.map((incident) => (
                <Card key={incident.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {incident.title}
                      </CardTitle>
                      {getStatusBadge(incident.status)}
                    </div>
                    <CardDescription>
                      {incident.date}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {incident.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Nenhum incidente recente
                </h3>
                <p className="text-muted-foreground">
                  Todos os sistemas estão funcionando normalmente
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Subscribe to updates */}
        <div className="mt-12 text-center">
          <Card>
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold mb-4">
                Mantenha-se Atualizado
              </h3>
              <p className="text-muted-foreground mb-6">
                Receba notificações sobre o status dos nossos sistemas
              </p>
              <div className="flex gap-4 max-w-md mx-auto">
                <input 
                  type="email" 
                  placeholder="Seu email"
                  className="flex-1 px-4 py-2 border border-border rounded-md"
                />
                <button className="px-6 py-2 bg-primary text-primary-foreground rounded-md">
                  Inscrever
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Status;