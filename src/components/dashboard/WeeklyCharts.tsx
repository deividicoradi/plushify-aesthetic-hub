
import React from 'react';
import { Activity, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { PeriodFilter } from './PeriodFilter';
import { usePeriodFilter } from '@/hooks/usePeriodFilter';

interface WeeklyChartsProps {
  chartData: Array<{
    day: string;
    agendamentos: number;
    faturamento: number;
  }>;
  formatCurrency: (value: number) => string;
}

export const WeeklyCharts = ({ chartData, formatCurrency }: WeeklyChartsProps) => {
  const { selectedPeriod, setSelectedPeriod } = usePeriodFilter();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Agendamentos da Semana */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              Agendamentos da Semana
            </CardTitle>
            <PeriodFilter 
              value={selectedPeriod} 
              onChange={setSelectedPeriod}
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
                Nenhum agendamento esta semana
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Faturamento da Semana */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Faturamento Semanal
            </CardTitle>
            <PeriodFilter 
              value={selectedPeriod} 
              onChange={setSelectedPeriod}
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
                Nenhum faturamento esta semana
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
