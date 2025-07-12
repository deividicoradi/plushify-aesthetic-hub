import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AppointmentStatusData {
  status: string;
  count: number;
  percentage: number;
}

interface AppointmentStatusChartProps {
  data: AppointmentStatusData[];
}

const AppointmentStatusChart: React.FC<AppointmentStatusChartProps> = ({ data }) => {
  const getBarColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'concluido':
        return '#10b981'; // green
      case 'agendado':
        return '#3b82f6'; // blue
      case 'cancelado':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status dos Agendamentos</CardTitle>
        <CardDescription>Distribuição dos agendamentos por status</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="status" type="category" width={100} />
            <Tooltip 
              formatter={(value, name) => [
                `${value} agendamentos`,
                'Quantidade'
              ]}
            />
            <Bar 
              dataKey="count" 
              fill="#3b82f6"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default AppointmentStatusChart;