
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Clock, TrendingDown, Users, ArrowRight, Bell } from 'lucide-react';
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

  const getAlertGradient = (type: Alert['type']) => {
    switch (type) {
      case 'danger': return 'from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/20';
      case 'warning': return 'from-yellow-50 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-800/20';
      default: return 'from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20';
    }
  };

  const getAlertBorder = (type: Alert['type']) => {
    switch (type) {
      case 'danger': return 'border-red-200 dark:border-red-800/30';
      case 'warning': return 'border-yellow-200 dark:border-yellow-800/30';
      default: return 'border-blue-200 dark:border-blue-800/30';
    }
  };

  const getTextColor = (type: Alert['type']) => {
    switch (type) {
      case 'danger': return 'text-red-800 dark:text-red-200';
      case 'warning': return 'text-yellow-800 dark:text-yellow-200';
      default: return 'text-blue-800 dark:text-blue-200';
    }
  };

  const getBadgeColor = (type: Alert['type']) => {
    switch (type) {
      case 'danger': return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
      case 'warning': return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white';
      default: return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
    }
  };

  const handleActionClick = (route: string) => {
    navigate(route);
  };

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-card dark:to-card/50">
      <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-b border-border/50">
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <div className="w-8 h-8 bg-red-100 dark:bg-red-800/50 rounded-lg flex items-center justify-center">
            <Bell className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
          <span className="text-red-900 dark:text-red-100">Alertas e Lembretes</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-xl bg-gradient-to-r ${getAlertGradient(alert.type)} border ${getAlertBorder(alert.type)} transition-all duration-200 hover:shadow-md group`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/50 dark:bg-white/10 rounded-lg flex items-center justify-center">
                  <alert.icon className={`w-4 h-4 ${getTextColor(alert.type)}`} />
                </div>
                <div>
                  <h4 className={`font-semibold ${getTextColor(alert.type)}`}>{alert.title}</h4>
                  <p className={`text-sm ${getTextColor(alert.type)} opacity-80`}>{alert.description}</p>
                </div>
              </div>
              {alert.value && (
                <Badge className={`${getBadgeColor(alert.type)} border-0 shadow-sm`}>
                  {alert.value}
                </Badge>
              )}
            </div>
            {alert.action && alert.actionRoute && (
              <Button 
                size="sm" 
                className={`w-full ${getBadgeColor(alert.type)} hover:shadow-md transition-all duration-200 border-0 group-hover:scale-105`}
                onClick={() => handleActionClick(alert.actionRoute)}
              >
                {alert.action}
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            )}
          </div>
        ))}
        
        <div className="pt-2">
          <Button 
            variant="outline" 
            className="w-full border-border/30 hover:border-border/60 hover:bg-muted/50"
          >
            Ver todos os alertas
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
