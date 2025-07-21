import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { MonthlyData } from '@/hooks/useReportsData';

interface MonthlyChartProps {
  data: MonthlyData[];
  loading?: boolean;
}

export const MonthlyChart = ({ data, loading = false }: MonthlyChartProps) => {
  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando dados...</div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR')}`;
  };

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            formatter={(value, name) => {
              if (name === 'revenue') {
                return [formatCurrency(Number(value)), 'Receita'];
              }
              return [value, name === 'appointments' ? 'Agendamentos' : 'Novos Clientes'];
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
            contentStyle={{ 
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--foreground))'
            }}
          />
          <Legend 
            formatter={(value) => {
              switch(value) {
                case 'revenue': return 'Receita';
                case 'appointments': return 'Agendamentos';
                case 'newClients': return 'Novos Clientes';
                default: return value;
              }
            }}
          />
          <Bar 
            dataKey="revenue" 
            fill="hsl(var(--primary))" 
            name="revenue"
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="appointments" 
            fill="hsl(var(--accent-foreground))" 
            name="appointments"
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="newClients" 
            fill="hsl(var(--muted))" 
            name="newClients"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};