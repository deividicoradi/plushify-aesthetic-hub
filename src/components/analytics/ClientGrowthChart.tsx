import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ClientGrowthData {
  month: string;
  newClients: number;
  totalClients: number;
}

interface ClientGrowthChartProps {
  data: ClientGrowthData[];
}

const ClientGrowthChart: React.FC<ClientGrowthChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Crescimento da Base de Clientes</CardTitle>
        <CardDescription>Evolução mensal do número de clientes</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="newClients" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Novos Clientes"
              dot={{ r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="totalClients" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Total de Clientes"
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ClientGrowthChart;