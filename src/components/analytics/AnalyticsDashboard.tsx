import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  Calendar,
  Award,
  Activity
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClientROITable } from './ClientROITable';
import { RevenueForecastChart } from './RevenueForecastChart';
import { ServicePerformanceChart } from './ServicePerformanceChart';
import { TimeAnalysisCharts } from './TimeAnalysisCharts';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useReportsData } from '@/hooks/useReportsData';

export const AnalyticsDashboard: React.FC = () => {
  const dashboardStats = useDashboardStats();
  const reportsData = useReportsData();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (current: number, previous: number) => {
    if (previous === 0) return '+0%';
    const percentage = ((current - previous) / previous) * 100;
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  };

  // Dados mockados para os novos componentes de analytics avançados
  const clientROIData = [
    {
      client_id: '1',
      client_name: 'Maria Silva',
      total_spent: 2500,
      total_appointments: 12,
      average_per_visit: 208.33,
      last_visit: '2024-01-15',
      loyalty_score: 8.5,
      roi_category: 'VIP',
      lifetime_value: 3000,
      roi_score: 9.2,
      frequency_score: 8.8
    },
    {
      client_id: '2', 
      client_name: 'João Santos',
      total_spent: 1800,
      total_appointments: 8,
      average_per_visit: 225.00,
      last_visit: '2024-01-10',
      loyalty_score: 7.2,
      roi_category: 'Premium',
      lifetime_value: 2200,
      roi_score: 7.8,
      frequency_score: 6.5
    }
  ];

  const forecastData = [
    { 
      period: 'Jan 2024', 
      actual_revenue: 15000, 
      predicted_revenue: 15200, 
      confidence_interval: { lower: 14500, upper: 15900 },
      trend: 'up' as const
    },
    { 
      period: 'Fev 2024', 
      actual_revenue: 18000, 
      predicted_revenue: 17800, 
      confidence_interval: { lower: 17200, upper: 18400 },
      trend: 'up' as const
    },
    { 
      period: 'Mar 2024', 
      actual_revenue: null, 
      predicted_revenue: 19500, 
      confidence_interval: { lower: 18800, upper: 20200 },
      trend: 'up' as const
    },
    { 
      period: 'Abr 2024', 
      actual_revenue: null, 
      predicted_revenue: 21000, 
      confidence_interval: { lower: 20100, upper: 21900 },
      trend: 'up' as const
    }
  ];

  const servicePerformanceData = [
    { 
      service_name: 'Corte Feminino', 
      total_appointments: 45,
      total_revenue: 12000, 
      average_price: 266.67,
      average_duration: 90, 
      satisfaction_rating: 4.8,
      growth_rate: 15.2,
      popularity_rank: 1
    },
    { 
      service_name: 'Coloração', 
      total_appointments: 20,
      total_revenue: 8500, 
      average_price: 425.00,
      average_duration: 180, 
      satisfaction_rating: 4.9,
      growth_rate: 8.7,
      popularity_rank: 2
    },
    { 
      service_name: 'Manicure', 
      total_appointments: 35,
      total_revenue: 3500, 
      average_price: 100.00,
      average_duration: 45, 
      satisfaction_rating: 4.7,
      growth_rate: 5.3,
      popularity_rank: 3
    }
  ];

  const hourlyData = [
    { hour: 8, appointments_count: 2, revenue: 280 },
    { hour: 9, appointments_count: 4, revenue: 520 },
    { hour: 10, appointments_count: 6, revenue: 780 },
    { hour: 11, appointments_count: 5, revenue: 650 },
    { hour: 14, appointments_count: 7, revenue: 910 },
    { hour: 15, appointments_count: 8, revenue: 1040 },
    { hour: 16, appointments_count: 6, revenue: 780 },
    { hour: 17, appointments_count: 4, revenue: 520 }
  ];

  const seasonalData = [
    { month: 'Jan 2023', revenue: 45000, appointments: 180, growth_rate: 5.2 },
    { month: 'Abr 2023', revenue: 52000, appointments: 210, growth_rate: 15.6 },
    { month: 'Jul 2023', revenue: 48000, appointments: 195, growth_rate: -7.7 },
    { month: 'Out 2023', revenue: 58000, appointments: 240, growth_rate: 20.8 },
    { month: 'Jan 2024', revenue: 62000, appointments: 265, growth_rate: 6.9 }
  ];

  if (dashboardStats.loading || reportsData.loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Analytics de Negócio</h2>
          <Badge variant="outline">Carregando...</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse mb-2" />
                <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics de Negócio</h2>
          <p className="text-muted-foreground">
            Insights avançados sobre o desempenho do seu negócio • Análises em tempo real
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Activity className="h-3 w-3" />
            Analytics Avançados
          </Badge>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +{dashboardStats.newThisMonth} este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardStats.monthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              {reportsData.metrics?.revenueGrowth ? formatPercentage(reportsData.metrics.revenueGrowth, 0) : '+0%'} vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos Semanais</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.weeklyAppointments}</div>
            <p className="text-xs text-muted-foreground">
              Agendamentos desta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardStats.weeklyAppointments > 0 
                ? dashboardStats.monthlyRevenue / dashboardStats.weeklyAppointments * 4 
                : 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor médio por agendamento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Detalhados */}
      <Tabs defaultValue="clientes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="clientes">ROI por Cliente</TabsTrigger>
          <TabsTrigger value="previsao">Previsão de Receita</TabsTrigger>
          <TabsTrigger value="servicos">Performance de Serviços</TabsTrigger>
          <TabsTrigger value="tempo">Análise Temporal</TabsTrigger>
        </TabsList>

        <TabsContent value="clientes" className="space-y-4">
          <ClientROITable data={clientROIData} loading={false} />
        </TabsContent>

        <TabsContent value="previsao" className="space-y-4">
          <RevenueForecastChart data={forecastData} loading={false} />
        </TabsContent>

        <TabsContent value="servicos" className="space-y-4">
          <ServicePerformanceChart data={servicePerformanceData} loading={false} />
        </TabsContent>

        <TabsContent value="tempo" className="space-y-4">
          <TimeAnalysisCharts 
            hourlyData={hourlyData} 
            seasonalData={seasonalData} 
            loading={false} 
          />
        </TabsContent>
      </Tabs>

      {/* Resumo de Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insights Principais</CardTitle>
          <CardDescription>
            Análises automáticas baseadas nos seus dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">
                📈 Crescimento Positivo
              </h4>
              <p className="text-sm text-muted-foreground">
                Seu negócio cresceu {dashboardStats.newThisMonth} novos clientes este mês, 
                mostrando uma tendência positiva de expansão.
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
                🕐 Horário de Pico
              </h4>
              <p className="text-sm text-muted-foreground">
                O período entre 15h-16h é o mais movimentado, 
                considere otimizar a agenda para esse horário.
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">
                💎 Clientes VIP
              </h4>
              <p className="text-sm text-muted-foreground">
                Identifique e cultive relacionamentos com seus top clientes 
                para maximizar o lifetime value.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};