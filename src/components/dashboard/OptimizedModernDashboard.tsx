import React from 'react';
import { useOptimizedDashboardData } from '@/hooks/useOptimizedDashboardData';
import { usePeriodFilter } from '@/hooks/usePeriodFilter';
import { Card, CardContent } from '@/components/ui/card';
import { KPICards } from './KPICards';
import { FinancialEvolutionChart } from './FinancialEvolutionChart';
import { WeeklyCharts } from './WeeklyCharts';
import { Skeleton } from '@/components/ui/skeleton';

export const OptimizedModernDashboard = () => {
  const { selectedPeriod, setSelectedPeriod, dateRange } = usePeriodFilter('30d');
  const { data, isLoading, error } = useOptimizedDashboardData(dateRange);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Erro ao carregar dados do dashboard</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhum dado disponível</p>
      </div>
    );
  }

  const mockMetrics = {
    totalReceitas: data.stats.monthlyRevenue,
    totalDespesas: 0,
    saldoLiquido: data.stats.monthlyRevenue,
    receitasMesAtual: data.stats.monthlyRevenue,
    despesasMesAtual: 0,
    crescimentoReceitas: 0,
    crescimentoDespesas: 0,
    parcelasVencidas: 0,
    parcelasPendentes: 0,
    ticketMedio: data.stats.totalAppointments > 0 ? data.stats.monthlyRevenue / data.stats.totalAppointments : 0
  };

  const mockDashboardStats = {
    ...data.stats,
    loading: false
  };

  return (
    <div className="space-y-6">
      {/* KPIs Principais */}
      <KPICards 
        metrics={mockMetrics}
        dashboardStats={mockDashboardStats}
        formatCurrency={formatCurrency}
      />

      {/* Gráficos da Semana */}
      <WeeklyCharts 
        chartData={data.chartData}
        formatCurrency={formatCurrency}
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
      />
    </div>
  );
};