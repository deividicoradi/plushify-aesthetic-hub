
import React from 'react';
import { Activity, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { PeriodFilter, PeriodOption } from './PeriodFilter';

interface WeeklyChartsProps {
  chartData: Array<{
    day: string;
    agendamentos: number;
    faturamento: number;
  }>;
  formatCurrency: (value: number) => string;
  selectedPeriod: PeriodOption;
  onPeriodChange: (period: PeriodOption) => void;
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

export const WeeklyCharts = ({ chartData, formatCurrency, selectedPeriod, onPeriodChange }: WeeklyChartsProps) => {
  const periodLabel = getPeriodLabel(selectedPeriod);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Agendamentos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              Agendamentos - {periodLabel}
            </CardTitle>
            <PeriodFilter 
              value={selectedPeriod} 
              onChange={onPeriodChange}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
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
                Nenhum agendamento no período selecionado
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Faturamento */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Faturamento - {periodLabel}
            </CardTitle>
            <PeriodFilter 
              value={selectedPeriod} 
              onChange={onPeriodChange}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
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
                Nenhum faturamento no período selecionado
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
