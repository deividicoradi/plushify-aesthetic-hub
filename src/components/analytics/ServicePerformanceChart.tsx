import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ServicePerformanceData {
  serviceName: string;
  count: number;
  revenue: number;
  avgPrice: number;
}

interface ServicePerformanceChartProps {
  data: ServicePerformanceData[];
}

const ServicePerformanceChart: React.FC<ServicePerformanceChartProps> = ({ data }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance dos Serviços</CardTitle>
        <CardDescription>Serviços mais populares e lucrativos</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
            <YAxis dataKey="serviceName" type="category" width={120} />
            <Tooltip 
              formatter={(value, name) => [
                name === 'revenue' ? formatCurrency(Number(value)) : `${value} agendamentos`,
                name === 'revenue' ? 'Receita Total' : 'Quantidade'
              ]}
            />
            <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ServicePerformanceChart;