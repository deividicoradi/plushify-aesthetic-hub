
import React from 'react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { FeatureGuard } from '@/components/FeatureGuard';
import { useReportsData } from '@/hooks/useReportsData';
import { useNavigate } from 'react-router-dom';
import { ReportsHeader } from '@/components/reports/ReportsHeader';
import { MetricsGrid } from '@/components/reports/MetricsGrid';
import { PerformanceSummary } from '@/components/reports/PerformanceSummary';
import { ChartsSection } from '@/components/reports/ChartsSection';
import { InsightsSection } from '@/components/reports/InsightsSection';
import { ReportsErrorState } from '@/components/reports/ReportsErrorState';

const Reports = () => {
  const { metrics, monthlyData, revenueByCategory, loading, error, refetch } = useReportsData();
  const navigate = useNavigate();

  const handleCardClick = (route: string) => {
    navigate(route);
  };

  if (error) {
    return <ReportsErrorState error={error} onRetry={refetch} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="ml-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3 sticky top-0 z-50">
          <div className="flex-1">
            <ReportsHeader onRefresh={refetch} />
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-6 bg-background space-y-8 overflow-y-auto">
          <FeatureGuard 
            planFeature="hasReportsDetailed"
            showUpgradePrompt={true}
          >
            <div className="space-y-8">
              {/* Métricas principais */}
              <MetricsGrid 
                metrics={metrics} 
                loading={loading} 
                onCardClick={handleCardClick}
              />

              {/* Resumo de performance - só para plano Premium */}
              <FeatureGuard 
                planFeature="hasAdvancedAnalytics"
                showUpgradePrompt={false}
              >
                <PerformanceSummary metrics={metrics} />
              </FeatureGuard>

              {/* Gráficos */}
              <ChartsSection 
                monthlyData={monthlyData} 
                revenueByCategory={revenueByCategory}
                loading={loading}
              />

              {/* Insights avançados - só para plano Premium */}
              <FeatureGuard 
                planFeature="hasAdvancedAnalytics"
                showUpgradePrompt={false}
              >
                <InsightsSection metrics={metrics} loading={loading} />
              </FeatureGuard>
            </div>
          </FeatureGuard>
        </main>
      </div>
    </div>
  );
};

export default Reports;
