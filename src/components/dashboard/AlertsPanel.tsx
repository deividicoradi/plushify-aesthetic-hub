
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Clock, TrendingDown, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Alert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  icon: React.ElementType;
  title: string;
  description: string;
  action?: string;
  actionRoute?: string;
  value?: string;
}

export const AlertsPanel = () => {
  const navigate = useNavigate();

  const alerts: Alert[] = [
    {
      id: '1',
      type: 'warning',
      icon: AlertTriangle,
      title: 'Produtos com Estoque Baixo',
      description: '3 produtos precisam de reposição',
      action: 'Ver Estoque',
      actionRoute: '/estoque',
      value: '3'
    },
    {
      id: '2',
      type: 'info',
      icon: Clock,
      title: 'Agendamentos Pendentes',
      description: 'Confirmações aguardando resposta',
      action: 'Verificar',
      actionRoute: '/agendamentos',
      value: '5'
    },
    {
      id: '3',
      type: 'danger',
      icon: TrendingDown,
      title: 'Queda no Faturamento',
      description: '15% menor que a semana passada',
      action: 'Analisar',
      actionRoute: '/relatorios',
      value: '-15%'
    },
    {
      id: '4',
      type: 'info',
      icon: Users,
      title: 'Novos Clientes',
      description: 'Cadastrados esta semana',
      action: 'Ver Clientes',
      actionRoute: '/clientes',
      value: '8'
    }
  ];

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'danger': return 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/30 text-red-800 dark:text-red-200';
      case 'warning': return 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800/30 text-yellow-800 dark:text-yellow-200';
      default: return 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/30 text-blue-800 dark:text-blue-200';
    }
  };

  const getBadgeColor = (type: Alert['type']) => {
    switch (type) {
      case 'danger': return 'bg-red-500 dark:bg-red-600 text-white';
      case 'warning': return 'bg-yellow-500 dark:bg-yellow-600 text-white';
      default: return 'bg-blue-500 dark:bg-blue-600 text-white';
    }
  };

  const getDescriptionColor = (type: Alert['type']) => {
    switch (type) {
      case 'danger': return 'text-red-700 dark:text-red-300';
      case 'warning': return 'text-yellow-700 dark:text-yellow-300';
      default: return 'text-blue-700 dark:text-blue-300';
    }
  };

  const handleActionClick = (route: string) => {
    navigate(route);
  };

  return (
    <Card className="bg-card dark:bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <AlertTriangle className="w-5 h-5 text-primary" />
          Alertas e Lembretes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-lg border transition-colors ${getAlertColor(alert.type)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <alert.icon className="w-5 h-5" />
                <div>
                  <h4 className="font-medium">{alert.title}</h4>
                  <p className={`text-sm ${getDescriptionColor(alert.type)}`}>{alert.description}</p>
                </div>
              </div>
              {alert.value && (
                <Badge className={`${getBadgeColor(alert.type)}`}>
                  {alert.value}
                </Badge>
              )}
            </div>
            {alert.action && alert.actionRoute && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 border-current text-current hover:bg-current/10 dark:hover:bg-current/20"
                onClick={() => handleActionClick(alert.actionRoute)}
              >
                {alert.action}
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
