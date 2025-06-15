
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Clock, Calendar } from 'lucide-react';
import { HourlyMovement, SeasonalData } from '@/hooks/analytics/useTimeAnalysis';

interface TimeAnalysisChartsProps {
  hourlyData: HourlyMovement[];
  seasonalData: SeasonalData[];
  loading?: boolean;
}

export const TimeAnalysisCharts = ({ hourlyData, seasonalData, loading }: TimeAnalysisChartsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Carregando dados...</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Filtrar apenas horários com movimento
  const activeHours = hourlyData.filter(h => h.appointments_count > 0);
  const peakHour = hourlyData.reduce((max, hour) => 
    hour.appointments_count > max.appointments_count ? hour : max, hourlyData[0]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Análise de Horários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Horários de Maior Movimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeHours}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="hour" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(hour) => `${hour}:00`}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={(hour) => `${hour}:00`}
                  formatter={(value, name) => [
                    name === 'revenue' ? formatCurrency(Number(value)) : value,
                    name === 'appointments_count' ? 'Agendamentos' : 'Receita'
                  ]}
                />
                <Area 
                  dataKey="appointments_count" 
                  stackId="1"
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Horário de Pico</span>
              <span className="text-sm font-bold">{peakHour.hour}:00 - {peakHour.hour + 1}:00</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Agendamentos no Pico</span>
              <span className="text-sm font-bold">{peakHour.appointments_count}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Receita no Pico</span>
              <span className="text-sm font-bold">{formatCurrency(peakHour.revenue)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Análise Sazonal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Análise de Sazonalidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={seasonalData.slice(-12)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? formatCurrency(Number(value)) : value,
                    name === 'appointments' ? 'Agendamentos' : 'Receita'
                  ]}
                />
                <Line 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            {seasonalData.slice(-3).map((month, index) => (
              <div key={month.month} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium">{month.month}</p>
                  <p className="text-xs text-muted-foreground">{month.appointments} agendamentos</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{formatCurrency(month.revenue)}</p>
                  <p className={`text-xs ${month.growth_rate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {month.growth_rate >= 0 ? '+' : ''}{month.growth_rate.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
