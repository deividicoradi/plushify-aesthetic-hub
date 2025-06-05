
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryData } from '@/hooks/useReportsData';

interface CategoryChartProps {
  data: CategoryData[];
  loading?: boolean;
}

const COLORS = ['#9b87f5', '#33C3F0', '#D6BCFA', '#7E69AB', '#F97316', '#0EA5E9', '#D946EF'];

export const CategoryChart = ({ data, loading = false }: CategoryChartProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Receita por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-gray-500">Carregando dados...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Receita por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-gray-500 text-center">
              <p>Nenhuma transação encontrada</p>
              <p className="text-sm mt-2">Adicione transações financeiras para ver os dados</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Receita por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
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
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [formatCurrency(Number(value)), 'Receita']}
                contentStyle={{ 
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.map((category, index) => (
            <div key={category.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="font-medium">{category.name}</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">{formatCurrency(category.value)}</div>
                <div className="text-sm text-gray-600">{category.percentage.toFixed(1)}%</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
