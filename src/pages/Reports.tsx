
import React from 'react';
import { TrendingUp, Users, CalendarDays, Receipt, Package, AlertTriangle } from 'lucide-react';
import { MetricCard } from '@/components/reports/MetricCard';
import { MonthlyChart } from '@/components/reports/MonthlyChart';
import { CategoryChart } from '@/components/reports/CategoryChart';
import { InsightsSection } from '@/components/reports/InsightsSection';
import { useReportsData } from '@/hooks/useReportsData';
import { Button } from "@/components/ui/button";

const Reports = () => {
  const { metrics, monthlyData, revenueByCategory, loading, error, refetch } = useReportsData();

  if (error) {
    return (
      <div className="min-h-screen bg-background dark:bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Relatórios e Análises</h1>
          </div>
          
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive mb-4">Erro ao carregar dados: {error}</p>
            <Button onClick={refetch} variant="outline">
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Relatórios e Análises</h1>
          </div>
          <Button onClick={refetch} variant="outline" size="sm">
            Atualizar Dados
          </Button>
        </div>

        {/* Métricas principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total de Clientes"
            value={metrics?.totalClients || 0}
            growth={metrics?.clientsGrowth}
            icon={Users}
            description="Clientes cadastrados"
            colorClass="from-green-50 to-emerald-50 border-green-200 dark:from-green-950/20 dark:to-emerald-950/20 dark:border-green-800"
            loading={loading}
          />

          <MetricCard
            title="Receita Total"
            value={metrics?.totalRevenue || 0}
            growth={metrics?.revenueGrowth}
            icon={Receipt}
            description="Receita acumulada"
            colorClass="from-blue-50 to-cyan-50 border-blue-200 dark:from-blue-950/20 dark:to-cyan-950/20 dark:border-blue-800"
            loading={loading}
          />

          <MetricCard
            title="Agendamentos"
            value={metrics?.totalAppointments || 0}
            growth={metrics?.appointmentsGrowth}
            icon={CalendarDays}
            description="Total de agendamentos"
            colorClass="from-purple-50 to-pink-50 border-purple-200 dark:from-purple-950/20 dark:to-pink-950/20 dark:border-purple-800"
            loading={loading}
          />

          <MetricCard
            title="Produtos Cadastrados"
            value={metrics?.totalProducts || 0}
            icon={Package}
            description={`${metrics?.lowStockProducts || 0} com estoque baixo`}
            colorClass="from-orange-50 to-yellow-50 border-orange-200 dark:from-orange-950/20 dark:to-yellow-950/20 dark:border-orange-800"
            loading={loading}
          />
        </div>

        {/* Gráficos e análises detalhadas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MonthlyChart data={monthlyData} loading={loading} />
          <CategoryChart data={revenueByCategory} loading={loading} />
        </div>

        {/* Insights e recomendações */}
        <InsightsSection metrics={metrics} loading={loading} />
      </div>
    </div>
  );
};

export default Reports;
