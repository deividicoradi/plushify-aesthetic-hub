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