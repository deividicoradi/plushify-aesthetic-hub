
import React, { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { PeriodFilter, PeriodOption } from './PeriodFilter';
import { usePeriodFilter } from '@/hooks/usePeriodFilter';

interface FinancialEvolutionChartProps {
  monthlyData: Array<{
    month: string;
    receitas: number;
    despesas: number;
  }>;
  formatCurrency: (value: number) => string;
}

export const FinancialEvolutionChart = ({ monthlyData, formatCurrency }: FinancialEvolutionChartProps) => {
  const { selectedPeriod, setSelectedPeriod } = usePeriodFilter();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Evolução Financeira - Últimos 6 Meses
          </CardTitle>
          <PeriodFilter 
            value={selectedPeriod} 
            onChange={setSelectedPeriod}
          />
        </div>
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
  );
};
