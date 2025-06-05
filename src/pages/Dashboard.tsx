
import React from 'react';
import { LayoutDashboard, Users, CalendarDays, Receipt, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { MetricCard } from '@/components/dashboard/MetricCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { UpcomingAppointments } from '@/components/dashboard/UpcomingAppointments';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { StatsChart } from '@/components/dashboard/StatsChart';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { WeeklyOverview } from '@/components/dashboard/WeeklyOverview';
import { AIPersonalizedPanel } from '@/components/premium/AIPersonalizedPanel';
import { TeamManagement } from '@/components/premium/TeamManagement';
import { AdvancedCRM } from '@/components/premium/AdvancedCRM';
import { useSubscription } from '@/hooks/useSubscription';

const Dashboard = () => {
  const navigate = useNavigate();
  const { tier, isLoading, isSubscribed, hasFeature, getCurrentPlanInfo } = useSubscription();

  const currentPlan = getCurrentPlanInfo();

  const metricItems = [
    {
      title: "Total de Clientes",
      value: "1,234",
      trend: "+12.3%",
      icon: Users,
      description: "Últimos 30 dias",
      to: "/clientes",
      color: "from-[#9b87f5] to-[#7E69AB]",
      clickable: true,
    },
    {
      title: "Agendamentos",
      value: "156",
      trend: "+8.2%",
      icon: CalendarDays,
      description: "Esta semana",
      to: "/agendamentos",
      color: "from-[#6E59A5] to-[#9b87f5]",
      clickable: true,
    },
    {
      title: "Receita",
      value: "R$ 15.290",
      trend: "+23.1%",
      icon: Receipt,
      description: "Este mês",
      to: hasFeature('pro') ? "/financeiro" : "/planos",
      color: "from-[#8B5CF6] to-[#D6BCFA]",
      clickable: true,
    },
    {
      title: "Relatórios",
      value: hasFeature('pro') ? "Disponível" : "Pro",
      trend: hasFeature('pro') ? "+4.3%" : undefined,
      icon: TrendingUp,
      description: hasFeature('pro') ? "Análises avançadas" : "Upgrade para Pro",
      to: hasFeature('pro') ? "/relatorios" : "/planos",
      color: "from-[#33C3F0] to-[#9b87f5]",
      clickable: true,
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <LayoutDashboard className="w-6 h-6 text-plush-600" />
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
        <div className="text-center py-8">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header com notificações */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-plush-600" />
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
        <div className="hidden lg:block">
          <NotificationCenter />
        </div>
      </div>

      {/* Informações do plano atual */}
      <div className="bg-gradient-to-r from-plush-50 to-purple-50 p-4 rounded-lg border border-plush-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-plush-800 mb-1">
              Plano {currentPlan.name}
            </h2>
            <p className="text-sm text-plush-700">
              {isSubscribed ? 
                `Acesso completo às funcionalidades do plano ${currentPlan.name}` :
                'Acesso às funcionalidades básicas'
              }
            </p>
            {currentPlan.expiresAt && (
              <p className="text-xs text-plush-600 mt-1">
                Válido até: {new Date(currentPlan.expiresAt).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
          {!isSubscribed && (
            <button 
              className="bg-plush-600 hover:bg-plush-700 text-white px-4 py-2 rounded-md transition-colors text-sm"
              onClick={() => navigate('/planos')}
            >
              Fazer upgrade
            </button>
          )}
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricItems.map((item, idx) => (
          <MetricCard
            key={item.title}
            title={item.title}
            value={item.value}
            trend={item.trend}
            icon={item.icon}
            description={item.description}
            onClick={item.clickable && item.to ? () => navigate(item.to) : undefined}
            gradientClass={item.color}
            tabIndex={item.clickable ? 0 : -1}
            role={item.clickable ? "button" : undefined}
            aria-label={item.clickable ? `Acessar ${item.title}` : undefined}
          />
        ))}
      </div>

      {/* Layout responsivo baseado no plano */}
      {hasFeature('premium') ? (
        // Layout Premium - 4 colunas com recursos avançados
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          {/* Coluna 1 - Ações rápidas */}
          <div className="xl:col-span-2 space-y-4">
            <QuickActions />
            <WeeklyOverview />
          </div>

          {/* Coluna 2 - IA Personalizada */}
          <div className="xl:col-span-3">
            <AIPersonalizedPanel />
          </div>

          {/* Coluna 3 - Gráficos */}
          <div className="xl:col-span-4 space-y-4">
            <StatsChart />
          </div>

          {/* Coluna 4 - Alertas */}
          <div className="xl:col-span-3">
            <AlertsPanel />
          </div>
        </div>
      ) : (
        // Layout padrão para outros planos
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          <div className="xl:col-span-1 space-y-4">
            <QuickActions />
            <WeeklyOverview />
          </div>
          <div className="xl:col-span-2 space-y-4">
            <StatsChart />
          </div>
          <div className="xl:col-span-1">
            <AlertsPanel />
          </div>
        </div>
      )}

      {/* Recursos Premium adicionais */}
      {hasFeature('premium') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TeamManagement />
          <AdvancedCRM />
        </div>
      )}

      {/* Conteúdo baseado no plano */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="animate-fade-in">
          <CardHeader className="pb-3">
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            {hasFeature('starter') ? (
              <RecentActivity />
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-4">Funcionalidade disponível no plano Starter</p>
                <button 
                  onClick={() => navigate('/planos')}
                  className="text-plush-600 hover:underline text-sm"
                >
                  Ver planos
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {hasFeature('starter') ? (
          <UpcomingAppointments />
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Próximos Agendamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-gray-500 mb-4">Funcionalidade disponível no plano Starter</p>
                <button 
                  onClick={() => navigate('/planos')}
                  className="text-plush-600 hover:underline text-sm"
                >
                  Ver planos
                </button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Mobile notification center */}
      <div className="lg:hidden">
        <NotificationCenter />
      </div>
    </div>
  );
};

export default Dashboard;
