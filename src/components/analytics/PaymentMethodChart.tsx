import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface PaymentMethodData {
  method: string;
  amount: number;
  count: number;
  fill: string;
}

interface PaymentMethodChartProps {
  data: PaymentMethodData[];
}

const PaymentMethodChart: React.FC<PaymentMethodChartProps> = ({ data }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Receita por Método de Pagamento</CardTitle>
        <CardDescription>Distribuição dos pagamentos por forma de pagamento</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ method, percent }) => `${method} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="amount"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodChart;