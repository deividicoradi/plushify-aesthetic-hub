import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface RevenueVsExpensesData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface RevenueVsExpensesChartProps {
  data: RevenueVsExpensesData[];
}

const RevenueVsExpensesChart: React.FC<RevenueVsExpensesChartProps> = ({ data }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Receita vs Despesas</CardTitle>
        <CardDescription>Análise financeira mensal: receita, despesas e lucro</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#10b981" 
              strokeWidth={3}
              name="Receita"
              dot={{ r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="expenses" 
              stroke="#ef4444" 
              strokeWidth={3}
              name="Despesas"
              dot={{ r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="profit" 
              stroke="#3b82f6" 
              strokeWidth={3}
              name="Lucro"
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default RevenueVsExpensesChart;