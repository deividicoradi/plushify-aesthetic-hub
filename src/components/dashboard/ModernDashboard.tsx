
import React from 'react';
import { Users, Calendar, DollarSign, Package, TrendingUp, Bell, Target, Zap } from 'lucide-react';
import { FeatureGuard } from '@/components/FeatureGuard';
import { DashboardHeader } from './DashboardHeader';
import { ModernMetricCard } from './ModernMetricCard';
import { InteractiveChart } from './InteractiveChart';
import { WeeklyOverview } from './WeeklyOverview';
import { UpcomingAppointments } from './UpcomingAppointments';
import { ModernActivityFeed } from './ModernActivityFeed';
import { PlanInfoBanner } from './PlanInfoBanner';
import { AlertsPanel } from './AlertsPanel';
import { QuickHelp } from './QuickHelp';
import { FloatingActionButtons } from './FloatingActionButtons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useInteractiveChartData } from '@/hooks/useInteractiveChartData';
import { useWeeklyOverviewData } from '@/hooks/useWeeklyOverviewData';
import { useAppointments } from '@/hooks/useAppointments';
import { useFinancialData } from '@/hooks/useFinancialData';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { useNavigate } from 'react-router-dom';

export const ModernDashboard = () => {
  const navigate = useNavigate();
  const dashboardStats = useDashboardStats();
  const chartDataHook = useInteractiveChartData();
  const weeklyOverviewHook = useWeeklyOverviewData();
  const appointmentsHook = useAppointments();
  const { metrics } = useFinancialData();
  const { limits } = usePlanLimits();

  // Filtrar próximos agendamentos
  const upcomingAppointments = appointmentsHook.appointments?.filter(apt => 
    new Date(apt.appointment_date) >= new Date() && apt.status === 'agendado'
  )?.slice(0, 5) || [];

  const quickActions = [
    {
      title: 'Novo Agendamento',
      description: 'Agende um cliente rapidamente',
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
      onClick: () => navigate('/appointments'),
      feature: 'appointments'
    },
    {
      title: 'Cadastrar Cliente',
      description: 'Adicione um novo cliente',
      icon: Users,
      color: 'from-green-500 to-green-600',
      onClick: () => navigate('/clients'),
      feature: 'clients'
    },
    {
      title: 'Controle Financeiro',
      description: 'Gerencie pagamentos e receitas',
      icon: DollarSign,
      color: 'from-purple-500 to-purple-600',
      onClick: () => navigate('/financial'),
      feature: 'financial'
    },
    {
      title: 'Relatórios',
      description: 'Analise seu desempenho',
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
      onClick: () => navigate('/reports'),
      feature: 'reports'
    }
  ];

  return (
    <div className="space-y-6 pb-20">
      <DashboardHeader />
      
      <PlanInfoBanner />

      {/* Hero Section com estatísticas principais */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/10 p-8">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Bem-vindo ao seu Dashboard
              </h2>
              <p className="text-muted-foreground text-lg">
                Gerencie seu negócio de forma inteligente e eficiente
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="px-3 py-1">
                <Zap className="w-4 h-4 mr-1" />
                Sistema Ativo
              </Badge>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <ModernMetricCard
              title="Clientes Totais"
              value={String(dashboardStats.totalClients || 0)}
              change={String(dashboardStats.newThisMonth || 0)}
              icon={Users}
              loading={dashboardStats.loading}
              limit={limits.clients}
              currentCount={dashboardStats.totalClients || 0}
              feature="clients"
            />
            
            <ModernMetricCard
              title="Agendamentos"
              value={String(dashboardStats.totalAppointments || 0)}
              change={String(dashboardStats.weeklyAppointments || 0)}
              icon={Calendar}
              loading={dashboardStats.loading}
              limit={limits.appointments}
              currentCount={dashboardStats.totalAppointments || 0}
              feature="appointments"
            />
            
            <FeatureGuard planFeature="hasFinancialManagement" showUpgradePrompt={false}>
              <ModernMetricCard
                title="Receita Mensal"
                value={String(metrics?.receitasMesAtual || 0)}
                change={String(metrics?.crescimentoReceitas || 0)}
                icon={DollarSign}
                loading={dashboardStats.loading}
                isCurrency
                feature="revenue"
              />
            </FeatureGuard>
            
            <FeatureGuard planFeature="hasInventoryAdvanced" showUpgradePrompt={false}>
              <ModernMetricCard
                title="Produtos"
                value={String(dashboardStats.totalClients || 0)}
                change={String(0)}
                icon={Package}
                loading={dashboardStats.loading}
                limit={limits.products}
                currentCount={dashboardStats.totalClients || 0}
                feature="products"
              />
            </FeatureGuard>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-card to-card/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className={`h-auto p-4 flex flex-col items-start gap-3 hover:shadow-md transition-all duration-200 border-2 hover:border-primary/20 group`}
                onClick={action.onClick}
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-sm">{action.title}</h3>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gráficos e Visão Geral */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <FeatureGuard 
            planFeature="hasAdvancedAnalytics" 
            showUpgradePrompt={false}
            fallback={
              <Card className="border-dashed border-2 border-primary/20">
                <CardContent className="p-8 text-center">
                  <TrendingUp className="w-12 h-12 text-primary/40 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Gráficos Avançados</h3>
                  <p className="text-muted-foreground mb-4">
                    Disponível apenas no plano Premium
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/planos')}
                    className="border-primary text-primary hover:bg-primary hover:text-white"
                  >
                    Fazer Upgrade
                  </Button>
                </CardContent>
              </Card>
            }
          >
            <InteractiveChart />
          </FeatureGuard>
        </div>
        
        <div className="space-y-6">
          <WeeklyOverview />
          <AlertsPanel />
        </div>
      </div>

      {/* Agendamentos e Atividades */}
      <div className="grid gap-6 lg:grid-cols-2">
        <UpcomingAppointments />
        <FeatureGuard 
          planFeature="hasAdvancedAnalytics" 
          showUpgradePrompt={false}
          fallback={
            <Card className="border-dashed border-2 border-primary/20">
              <CardContent className="p-8 text-center">
                <Bell className="w-12 h-12 text-primary/40 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Feed de Atividades</h3>
                <p className="text-muted-foreground mb-4">
                  Disponível apenas no plano Premium
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/planos')}
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                >
                  Fazer Upgrade
                </Button>
              </CardContent>
            </Card>
          }
        >
          <ModernActivityFeed />
        </FeatureGuard>
      </div>

      <QuickHelp />
      <FloatingActionButtons />
    </div>
  );
};
