
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { useReportsData } from '@/hooks/useReportsData';
import { ReportsHeader } from '@/components/reports/ReportsHeader';
import { ReportsErrorState } from '@/components/reports/ReportsErrorState';
import { MetricsGrid } from '@/components/reports/MetricsGrid';
import { ChartsSection } from '@/components/reports/ChartsSection';
import { PerformanceSummary } from '@/components/reports/PerformanceSummary';
import { InsightsSection } from '@/components/reports/InsightsSection';

const Reports = () => {
  const navigate = useNavigate();
  const { metrics, monthlyData, revenueByCategory, loading, error, refetch } = useReportsData();

  const handleCardClick = (route: string) => {
    navigate(route);
  };

  if (error) {
    return <ReportsErrorState error={error} onRetry={refetch} />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="flex flex-col min-h-screen w-full bg-background">
            <ReportsHeader onRefresh={refetch} />

            <main className="flex-1 p-6 space-y-6">
              <MetricsGrid 
                metrics={metrics} 
                loading={loading} 
                onCardClick={handleCardClick} 
              />

              <ChartsSection 
                monthlyData={monthlyData} 
                revenueByCategory={revenueByCategory} 
                loading={loading} 
              />

              <PerformanceSummary metrics={metrics} />

              <InsightsSection metrics={metrics} loading={loading} />
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Reports;
