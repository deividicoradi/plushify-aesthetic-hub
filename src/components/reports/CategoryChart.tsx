
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CategoryData } from '@/hooks/useReportsData';

interface CategoryChartProps {
  data: CategoryData[];
  loading?: boolean;
}

const COLORS = [
  'hsl(var(--chart-1))', 
  'hsl(var(--chart-2))', 
  'hsl(var(--chart-3))', 
  'hsl(var(--chart-4))', 
  'hsl(var(--chart-5))',
  'hsl(142 71% 45%)', // green
  'hsl(217 91% 60%)', // blue
  'hsl(32 95% 44%)',  // orange
  'hsl(47 96% 53%)',  // yellow
  'hsl(288 84% 56%)'  // purple
];

export const CategoryChart = ({ data, loading = false }: CategoryChartProps) => {
  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando dados...</div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-muted-foreground text-center">
          <p>Nenhuma transação encontrada</p>
          <p className="text-sm mt-2">Adicione transações financeiras para ver os dados</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover text-popover-foreground p-3 rounded-lg border border-border shadow-lg">
          <p className="font-medium">{`${payload[0].name}`}</p>
          <p className="text-sm">
            <span className="font-semibold">Receita: </span>
            {formatCurrency(payload[0].value)}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Porcentagem: </span>
            {payload[0].payload.percentage.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              style={{ fontSize: '12px', fill: 'hsl(var(--foreground))' }}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{
                color: 'hsl(var(--foreground))'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {data.map((category, index) => (
          <div key={category.name} className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="font-medium text-foreground">{category.name}</span>
            </div>
            <div className="text-right">
              <div className="font-semibold text-foreground">{formatCurrency(category.value)}</div>
              <div className="text-sm text-muted-foreground">{category.percentage.toFixed(1)}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
