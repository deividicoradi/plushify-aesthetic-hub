
import React from 'react';
import { BarChart3 } from 'lucide-react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
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
    <ResponsiveLayout
      title="Relatórios"
      subtitle="Análise detalhada do seu negócio"
      icon={BarChart3}
    >
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
    </ResponsiveLayout>
  );
};

export default Reports;
