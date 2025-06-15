
import React from 'react';
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
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useInteractiveChartData } from '@/hooks/useInteractiveChartData';
import { useWeeklyOverviewData } from '@/hooks/useWeeklyOverviewData';
import { useAppointments } from '@/hooks/useAppointments';
import { useFinancialData } from '@/hooks/useFinancialData';
import { usePlanLimits } from '@/hooks/usePlanLimits';

export const ModernDashboard = () => {
  const { stats, loading: statsLoading } = useDashboardStats();
  const { chartData, loading: chartLoading } = useInteractiveChartData();
  const { weeklyData, loading: weeklyLoading } = useWeeklyOverviewData();
  const { data: appointments } = useAppointments();
  const { metrics } = useFinancialData();
  const { currentPlan, limits } = usePlanLimits();

  // Filtrar próximos agendamentos
  const upcomingAppointments = appointments?.filter(apt => 
    new Date(apt.appointment_date) >= new Date() && apt.status === 'agendado'
  )?.slice(0, 5) || [];

  return (
    <div className="space-y-6 pb-20">
      <DashboardHeader />
      
      <PlanInfoBanner currentPlan={currentPlan} limits={limits} />
      
      <div className="grid gap-6 lg:grid-cols-4">
        <ModernMetricCard
          title="Clientes"
          value={stats?.totalClients || 0}
          change={stats?.clientsGrowth || 0}
          icon="users"
          loading={statsLoading}
          limit={limits.clients}
          currentCount={stats?.totalClients || 0}
          feature="clients"
        />
        
        <ModernMetricCard
          title="Agendamentos"
          value={stats?.totalAppointments || 0}
          change={stats?.appointmentsGrowth || 0}
          icon="calendar"
          loading={statsLoading}
          limit={limits.appointments}
          currentCount={stats?.totalAppointments || 0}
          feature="appointments"
        />
        
        <FeatureGuard planFeature="hasFinancialManagement" showUpgradePrompt={false}>
          <ModernMetricCard
            title="Receita Mensal"
            value={metrics?.totalRevenue || 0}
            change={metrics?.revenueGrowth || 0}
            icon="dollar-sign"
            loading={statsLoading}
            isCurrency
            feature="revenue"
          />
        </FeatureGuard>
        
        <FeatureGuard planFeature="hasInventoryAdvanced" showUpgradePrompt={false}>
          <ModernMetricCard
            title="Produtos"
            value={stats?.totalProducts || 0}
            change={stats?.productsGrowth || 0}
            icon="package"
            loading={statsLoading}
            limit={limits.products}
            currentCount={stats?.totalProducts || 0}
            feature="products"
          />
        </FeatureGuard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FeatureGuard 
            planFeature="hasAdvancedAnalytics" 
            showUpgradePrompt={false}
            fallback={
              <div className="bg-card rounded-lg border p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">Gráficos Avançados</h3>
                <p className="text-muted-foreground text-sm">
                  Disponível apenas no plano Enterprise
                </p>
              </div>
            }
          >
            <InteractiveChart data={chartData} loading={chartLoading} />
          </FeatureGuard>
        </div>
        
        <div className="space-y-6">
          <WeeklyOverview data={weeklyData} loading={weeklyLoading} />
          <AlertsPanel />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <UpcomingAppointments appointments={upcomingAppointments} />
        <FeatureGuard 
          planFeature="hasAdvancedAnalytics" 
          showUpgradePrompt={false}
          fallback={
            <div className="bg-card rounded-lg border p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Feed de Atividades</h3>
              <p className="text-muted-foreground text-sm">
                Disponível apenas no plano Enterprise
              </p>
            </div>
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
