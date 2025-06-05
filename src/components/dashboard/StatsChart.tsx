
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const weeklyData = [
  { day: 'Seg', agendamentos: 12, faturamento: 850 },
  { day: 'Ter', agendamentos: 15, faturamento: 1200 },
  { day: 'Qua', agendamentos: 8, faturamento: 650 },
  { day: 'Qui', agendamentos: 18, faturamento: 1450 },
  { day: 'Sex', agendamentos: 22, faturamento: 1800 },
  { day: 'Sáb', agendamentos: 25, faturamento: 2100 },
  { day: 'Dom', agendamentos: 10, faturamento: 750 },
];

const serviceData = [
  { service: 'Corte', count: 45, revenue: 3150 },
  { service: 'Coloração', count: 28, revenue: 4200 },
  { service: 'Hidratação', count: 35, revenue: 2450 },
  { service: 'Escova', count: 40, revenue: 2800 },
  { service: 'Manicure', count: 60, revenue: 1800 },
];

export const StatsChart = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Agendamentos da Semana</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="agendamentos" 
                stroke="#9b87f5" 
                strokeWidth={3}
                dot={{ fill: '#9b87f5', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Faturamento por Dia</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(value) => [`R$ ${value}`, 'Faturamento']} />
              <Bar dataKey="faturamento" fill="#7E69AB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Serviços Mais Populares</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={serviceData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="service" type="category" width={80} />
              <Tooltip formatter={(value, name) => [
                name === 'count' ? `${value} serviços` : `R$ ${value}`,
                name === 'count' ? 'Quantidade' : 'Receita'
              ]} />
              <Bar dataKey="count" fill="#9b87f5" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
