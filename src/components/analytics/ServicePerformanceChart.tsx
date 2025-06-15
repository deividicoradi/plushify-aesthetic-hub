
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Award } from 'lucide-react';
import { ServicePerformance } from '@/hooks/analytics/useServicePerformance';

interface ServicePerformanceChartProps {
  data: ServicePerformance[];
  loading?: boolean;
}

export const ServicePerformanceChart = ({ data, loading }: ServicePerformanceChartProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Performance por Serviço
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Carregando dados...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5" />
          Performance por Serviço
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.slice(0, 8)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="service_name" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'total_revenue') {
                    return [formatCurrency(Number(value)), 'Receita Total'];
                  }
                  return [value, name === 'total_appointments' ? 'Agendamentos' : name];
                }}
              />
              <Bar dataKey="total_revenue" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top 3 Serviços */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.slice(0, 3).map((service, index) => (
            <div key={service.service_name} className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                }`}>
                  {index + 1}
                </div>
                <h3 className="font-semibold text-sm truncate">{service.service_name}</h3>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>{service.total_appointments} agendamentos</p>
                <p className="font-semibold text-foreground">{formatCurrency(service.total_revenue)}</p>
                <p>Ticket médio: {formatCurrency(service.average_price)}</p>
                <div className="flex items-center gap-1">
                  <TrendingUp className={`w-3 h-3 ${service.growth_rate >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                  <span className={service.growth_rate >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {service.growth_rate >= 0 ? '+' : ''}{service.growth_rate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
