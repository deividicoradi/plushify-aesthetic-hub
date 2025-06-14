
import React from 'react';
import { TrendingUp, Users, CalendarDays, Receipt, Package, AlertTriangle } from 'lucide-react';
import { MetricCard } from '@/components/reports/MetricCard';
import { MonthlyChart } from '@/components/reports/MonthlyChart';
import { CategoryChart } from '@/components/reports/CategoryChart';
import { InsightsSection } from '@/components/reports/InsightsSection';
import { useReportsData } from '@/hooks/useReportsData';
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

const Reports = () => {
  const { metrics, monthlyData, revenueByCategory, loading, error, refetch } = useReportsData();

  if (error) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <div className="flex flex-col min-h-screen w-full bg-background">
              <header className="flex items-center gap-4 border-b border-border bg-card px-4 py-3">
                <SidebarTrigger />
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <TrendingUp className="w-6 h-6" />
                    Relatórios e Análises
                  </h1>
                </div>
              </header>
              <main className="flex-1 p-6 bg-background">
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
                  <p className="text-destructive mb-4">Erro ao carregar dados: {error}</p>
                  <Button onClick={refetch} variant="outline">
                    Tentar novamente
                  </Button>
                </div>
              </main>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="flex flex-col min-h-screen w-full bg-background">
            {/* Header */}
            <header className="flex items-center gap-4 border-b border-border bg-card px-4 py-3">
              <SidebarTrigger />
              <div className="flex items-center justify-between flex-1">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-primary" />
                  <h1 className="text-2xl font-bold text-foreground">Relatórios e Análises</h1>
                </div>
                <Button onClick={refetch} variant="outline" size="sm">
                  Atualizar Dados
                </Button>
              </div>
            </header>

            {/* Main content */}
            <main className="flex-1 p-6 space-y-6 bg-background">
              {/* Métricas principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Total de Clientes"
                  value={metrics?.totalClients || 0}
                  growth={metrics?.clientsGrowth}
                  icon={Users}
                  description="Clientes cadastrados"
                  colorClass="from-green-500/20 to-emerald-500/20 border-green-500/30 dark:from-green-500/10 dark:to-emerald-500/10 dark:border-green-500/20"
                  loading={loading}
                />

                <MetricCard
                  title="Receita Total"
                  value={metrics?.totalRevenue || 0}
                  growth={metrics?.revenueGrowth}
                  icon={Receipt}
                  description="Receita acumulada"
                  colorClass="from-blue-500/20 to-cyan-500/20 border-blue-500/30 dark:from-blue-500/10 dark:to-cyan-500/10 dark:border-blue-500/20"
                  loading={loading}
                />

                <MetricCard
                  title="Agendamentos"
                  value={metrics?.totalAppointments || 0}
                  growth={metrics?.appointmentsGrowth}
                  icon={CalendarDays}
                  description="Total de agendamentos"
                  colorClass="from-purple-500/20 to-pink-500/20 border-purple-500/30 dark:from-purple-500/10 dark:to-pink-500/10 dark:border-purple-500/20"
                  loading={loading}
                />

                <MetricCard
                  title="Produtos Cadastrados"
                  value={metrics?.totalProducts || 0}
                  icon={Package}
                  description={`${metrics?.lowStockProducts || 0} com estoque baixo`}
                  colorClass="from-orange-500/20 to-yellow-500/20 border-orange-500/30 dark:from-orange-500/10 dark:to-yellow-500/10 dark:border-orange-500/20"
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
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Reports;
