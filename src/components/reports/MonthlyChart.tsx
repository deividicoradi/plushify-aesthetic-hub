
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthlyData } from '@/hooks/useReportsData';

interface MonthlyChartProps {
  data: MonthlyData[];
  loading?: boolean;
}

export const MonthlyChart = ({ data, loading = false }: MonthlyChartProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolução Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-gray-500">Carregando dados...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução Mensal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
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
                labelStyle={{ color: '#374151' }}
                contentStyle={{ 
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
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
                fill="#9b87f5" 
                name="revenue"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="appointments" 
                fill="#33C3F0" 
                name="appointments"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="newClients" 
                fill="#D6BCFA" 
                name="newClients"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
