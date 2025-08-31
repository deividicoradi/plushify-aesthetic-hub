
import React from 'react';
import { PieChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip } from 'recharts';

interface RevenueByMethodChartProps {
  revenueByMethod: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  formatCurrency: (value: number) => string;
}

export const RevenueByMethodChart = ({ revenueByMethod, formatCurrency }: RevenueByMethodChartProps) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover text-popover-foreground p-3 rounded-lg border border-border shadow-lg">
          <p className="font-medium">{`${payload[0].name}`}</p>
          <p className="text-sm">
            <span className="font-semibold">Valor: </span>
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-purple-600" />
          Receitas por Método de Pagamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {revenueByMethod && revenueByMethod.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={revenueByMethod}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="none"
                >
                  {revenueByMethod.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </RechartsPieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Nenhum dado de receita disponível
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
