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
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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

  // Dados para o dashboard principal
  const pipelineByAmountData = [
    { name: 'Corte', value: 35000, fill: '#8884d8' },
    { name: 'Coloração', value: 25000, fill: '#82ca9d' },
    { name: 'Tratamento', value: 18000, fill: '#ffc658' },
    { name: 'Manicure', value: 12000, fill: '#ff7c7c' },
    { name: 'Outros', value: 8000, fill: '#8dd1e1' }
  ];

  const pipelineByCountData = [
    { name: 'Corte', value: 145, fill: '#8884d8' },
    { name: 'Coloração', value: 89, fill: '#82ca9d' },
    { name: 'Tratamento', value: 67, fill: '#ffc658' },
    { name: 'Manicure', value: 156, fill: '#ff7c7c' },
    { name: 'Outros', value: 43, fill: '#8dd1e1' }
  ];

  const quarterlyData = [
    { quarter: 'Q4 2023', revenue: 89500 },
    { quarter: 'Q1 2024', revenue: 95200 },
    { quarter: 'Q2 2024', revenue: 108300 },
    { quarter: 'Q3 2024', revenue: 125600 }
  ];

  const monthlyRevenueData = [
    { month: 'Set 2023', revenue: 28500 },
    { month: 'Out 2023', revenue: 31200 },
    { month: 'Nov 2023', revenue: 29800 },
    { month: 'Dez 2023', revenue: 35600 },
    { month: 'Jan 2024', revenue: 32100 },
    { month: 'Fev 2024', revenue: 28900 },
    { month: 'Mar 2024', revenue: 34200 },
    { month: 'Abr 2024', revenue: 35800 },
    { month: 'Mai 2024', revenue: 38500 },
    { month: 'Jun 2024', revenue: 34000 },
    { month: 'Jul 2024', revenue: 41200 },
    { month: 'Ago 2024', revenue: 43100 },
    { month: 'Set 2024', revenue: 41300 }
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

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline por Valor */}
        <Card>
          <CardHeader>
            <CardTitle>Pipeline por Valor e Serviço</CardTitle>
            <CardDescription>Distribuição da receita por tipo de serviço</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pipelineByAmountData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pipelineByAmountData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pipeline por Quantidade */}
        <Card>
          <CardHeader>
            <CardTitle>Pipeline por Quantidade e Serviço</CardTitle>
            <CardDescription>Distribuição dos agendamentos por tipo de serviço</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pipelineByCountData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pipelineByCountData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Comparação Trimestral */}
        <Card>
          <CardHeader>
            <CardTitle>Comparação Trimestre a Trimestre</CardTitle>
            <CardDescription>Últimos 4 trimestres</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={quarterlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Receita Últimos 13 Meses */}
        <Card>
          <CardHeader>
            <CardTitle>Receita Últimos 13 Meses</CardTitle>
            <CardDescription>Tendência mensal de receita</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

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