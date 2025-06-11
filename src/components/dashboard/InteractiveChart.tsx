
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

const weeklyData = [
  { day: 'Seg', agendamentos: 12, faturamento: 850, clientes: 8 },
  { day: 'Ter', agendamentos: 15, faturamento: 1200, clientes: 12 },
  { day: 'Qua', agendamentos: 8, faturamento: 650, clientes: 6 },
  { day: 'Qui', agendamentos: 18, faturamento: 1450, clientes: 15 },
  { day: 'Sex', agendamentos: 22, faturamento: 1800, clientes: 18 },
  { day: 'Sáb', agendamentos: 25, faturamento: 2100, clientes: 20 },
  { day: 'Dom', agendamentos: 10, faturamento: 750, clientes: 8 },
];

export const InteractiveChart = () => {
  const [activeMetric, setActiveMetric] = useState<'agendamentos' | 'faturamento' | 'clientes'>('agendamentos');

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
          <AreaChart data={weeklyData}>
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
