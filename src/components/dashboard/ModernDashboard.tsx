
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Package, 
  Plus,
  ArrowRight,
  DollarSign,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboardStats } from '@/hooks/useDashboardStats';

export const ModernDashboard = () => {
  const navigate = useNavigate();
  const { 
    totalClients, 
    newThisMonth, 
    weeklyAppointments,
    monthlyRevenue,
    loading 
  } = useDashboardStats();

  const quickActions = [
    {
      title: 'Novo Agendamento',
      description: 'Agende um serviço',
      icon: Calendar,
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => navigate('/appointments')
    },
    {
      title: 'Adicionar Cliente',
      description: 'Cadastre novo cliente',
      icon: Users,
      color: 'bg-green-500 hover:bg-green-600',
      onClick: () => navigate('/clients')
    },
    {
      title: 'Gerenciar Estoque',
      description: 'Controle produtos',
      icon: Package,
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => navigate('/inventory')
    },
    {
      title: 'Ver Relatórios',
      description: 'Análises detalhadas',
      icon: TrendingUp,
      color: 'bg-orange-500 hover:bg-orange-600',
      onClick: () => navigate('/reports')
    }
  ];

  const metrics = [
    {
      title: 'Total de Clientes',
      value: loading ? '...' : totalClients.toString(),
      subtitle: `+${newThisMonth} este mês`,
      icon: Users,
      color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
      trend: newThisMonth > 0 ? 'up' : 'stable'
    },
    {
      title: 'Agendamentos',
      value: loading ? '...' : weeklyAppointments.toString(),
      subtitle: 'Esta semana',
      icon: Calendar,
      color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
      trend: weeklyAppointments > 5 ? 'up' : 'stable'
    },
    {
      title: 'Receita Mensal',
      value: loading ? '...' : `R$ ${monthlyRevenue.toLocaleString('pt-BR')}`,
      subtitle: 'Este mês',
      icon: DollarSign,
      color: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30',
      trend: monthlyRevenue > 1000 ? 'up' : 'stable'
    },
    {
      title: 'Status',
      value: 'Ativo',
      subtitle: 'Sistema funcionando',
      icon: Activity,
      color: 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30',
      trend: 'up'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Visão geral do seu negócio
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            onClick={() => navigate('/appointments')}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      {/* Métricas Principais com bordas finas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index} className="relative overflow-hidden border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {metric.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {metric.subtitle}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${metric.color}`}>
                  <metric.icon className="w-6 h-6" />
                </div>
              </div>
              
              {metric.trend === 'up' && (
                <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ações Rápidas */}
      <Card className="border border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-primary" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <div
                key={index}
                onClick={action.onClick}
                className="relative group p-4 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-primary/50 cursor-pointer transition-all duration-200 hover:shadow-md"
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className={`p-3 rounded-full ${action.color} text-white group-hover:scale-110 transition-transform duration-200`}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
