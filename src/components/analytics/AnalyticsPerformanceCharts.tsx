import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface QuarterlyData {
  quarter: string;
  revenue: number;
}

interface MonthlyData {
  month: string;
  revenue: number;
}

interface AnalyticsPerformanceChartsProps {
  quarterlyData: QuarterlyData[];
  monthlyRevenueData: MonthlyData[];
}

const AnalyticsPerformanceCharts: React.FC<AnalyticsPerformanceChartsProps> = ({
  quarterlyData,
  monthlyRevenueData
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Comparação Trimestral */}
      <Card>
        <CardHeader>
          <CardTitle>Comparação Trimestre a Trimestre</CardTitle>
          <CardDescription>Últimos 4 trimestres</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={quarterlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="revenue" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Receita Últimos 13 Meses */}
      <Card>
        <CardHeader>
          <CardTitle>Receita Últimos 13 Meses</CardTitle>
          <CardDescription>Tendência mensal de receita</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPerformanceCharts;