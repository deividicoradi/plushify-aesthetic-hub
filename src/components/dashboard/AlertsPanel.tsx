
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
      case 'danger': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getBadgeColor = (type: Alert['type']) => {
    switch (type) {
      case 'danger': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const handleActionClick = (route: string) => {
    navigate(route);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-plush-600" />
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
                  <p className="text-sm opacity-80">{alert.description}</p>
                </div>
              </div>
              {alert.value && (
                <Badge className={`${getBadgeColor(alert.type)} text-white`}>
                  {alert.value}
                </Badge>
              )}
            </div>
            {alert.action && alert.actionRoute && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
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
