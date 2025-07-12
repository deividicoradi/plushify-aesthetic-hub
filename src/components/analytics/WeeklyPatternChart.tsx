import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WeeklyPatternData {
  dayOfWeek: string;
  appointments: number;
  revenue: number;
}

interface WeeklyPatternChartProps {
  data: WeeklyPatternData[];
}

const WeeklyPatternChart: React.FC<WeeklyPatternChartProps> = ({ data }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Padrão Semanal de Agendamentos</CardTitle>
        <CardDescription>Distribuição de agendamentos e receita por dia da semana</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dayOfWeek" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip 
              formatter={(value, name) => [
                name === 'appointments' ? `${value} agendamentos` : formatCurrency(Number(value)),
                name === 'appointments' ? 'Agendamentos' : 'Receita'
              ]}
            />
            <Bar yAxisId="left" dataKey="appointments" fill="#3b82f6" name="appointments" />
            <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="revenue" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default WeeklyPatternChart;