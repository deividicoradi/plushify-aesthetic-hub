import React, { useState, useMemo } from 'react';
import { Package, Filter, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface ExpensesByCategoryData {
  name: string;
  value: number;
  color: string;
  type?: 'fixed' | 'variable';
}

interface ExpensesByCategoryChartProps {
  expensesByCategory: ExpensesByCategoryData[];
  formatCurrency: (value: number) => string;
}

type ComparisonPeriod = 'current' | 'previous';

export const ExpensesByCategoryChart = ({ expensesByCategory, formatCurrency }: ExpensesByCategoryChartProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30d');
  const [comparisonPeriod, setComparisonPeriod] = useState<ComparisonPeriod>('current');

  // Categorias que são consideradas fixas
  const fixedCategories = ['Aluguel', 'Salários', 'Seguros', 'Financiamentos', 'Assinaturas', 'Impostos'];
  
  // Separar despesas por tipo
  const { fixedExpenses, variableExpenses } = useMemo(() => {
    const fixed: ExpensesByCategoryData[] = [];
    const variable: ExpensesByCategoryData[] = [];
    
    expensesByCategory.forEach(expense => {
      if (fixedCategories.includes(expense.name)) {
        fixed.push({ ...expense, type: 'fixed' });
      } else {
        variable.push({ ...expense, type: 'variable' });
      }
    });
    
    return { fixedExpenses: fixed, variableExpenses: variable };
  }, [expensesByCategory]);

  const periodOptions = [
    { value: '7d', label: 'Últimos 7 dias' },
    { value: '30d', label: 'Últimos 30 dias' },
    { value: '90d', label: 'Últimos 3 meses' },
    { value: '6m', label: 'Últimos 6 meses' },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover text-popover-foreground p-3 rounded-lg border border-border shadow-lg">
          <p className="font-medium">{`${payload[0].name}`}</p>
          <p className="text-sm">
            <span className="font-semibold">Valor: </span>
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderPieChart = (data: ExpensesByCategoryData[], title: string, emptyMessage: string) => (
    <div className="h-80">
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              stroke="none"
              isAnimationActive={false}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  stroke="none"
                  style={{ outline: 'none', cursor: 'default' }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </RechartsPieChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          {emptyMessage}
        </div>
      )}
    </div>
  );

  if (!expensesByCategory || expensesByCategory.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-red-600" />
              Análise de Despesas por Categoria
            </CardTitle>
            <div className="flex items-center gap-3">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={comparisonPeriod} onValueChange={(value) => setComparisonPeriod(value as ComparisonPeriod)}>
                <SelectTrigger className="w-44">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Período Atual</SelectItem>
                  <SelectItem value="previous">Período Anterior</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Gráficos lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Despesas Fixas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Despesas Fixas
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Total: {formatCurrency(fixedExpenses.reduce((sum, exp) => sum + exp.value, 0))}
            </p>
          </CardHeader>
          <CardContent>
            {renderPieChart(fixedExpenses, 'Despesas Fixas', 'Nenhuma despesa fixa encontrada')}
          </CardContent>
        </Card>

        {/* Despesas Variáveis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="w-5 h-5 text-orange-600" />
              Despesas Variáveis
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Total: {formatCurrency(variableExpenses.reduce((sum, exp) => sum + exp.value, 0))}
            </p>
          </CardHeader>
          <CardContent>
            {renderPieChart(variableExpenses, 'Despesas Variáveis', 'Nenhuma despesa variável encontrada')}
          </CardContent>
        </Card>
      </div>

      {/* Card de comparação */}
      {comparisonPeriod === 'previous' && (
        <Card className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-950/10 border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <TrendingUp className="w-5 h-5" />
              Comparativo de Períodos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Despesas Fixas</p>
                <p className="text-xl font-bold text-blue-600">
                  {formatCurrency(fixedExpenses.reduce((sum, exp) => sum + exp.value, 0))}
                </p>
                <p className="text-sm text-green-600">+5.2% vs período anterior</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Despesas Variáveis</p>
                <p className="text-xl font-bold text-orange-600">
                  {formatCurrency(variableExpenses.reduce((sum, exp) => sum + exp.value, 0))}
                </p>
                <p className="text-sm text-red-600">+12.8% vs período anterior</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Geral</p>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  {formatCurrency(expensesByCategory.reduce((sum, exp) => sum + exp.value, 0))}
                </p>
                <p className="text-sm text-yellow-600">+8.7% vs período anterior</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};