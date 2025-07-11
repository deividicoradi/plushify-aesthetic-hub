import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useReportsData } from '@/hooks/useReportsData';
import { useAnalyticsChartData } from '@/hooks/analytics/useAnalyticsData';
import AnalyticsKPICards from './AnalyticsKPICards';
import AnalyticsPipelineCharts from './AnalyticsPipelineCharts';
import AnalyticsPerformanceCharts from './AnalyticsPerformanceCharts';
import AnalyticsInsights from './AnalyticsInsights';

export const AnalyticsDashboard: React.FC = () => {
  const dashboardStats = useDashboardStats();
  const reportsData = useReportsData();
  const { pipelineByAmountData, pipelineByCountData, quarterlyData, monthlyRevenueData, loading: chartLoading } = useAnalyticsChartData();

  if (dashboardStats.loading || reportsData.loading || chartLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Analytics de Negócio</h2>
          <Badge variant="outline">Carregando...</Badge>
        </div>
        
        <AnalyticsKPICards
          totalClients={0}
          monthlyRevenue={0}
          weeklyAppointments={0}
          newThisMonth={0}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-muted rounded animate-pulse" />
          <div className="h-80 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics de Negócio</h2>
          <p className="text-muted-foreground">
            Insights avançados sobre o desempenho do seu negócio • Análises em tempo real
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Activity className="h-3 w-3" />
            Analytics Avançados
          </Badge>
        </div>
      </div>

      {/* Métricas Principais */}
      <AnalyticsKPICards
        totalClients={dashboardStats.totalClients}
        monthlyRevenue={dashboardStats.monthlyRevenue}
        weeklyAppointments={dashboardStats.weeklyAppointments}
        newThisMonth={dashboardStats.newThisMonth}
        revenueGrowth={reportsData.metrics?.revenueGrowth}
      />

      {/* Gráficos Principais */}
      <AnalyticsPipelineCharts
        pipelineByAmountData={pipelineByAmountData}
        pipelineByCountData={pipelineByCountData}
      />

      {/* Gráficos de Performance */}
      <AnalyticsPerformanceCharts
        quarterlyData={quarterlyData}
        monthlyRevenueData={monthlyRevenueData}
      />

      {/* Resumo de Insights */}
      <AnalyticsInsights newThisMonth={dashboardStats.newThisMonth} />
    </div>
  );
};