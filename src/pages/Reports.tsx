
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Users, CalendarDays, Receipt, Package, AlertTriangle, BarChart3, PieChart, Activity } from 'lucide-react';
import { MonthlyChart } from '@/components/reports/MonthlyChart';
import { CategoryChart } from '@/components/reports/CategoryChart';
import { InsightsSection } from '@/components/reports/InsightsSection';
import { useReportsData } from '@/hooks/useReportsData';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

// Componente MetricCard inline para substituir o deletado
interface MetricCardProps {
  title: string;
  value: number;
  growth?: number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  colorClass: string;
  loading: boolean;
  onClick: () => void;
}

const MetricCard = ({ title, value, growth, icon: Icon, description, colorClass, loading, onClick }: MetricCardProps) => {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200 bg-card border-border"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">
              {loading ? '...' : (title.includes('Receita') ? `R$ ${value.toLocaleString('pt-BR')}` : value.toString())}
            </p>
            <p className="text-xs text-muted-foreground">{description}</p>
            {growth !== undefined && (
              <div className={`text-xs font-medium ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {growth >= 0 ? '+' : ''}{growth.toFixed(1)}% vs mês anterior
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${colorClass} text-white`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Reports = () => {
  const navigate = useNavigate();
  const { metrics, monthlyData, revenueByCategory, loading, error, refetch } = useReportsData();

  const handleCardClick = (route: string) => {
    navigate(route);
  };

  if (error) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <div className="flex flex-col min-h-screen w-full bg-background">
              <header className="flex items-center gap-4 border-b bg-background px-4 py-3">
                <SidebarTrigger />
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <div className="w-8 h-8 bg-destructive rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-destructive-foreground" />
                    </div>
                    Relatórios e Análises
                  </h1>
                </div>
              </header>
              <main className="flex-1 p-6">
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-destructive rounded-lg flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-10 h-10 text-destructive-foreground" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Ops! Algo deu errado</h2>
                  <p className="text-muted-foreground mb-6">Erro ao carregar dados: {error}</p>
                  <Button onClick={refetch}>
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
            <header className="flex items-center gap-4 border-b bg-background px-6 py-4">
              <SidebarTrigger />
              <div className="flex items-center justify-between flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">
                      Relatórios e Análises
                    </h1>
                    <p className="text-sm text-muted-foreground">Acompanhe o desempenho do seu negócio</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="border-green-200 text-green-700 dark:border-green-800 dark:text-green-300">
                    <Activity className="w-3 h-3 mr-1" />
                    Dados atualizados
                  </Badge>
                  <Button onClick={refetch} variant="outline" size="sm">
                    Atualizar
                  </Button>
                </div>
              </div>
            </header>

            {/* Main content */}
            <main className="flex-1 p-6 space-y-6">
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <MetricCard
                  title="Total de Clientes"
                  value={metrics?.totalClients || 0}
                  growth={metrics?.clientsGrowth}
                  icon={Users}
                  description="Clientes cadastrados"
                  colorClass="bg-emerald-600"
                  loading={loading}
                  onClick={() => handleCardClick('/clients')}
                />

                <MetricCard
                  title="Receita Total"
                  value={metrics?.totalRevenue || 0}
                  growth={metrics?.revenueGrowth}
                  icon={Receipt}
                  description="Receita acumulada"
                  colorClass="bg-blue-600"
                  loading={loading}
                  onClick={() => handleCardClick('/financial')}
                />

                <MetricCard
                  title="Agendamentos"
                  value={metrics?.totalAppointments || 0}
                  growth={metrics?.appointmentsGrowth}
                  icon={CalendarDays}
                  description="Total de agendamentos"
                  colorClass="bg-purple-600"
                  loading={loading}
                  onClick={() => handleCardClick('/appointments')}
                />

                <MetricCard
                  title="Produtos Cadastrados"
                  value={metrics?.totalProducts || 0}
                  icon={Package}
                  description={`${metrics?.lowStockProducts || 0} com estoque baixo`}
                  colorClass="bg-orange-600"
                  loading={loading}
                  onClick={() => handleCardClick('/inventory')}
                />
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      <CardTitle className="text-xl">Evolução Mensal</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <MonthlyChart data={monthlyData} loading={loading} />
                  </CardContent>
                </Card>

                <Card className="bg-card border-border shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
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
              <Card className="bg-card border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Resumo de Performance</CardTitle>
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
              </div>

              {/* Insights Section */}
              <InsightsSection metrics={metrics} loading={loading} />
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Reports;
