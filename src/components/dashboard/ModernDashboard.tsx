
import React from 'react';
import { TrendingUp, Users, Calendar, DollarSign, Package, BarChart3, PieChart, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useInteractiveChartData } from '@/hooks/useInteractiveChartData';
import { useWeeklyOverviewData } from '@/hooks/useWeeklyOverviewData';
import { useFinancialData } from '@/hooks/useFinancialData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

export const ModernDashboard = () => {
  const dashboardStats = useDashboardStats();
  const chartDataHook = useInteractiveChartData();
  const weeklyOverviewHook = useWeeklyOverviewData();
  const { metrics, monthlyData, expensesByCategory, revenueByMethod, loading } = useFinancialData();

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-950/50 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Receita Total</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {formatCurrency(metrics?.totalReceitas || 0)}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  +{metrics?.crescimentoReceitas?.toFixed(1) || '0'}% vs mês anterior
                </p>
              </div>
              <div className="bg-blue-500 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-950/50 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 dark:text-green-400 text-sm font-medium">Total Clientes</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {dashboardStats.totalClients || 0}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  +{dashboardStats.newThisMonth || 0} este mês
                </p>
              </div>
              <div className="bg-green-500 p-3 rounded-full">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-950/50 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Agendamentos</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {dashboardStats.totalAppointments || 0}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  {dashboardStats.weeklyAppointments || 0} esta semana
                </p>
              </div>
              <div className="bg-purple-500 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-950/50 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Saldo Líquido</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {formatCurrency(metrics?.saldoLiquido || 0)}
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  Receitas - Despesas
                </p>
              </div>
              <div className="bg-orange-500 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Receitas vs Despesas - Dados Reais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Evolução Financeira - Últimos 6 Meses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {monthlyData && monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip 
                      formatter={(value, name) => [
                        formatCurrency(Number(value)), 
                        name === 'receitas' ? 'Receitas' : 'Despesas'
                      ]}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="receitas" 
                      stackId="1"
                      stroke="#10B981" 
                      fill="#10B981" 
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="despesas" 
                      stackId="2"
                      stroke="#EF4444" 
                      fill="#EF4444" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Nenhum dado financeiro disponível
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Distribuição de Receitas por Método */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-600" />
              Receitas por Método de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {revenueByMethod && revenueByMethod.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={revenueByMethod}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {revenueByMethod.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [formatCurrency(Number(value)), 'Valor']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Nenhum dado de receita disponível
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos da Semana - Dados Reais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agendamentos da Semana */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              Agendamentos da Semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {chartDataHook.data && chartDataHook.data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartDataHook.data}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="agendamentos" 
                      stroke="#6366F1" 
                      strokeWidth={3}
                      dot={{ fill: '#6366F1', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Nenhum agendamento esta semana
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Faturamento da Semana */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Faturamento Semanal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {chartDataHook.data && chartDataHook.data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartDataHook.data}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(Number(value)), 'Faturamento']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar 
                      dataKey="faturamento" 
                      fill="#10B981" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Nenhum faturamento esta semana
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Despesas por Categoria - Dados Reais */}
      {expensesByCategory && expensesByCategory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-red-600" />
              Despesas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [formatCurrency(Number(value)), 'Valor']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
