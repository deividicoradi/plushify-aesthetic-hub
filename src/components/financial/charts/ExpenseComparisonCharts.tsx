import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PeriodFilter, PeriodOption } from '@/components/dashboard/PeriodFilter';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface ExpenseData {
  category: string;
  fixed: number;
  variable: number;
}

interface ExpenseComparisonChartsProps {
  fixedExpenses: Array<{ name: string; value: number; color: string }>;
  variableExpenses: Array<{ name: string; value: number; color: string }>;
  formatCurrency: (value: number) => string;
  onFixedPeriodChange?: (period: PeriodOption) => void;
  onVariablePeriodChange?: (period: PeriodOption) => void;
}

const getPeriodLabel = (period: PeriodOption) => {
  switch (period) {
    case '7d': return 'Últimos 7 Dias';
    case '30d': return 'Últimos 30 Dias';
    case '90d': return 'Últimos 3 Meses';
    case '6m': return 'Últimos 6 Meses';
    case '1y': return 'Último Ano';
    default: return 'Período Atual';
  }
};

export const ExpenseComparisonCharts = ({ 
  fixedExpenses, 
  variableExpenses, 
  formatCurrency,
  onFixedPeriodChange,
  onVariablePeriodChange
}: ExpenseComparisonChartsProps) => {
  const [fixedPeriod, setFixedPeriod] = useState<PeriodOption>('30d');
  const [variablePeriod, setVariablePeriod] = useState<PeriodOption>('30d');

  const handleFixedPeriodChange = (period: PeriodOption) => {
    setFixedPeriod(period);
    onFixedPeriodChange?.(period);
  };

  const handleVariablePeriodChange = (period: PeriodOption) => {
    setVariablePeriod(period);
    onVariablePeriodChange?.(period);
  };

  const totalFixed = fixedExpenses.reduce((sum, item) => sum + item.value, 0);
  const totalVariable = variableExpenses.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover text-popover-foreground p-3 rounded-lg border border-border shadow-lg">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Despesas Fixas */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <TrendingDown className="w-5 h-5 text-orange-600" />
                Despesas Fixas - {getPeriodLabel(fixedPeriod)}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Total: {formatCurrency(totalFixed)}
              </p>
            </div>
            <PeriodFilter 
              value={fixedPeriod}
              onChange={handleFixedPeriodChange}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {fixedExpenses.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fixedExpenses} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    type="number" 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    width={100}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#f97316" radius={[0, 4, 4, 0]}>
                    {fixedExpenses.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Nenhuma despesa fixa no período
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Despesas Variáveis */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Despesas Variáveis - {getPeriodLabel(variablePeriod)}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Total: {formatCurrency(totalVariable)}
              </p>
            </div>
            <PeriodFilter 
              value={variablePeriod}
              onChange={handleVariablePeriodChange}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {variableExpenses.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={variableExpenses} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    type="number" 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    width={100}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                    {variableExpenses.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Nenhuma despesa variável no período
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Importação necessária para Cell
import { Cell } from 'recharts';
