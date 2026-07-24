
import React from 'react';
import { BarChart3, Lock } from 'lucide-react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { FeatureGuard } from '@/components/FeatureGuard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useStaffMode } from '@/contexts/StaffModeContext';
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
  const { isStaffMode, can } = useStaffMode();

  const handleCardClick = (route: string) => {
    navigate(route);
  };

  if (error) {
    return <ReportsErrorState error={error} onRetry={refetch} />;
  }

  if (isStaffMode && !can('view_reports')) {
    return (
      <ResponsiveLayout title="Relatórios" icon={BarChart3}>
        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
          <Lock className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            O cargo deste funcionário não tem acesso a Relatórios no Modo Funcionário.
          </AlertDescription>
        </Alert>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout
      title="Relatórios"
      subtitle="Análise detalhada do seu negócio"
      icon={BarChart3}
    >
          <FeatureGuard
            planFeature="hasReportsBasic"
            showUpgradePrompt={true}
          >
            <div className="space-y-5 sm:space-y-6 lg:space-y-8">
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
