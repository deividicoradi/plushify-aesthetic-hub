
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { ForecastData } from '@/hooks/analytics/useRevenueForecasting';

interface RevenueForecastChartProps {
  data: ForecastData[];
  loading?: boolean;
}

export const RevenueForecastChart = ({ data, loading }: RevenueForecastChartProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Previsão de Receita
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Carregando previsões...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Separar dados históricos e previsões
  const historicalData = data.filter(d => d.actual_revenue > 0);
  const forecastData = data.filter(d => d.actual_revenue === 0);
  
  // Calcular métricas
  const avgHistorical = historicalData.length > 0 
    ? historicalData.reduce((sum, d) => sum + d.actual_revenue, 0) / historicalData.length 
    : 0;
  
  const projectedTotal = forecastData.reduce((sum, d) => sum + d.predicted_revenue, 0);
  
  const lastMonth = historicalData[historicalData.length - 1];
  const nextMonth = forecastData[0];
  const growthTrend = lastMonth && nextMonth 
    ? ((nextMonth.predicted_revenue - lastMonth.actual_revenue) / lastMonth.actual_revenue) * 100 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Previsão de Receita
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="period" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value, name) => [
                  formatCurrency(Number(value)),
                  name === 'actual_revenue' ? 'Receita Real' : 
                  name === 'predicted_revenue' ? 'Previsão' : name
                ]}
              />
              <Legend />
              
              {/* Receita real */}
              <Area
                dataKey="actual_revenue"
                fill="hsl(var(--primary))"
                fillOpacity={0.6}
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                name="Receita Real"
              />
              
              {/* Previsão */}
              <Line
                dataKey="predicted_revenue"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: 'hsl(var(--destructive))', strokeWidth: 2, r: 4 }}
                name="Previsão"
              />
              
              {/* Intervalo de confiança superior */}
              <Line
                dataKey="confidence_interval.upper"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={1}
                strokeDasharray="2 2"
                dot={false}
                name="Limite Superior"
              />
              
              {/* Intervalo de confiança inferior */}
              <Line
                dataKey="confidence_interval.lower"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={1}
                strokeDasharray="2 2"
                dot={false}
                name="Limite Inferior"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Insights da previsão */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold">Média Histórica</h3>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(avgHistorical)}</p>
            <p className="text-sm text-muted-foreground">Por mês</p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className={`w-5 h-5 ${growthTrend >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              <h3 className="font-semibold">Tendência</h3>
            </div>
            <p className={`text-2xl font-bold ${growthTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {growthTrend >= 0 ? '+' : ''}{growthTrend.toFixed(1)}%
            </p>
            <p className="text-sm text-muted-foreground">Próximo mês</p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold">Projeção 6 Meses</h3>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(projectedTotal)}</p>
            <p className="text-sm text-muted-foreground">Total previsto</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
