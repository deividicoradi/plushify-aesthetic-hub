
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, TrendingUp, TrendingDown, BarChart3, ArrowRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { generateComparativeReport } from '@/utils/exportUtils';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export const ComparativeReport = () => {
  const { user } = useAuth();
  const [period1, setPeriod1] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const [period2, setPeriod2] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(subMonths(new Date(), 1)),
    to: endOfMonth(subMonths(new Date(), 1))
  });
  const [comparisonType, setComparisonType] = useState<string>('custom');

  // Buscar dados do primeiro período
  const { data: data1, isLoading: loading1 } = useQuery({
    queryKey: ['comparative-report-1', user?.id, period1.from, period1.to],
    queryFn: async () => {
      const fromDate = period1.from.toISOString();
      const toDate = period1.to.toISOString();

      const [paymentsResult, expensesResult, installmentsResult] = await Promise.all([
        supabase
          .from('payments')
          .select('*')
          .eq('user_id', user?.id)
          .gte('created_at', fromDate)
          .lte('created_at', toDate),
        supabase
          .from('expenses')
          .select('*')
          .eq('user_id', user?.id)
          .gte('expense_date', fromDate)
          .lte('expense_date', toDate),
        supabase
          .from('installments')
          .select('*')
          .eq('user_id', user?.id)
          .gte('due_date', fromDate)
          .lte('due_date', toDate)
      ]);

      return {
        payments: paymentsResult.data || [],
        expenses: expensesResult.data || [],
        installments: installmentsResult.data || [],
        period: { from: fromDate, to: toDate }
      };
    },
    enabled: !!user?.id,
  });

  // Buscar dados do segundo período
  const { data: data2, isLoading: loading2 } = useQuery({
    queryKey: ['comparative-report-2', user?.id, period2.from, period2.to],
    queryFn: async () => {
      const fromDate = period2.from.toISOString();
      const toDate = period2.to.toISOString();

      const [paymentsResult, expensesResult, installmentsResult] = await Promise.all([
        supabase
          .from('payments')
          .select('*')
          .eq('user_id', user?.id)
          .gte('created_at', fromDate)
          .lte('created_at', toDate),
        supabase
          .from('expenses')
          .select('*')
          .eq('user_id', user?.id)
          .gte('expense_date', fromDate)
          .lte('expense_date', toDate),
        supabase
          .from('installments')
          .select('*')
          .eq('user_id', user?.id)
          .gte('due_date', fromDate)
          .lte('due_date', toDate)
      ]);

      return {
        payments: paymentsResult.data || [],
        expenses: expensesResult.data || [],
        installments: installmentsResult.data || [],
        period: { from: fromDate, to: toDate }
      };
    },
    enabled: !!user?.id,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getGrowthColor = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (value: number) => {
    return value >= 0 ? TrendingUp : TrendingDown;
  };

  const setQuickComparison = (type: string) => {
    const today = new Date();
    setComparisonType(type);

    switch (type) {
      case 'monthToMonth':
        setPeriod1({
          from: startOfMonth(today),
          to: endOfMonth(today)
        });
        setPeriod2({
          from: startOfMonth(subMonths(today, 1)),
          to: endOfMonth(subMonths(today, 1))
        });
        break;
      case 'yearToYear':
        setPeriod1({
          from: startOfYear(today),
          to: endOfYear(today)
        });
        setPeriod2({
          from: startOfYear(subYears(today, 1)),
          to: endOfYear(subYears(today, 1))
        });
        break;
      case 'quarterToQuarter':
        const currentQuarter = Math.floor(today.getMonth() / 3);
        const quarterStart = new Date(today.getFullYear(), currentQuarter * 3, 1);
        const quarterEnd = new Date(today.getFullYear(), (currentQuarter + 1) * 3, 0);
        
        const prevQuarterStart = new Date(quarterStart.getFullYear(), quarterStart.getMonth() - 3, 1);
        const prevQuarterEnd = new Date(prevQuarterStart.getFullYear(), prevQuarterStart.getMonth() + 3, 0);
        
        setPeriod1({ from: quarterStart, to: quarterEnd });
        setPeriod2({ from: prevQuarterStart, to: prevQuarterEnd });
        break;
    }
  };

  // Gerar relatório comparativo
  const comparativeData = data1 && data2 ? generateComparativeReport(data1, data2) : null;

  // Dados para o gráfico
  const chartData = comparativeData ? [
    {
      name: 'Receitas',
      'Período Atual': comparativeData.receitas.atual,
      'Período Anterior': comparativeData.receitas.anterior,
    },
    {
      name: 'Despesas',
      'Período Atual': comparativeData.despesas.atual,
      'Período Anterior': comparativeData.despesas.anterior,
    },
    {
      name: 'Saldo Líquido',
      'Período Atual': comparativeData.saldoLiquido.atual,
      'Período Anterior': comparativeData.saldoLiquido.anterior,
    },
  ] : [];

  const isLoading = loading1 || loading2;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Relatório Comparativo</h2>
        <p className="text-muted-foreground">
          Compare o desempenho financeiro entre diferentes períodos
        </p>
      </div>

      {/* Seleção de Períodos */}
      <Card>
        <CardHeader>
          <CardTitle>Configurar Comparação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Comparações rápidas */}
          <div className="space-y-4">
            <h3 className="font-medium">Comparações Rápidas</h3>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={comparisonType === 'monthToMonth' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setQuickComparison('monthToMonth')}
              >
                Mês vs Mês Anterior
              </Button>
              <Button 
                variant={comparisonType === 'quarterToQuarter' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setQuickComparison('quarterToQuarter')}
              >
                Trimestre vs Trimestre Anterior
              </Button>
              <Button 
                variant={comparisonType === 'yearToYear' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setQuickComparison('yearToYear')}
              >
                Ano vs Ano Anterior
              </Button>
              <Button 
                variant={comparisonType === 'custom' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setComparisonType('custom')}
              >
                Personalizado
              </Button>
            </div>
          </div>

          {/* Seleção manual de períodos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Período 1 */}
            <div className="space-y-4">
              <h3 className="font-medium text-blue-600">Período Atual</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data Inicial</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !period1.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(period1.from, "dd/MM/yyyy", { locale: ptBR })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={period1.from}
                        onSelect={(date) => date && setPeriod1(prev => ({ ...prev, from: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Data Final</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !period1.to && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(period1.to, "dd/MM/yyyy", { locale: ptBR })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={period1.to}
                        onSelect={(date) => date && setPeriod1(prev => ({ ...prev, to: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Período 2 */}
            <div className="space-y-4">
              <h3 className="font-medium text-orange-600">Período de Comparação</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data Inicial</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !period2.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(period2.from, "dd/MM/yyyy", { locale: ptBR })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={period2.from}
                        onSelect={(date) => date && setPeriod2(prev => ({ ...prev, from: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Data Final</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !period2.to && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(period2.to, "dd/MM/yyyy", { locale: ptBR })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={period2.to}
                        onSelect={(date) => date && setPeriod2(prev => ({ ...prev, to: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultados da Comparação */}
      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Carregando dados para comparação...</div>
          </CardContent>
        </Card>
      ) : comparativeData ? (
        <>
          {/* Cards de Métricas Comparativas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Receitas */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700">Receitas</CardTitle>
                {React.createElement(getGrowthIcon(comparativeData.receitas.crescimento), {
                  className: `h-4 w-4 ${getGrowthColor(comparativeData.receitas.crescimento)}`
                })}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-600">Atual:</span>
                    <span className="text-lg font-bold text-green-900">
                      {formatCurrency(comparativeData.receitas.atual)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-600">Anterior:</span>
                    <span className="text-sm text-green-700">
                      {formatCurrency(comparativeData.receitas.anterior)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-green-200">
                    <div className="flex items-center justify-between">
                      <Badge variant={comparativeData.receitas.crescimento >= 0 ? 'default' : 'destructive'}>
                        {formatPercentage(comparativeData.receitas.crescimento)}
                      </Badge>
                      <span className="text-xs text-green-600">
                        {formatCurrency(comparativeData.receitas.diferenca)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Despesas */}
            <Card className="bg-gradient-to-br from-red-50 to-pink-100 border-red-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-red-700">Despesas</CardTitle>
                {React.createElement(getGrowthIcon(-comparativeData.despesas.crescimento), {
                  className: `h-4 w-4 ${getGrowthColor(-comparativeData.despesas.crescimento)}`
                })}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-red-600">Atual:</span>
                    <span className="text-lg font-bold text-red-900">
                      {formatCurrency(comparativeData.despesas.atual)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-red-600">Anterior:</span>
                    <span className="text-sm text-red-700">
                      {formatCurrency(comparativeData.despesas.anterior)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-red-200">
                    <div className="flex items-center justify-between">
                      <Badge variant={comparativeData.despesas.crescimento <= 0 ? 'default' : 'destructive'}>
                        {formatPercentage(comparativeData.despesas.crescimento)}
                      </Badge>
                      <span className="text-xs text-red-600">
                        {formatCurrency(comparativeData.despesas.diferenca)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Saldo Líquido */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">Saldo Líquido</CardTitle>
                {React.createElement(getGrowthIcon(comparativeData.saldoLiquido.crescimento), {
                  className: `h-4 w-4 ${getGrowthColor(comparativeData.saldoLiquido.crescimento)}`
                })}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-blue-600">Atual:</span>
                    <span className="text-lg font-bold text-blue-900">
                      {formatCurrency(comparativeData.saldoLiquido.atual)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-blue-600">Anterior:</span>
                    <span className="text-sm text-blue-700">
                      {formatCurrency(comparativeData.saldoLiquido.anterior)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-blue-200">
                    <div className="flex items-center justify-between">
                      <Badge variant={comparativeData.saldoLiquido.crescimento >= 0 ? 'default' : 'destructive'}>
                        {formatPercentage(comparativeData.saldoLiquido.crescimento)}
                      </Badge>
                      <span className="text-xs text-blue-600">
                        {formatCurrency(comparativeData.saldoLiquido.diferenca)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico Comparativo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Comparação Visual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(Number(value)), '']}
                      labelStyle={{ color: '#374151' }}
                      contentStyle={{ 
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="Período Atual" fill="#3b82f6" />
                    <Bar dataKey="Período Anterior" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              Configure os períodos acima para visualizar a comparação
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
