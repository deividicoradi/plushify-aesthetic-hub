
import React from 'react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useInteractiveChartData } from '@/hooks/useInteractiveChartData';
import { useFinancialData } from '@/hooks/useFinancialData';
import { usePeriodFilter } from '@/hooks/usePeriodFilter';
import { Card, CardContent } from '@/components/ui/card';
import { KPICards } from './KPICards';
import { FinancialEvolutionChart } from './FinancialEvolutionChart';
import { RevenueByMethodChart } from './RevenueByMethodChart';
import { WeeklyCharts } from './WeeklyCharts';
import { ExpensesByCategoryChart } from './ExpensesByCategoryChart';

export const ModernDashboard = () => {
  const dashboardStats = useDashboardStats();
  const chartDataHook = useInteractiveChartData();
  const { dateRange } = usePeriodFilter('6m');
  const { metrics, monthlyData, expensesByCategory, revenueByMethod, loading } = useFinancialData(dateRange);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading || dashboardStats.loading || chartDataHook.loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-muted-foreground mt-2">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs Principais */}
      <KPICards 
        metrics={metrics}
        dashboardStats={dashboardStats}
        formatCurrency={formatCurrency}
      />

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <FinancialEvolutionChart 
          monthlyData={monthlyData || []}
          formatCurrency={formatCurrency}
        />

        <RevenueByMethodChart 
          revenueByMethod={revenueByMethod || []}
          formatCurrency={formatCurrency}
        />
      </div>

      {/* Gráficos da Semana */}
      <WeeklyCharts 
        chartData={chartDataHook.data || []}
        formatCurrency={formatCurrency}
      />

      {/* Gráfico de Despesas por Categoria */}
      <ExpensesByCategoryChart 
        expensesByCategory={expensesByCategory || []}
        formatCurrency={formatCurrency}
      />
    </div>
  );
};
