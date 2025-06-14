
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useInteractiveChartData } from '@/hooks/useInteractiveChartData';

export const InteractiveChart = () => {
  const [activeMetric, setActiveMetric] = useState<'agendamentos' | 'faturamento' | 'clientes'>('agendamentos');
  const { data, loading } = useInteractiveChartData();

  const metrics = {
    agendamentos: {
      label: 'Agendamentos',
      color: '#8B5CF6',
      icon: Activity,
      trend: '+23%'
    },
    faturamento: {
      label: 'Faturamento',
      color: '#06B6D4',
      icon: TrendingUp,
      trend: '+18%'
    },
    clientes: {
      label: 'Novos Clientes',
      color: '#10B981',
      icon: TrendingDown,
      trend: '+12%'
    }
  };

  const currentMetric = metrics[activeMetric];

  if (loading) {
    return (
      <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white via-white to-gray-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/30">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-border/50">
          <CardTitle className="text-xl font-semibold">Analytics Interativo</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Visão geral semanal</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Carregando dados...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white via-white to-gray-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/30">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Analytics Interativo</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Visão geral semanal</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <currentMetric.icon className="w-4 h-4" style={{ color: currentMetric.color }} />
            <span className="font-medium">{currentMetric.trend}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex gap-2 mb-6">
          {Object.entries(metrics).map(([key, metric]) => (
            <Button
              key={key}
              variant={activeMetric === key ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveMetric(key as any)}
              className={`transition-all duration-200 ${
                activeMetric === key 
                  ? 'shadow-lg scale-105' 
                  : 'hover:scale-105'
              }`}
              style={{
                backgroundColor: activeMetric === key ? metric.color : undefined,
                borderColor: metric.color
              }}
            >
              <metric.icon className="w-4 h-4 mr-2" />
              {metric.label}
            </Button>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`gradient-${activeMetric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={currentMetric.color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={currentMetric.color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#666' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#666' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
              }}
              formatter={(value, name) => {
                if (name === 'faturamento') {
                  return [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Faturamento'];
                }
                return [value, name === 'agendamentos' ? 'Agendamentos' : 'Novos Clientes'];
              }}
            />
            <Area
              type="monotone"
              dataKey={activeMetric}
              stroke={currentMetric.color}
              strokeWidth={3}
              fill={`url(#gradient-${activeMetric})`}
              dot={{ fill: currentMetric.color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: currentMetric.color, strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
