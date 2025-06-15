
import React from 'react';
import { Users, Calendar, DollarSign, Package } from 'lucide-react';
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
  const dashboardStats = useDashboardStats();
  const chartDataHook = useInteractiveChartData();
  const weeklyOverviewHook = useWeeklyOverviewData();
  const appointmentsHook = useAppointments();
  const { metrics } = useFinancialData();
  const { currentPlan, limits } = usePlanLimits();

  // Filtrar próximos agendamentos
  const upcomingAppointments = appointmentsHook.appointments?.filter(apt => 
    new Date(apt.appointment_date) >= new Date() && apt.status === 'agendado'
  )?.slice(0, 5) || [];

  return (
    <div className="space-y-6 pb-20">
      <DashboardHeader />
      
      <PlanInfoBanner />
      
      <div className="grid gap-6 lg:grid-cols-4">
        <ModernMetricCard
          title="Clientes"
          value={dashboardStats.totalClients || 0}
          change={dashboardStats.newThisMonth || 0}
          icon={Users}
          loading={dashboardStats.loading}
          limit={limits.clients}
          currentCount={dashboardStats.totalClients || 0}
          feature="clients"
        />
        
        <ModernMetricCard
          title="Agendamentos"
          value={dashboardStats.totalAppointments || 0}
          change={dashboardStats.weeklyAppointments || 0}
          icon={Calendar}
          loading={dashboardStats.loading}
          limit={limits.appointments}
          currentCount={dashboardStats.totalAppointments || 0}
          feature="appointments"
        />
        
        <FeatureGuard planFeature="hasFinancialManagement" showUpgradePrompt={false}>
          <ModernMetricCard
            title="Receita Mensal"
            value={metrics?.receitasMesAtual || 0}
            change={metrics?.crescimentoReceitas || 0}
            icon={DollarSign}
            loading={dashboardStats.loading}
            isCurrency
            feature="revenue"
          />
        </FeatureGuard>
        
        <FeatureGuard planFeature="hasInventoryAdvanced" showUpgradePrompt={false}>
          <ModernMetricCard
            title="Produtos"
            value={dashboardStats.totalClients || 0}
            change={0}
            icon={Package}
            loading={dashboardStats.loading}
            limit={limits.products}
            currentCount={dashboardStats.totalClients || 0}
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
                  Disponível apenas no plano Premium
                </p>
              </div>
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

      <div className="grid gap-6 lg:grid-cols-2">
        <UpcomingAppointments />
        <FeatureGuard 
          planFeature="hasAdvancedAnalytics" 
          showUpgradePrompt={false}
          fallback={
            <div className="bg-card rounded-lg border p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Feed de Atividades</h3>
              <p className="text-muted-foreground text-sm">
                Disponível apenas no plano Premium
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
