
import React from 'react';
import { TrendingUp, Users, CalendarDays, Receipt, Package, AlertTriangle, BarChart3, PieChart, Activity, Target } from 'lucide-react';
import { MetricCard } from '@/components/reports/MetricCard';
import { MonthlyChart } from '@/components/reports/MonthlyChart';
import { CategoryChart } from '@/components/reports/CategoryChart';
import { InsightsSection } from '@/components/reports/InsightsSection';
import { useReportsData } from '@/hooks/useReportsData';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
            <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/20">
              <header className="flex items-center gap-4 border-b border-border/50 bg-card/80 backdrop-blur-sm px-4 py-3">
                <SidebarTrigger />
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    Relatórios e Análises
                  </h1>
                </div>
              </header>
              <main className="flex-1 p-6 bg-gradient-to-br from-background via-background to-muted/20">
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Ops! Algo deu errado</h2>
                  <p className="text-muted-foreground mb-6">Erro ao carregar dados: {error}</p>
                  <Button onClick={refetch} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
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
          <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/20">
            {/* Modern Header with Gradient */}
            <header className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10" />
              <div className="relative flex items-center gap-4 border-b border-border/50 bg-card/80 backdrop-blur-sm px-6 py-4">
                <SidebarTrigger />
                <div className="flex items-center justify-between flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Relatórios e Análises
                      </h1>
                      <p className="text-sm text-muted-foreground">Insights inteligentes para seu negócio</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 dark:bg-green-950/20 dark:border-green-800 dark:text-green-300">
                      <Activity className="w-3 h-3 mr-1" />
                      Dados atualizados
                    </Badge>
                    <Button onClick={refetch} variant="outline" size="sm" className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50">
                      Atualizar Dados
                    </Button>
                  </div>
                </div>
              </div>
            </header>

            {/* Main content with modern spacing */}
            <main className="flex-1 p-6 space-y-8">
              {/* Welcome Section */}
              <div className="text-center py-8">
                <h2 className="text-3xl font-bold mb-2">Dashboard Executivo</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Acompanhe o desempenho do seu negócio com métricas em tempo real e insights inteligentes
                </p>
              </div>

              {/* Enhanced Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <MetricCard
                  title="Total de Clientes"
                  value={metrics?.totalClients || 0}
                  growth={metrics?.clientsGrowth}
                  icon={Users}
                  description="Clientes cadastrados"
                  colorClass="from-emerald-500 to-emerald-600"
                  loading={loading}
                />

                <MetricCard
                  title="Receita Total"
                  value={metrics?.totalRevenue || 0}
                  growth={metrics?.revenueGrowth}
                  icon={Receipt}
                  description="Receita acumulada"
                  colorClass="from-blue-500 to-blue-600"
                  loading={loading}
                />

                <MetricCard
                  title="Agendamentos"
                  value={metrics?.totalAppointments || 0}
                  growth={metrics?.appointmentsGrowth}
                  icon={CalendarDays}
                  description="Total de agendamentos"
                  colorClass="from-purple-500 to-purple-600"
                  loading={loading}
                />

                <MetricCard
                  title="Produtos Cadastrados"
                  value={metrics?.totalProducts || 0}
                  icon={Package}
                  description={`${metrics?.lowStockProducts || 0} com estoque baixo`}
                  colorClass="from-orange-500 to-orange-600"
                  loading={loading}
                />
              </div>

              {/* Charts Section with Modern Cards */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      <CardTitle className="text-xl">Evolução Mensal</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <MonthlyChart data={monthlyData} loading={loading} />
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <PieChart className="w-4 h-4 text-white" />
                      </div>
                      <CardTitle className="text-xl">Receita por Categoria</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CategoryChart data={revenueByCategory} loading={loading} />
                  </CardContent>
                </Card>
              </div>

              {/* Performance Summary */}
              <Card className="bg-gradient-to-r from-slate-50 to-blue-50/50 dark:from-slate-900/50 dark:to-blue-950/20 border-border/50 shadow-xl">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                    <CardTitle className="text-xl">Resumo de Performance</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                        {metrics?.clientsGrowth ? (metrics.clientsGrowth > 0 ? '+' : '') + metrics.clientsGrowth.toFixed(1) : '0'}%
                      </div>
                      <p className="text-sm text-muted-foreground">Crescimento de Clientes</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                        {metrics?.revenueGrowth ? (metrics.revenueGrowth > 0 ? '+' : '') + metrics.revenueGrowth.toFixed(1) : '0'}%
                      </div>
                      <p className="text-sm text-muted-foreground">Crescimento de Receita</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                        {metrics?.appointmentsGrowth ? (metrics.appointmentsGrowth > 0 ? '+' : '') + metrics.appointmentsGrowth.toFixed(1) : '0'}%
                      </div>
                      <p className="text-sm text-muted-foreground">Crescimento de Agendamentos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Insights Section */}
              <InsightsSection metrics={metrics} loading={loading} />
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Reports;
