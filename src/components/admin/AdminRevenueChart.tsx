import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart as LineChartIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface RevenuePoint {
  month_start: string;
  mrr_cents: number;
  new_signups: number;
  cancellations: number;
}

const formatBRL = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

const formatMonthLabel = (d: string) =>
  new Date(`${d}T00:00:00`).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });

export const AdminRevenueChart: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-revenue-series'],
    queryFn: async (): Promise<RevenuePoint[]> => {
      const { data, error } = await supabase.rpc('admin_get_revenue_series', { p_months: 6 });
      if (error) throw error;
      return (data ?? []) as RevenuePoint[];
    },
  });

  const chartData = (data ?? []).map((p) => ({
    month: formatMonthLabel(p.month_start),
    mrr: Math.round(p.mrr_cents / 100),
    novos: p.new_signups,
    cancelamentos: p.cancellations,
  }));

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <LineChartIcon className="w-4 h-4 text-primary" />
          Evolução — últimos 6 meses
        </CardTitle>
        <CardDescription>MRR estimado, novos cadastros e cancelamentos por mês</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <Skeleton className="h-[280px] w-full" />}
        {!!error && (
          <p className="text-destructive text-sm">Erro ao carregar série: {(error as Error).message}</p>
        )}
        {!isLoading && !error && (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis yAxisId="left" fontSize={12} tickFormatter={(v) => `R$${v}`} />
              <YAxis yAxisId="right" orientation="right" fontSize={12} allowDecimals={false} />
              <Tooltip
                formatter={(value: number, name: string) =>
                  name === 'MRR' ? [formatBRL(value * 100), name] : [value, name]
                }
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="mrr" stroke="#10b981" strokeWidth={2} name="MRR" dot={{ r: 3 }} />
              <Line yAxisId="right" type="monotone" dataKey="novos" stroke="#3b82f6" strokeWidth={2} name="Novos" dot={{ r: 3 }} />
              <Line yAxisId="right" type="monotone" dataKey="cancelamentos" stroke="#ef4444" strokeWidth={2} name="Cancelamentos" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
