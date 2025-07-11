import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface PipelineData {
  name: string;
  value: number;
  fill: string;
}

interface AnalyticsPipelineChartsProps {
  pipelineByAmountData: PipelineData[];
  pipelineByCountData: PipelineData[];
}

const AnalyticsPipelineCharts: React.FC<AnalyticsPipelineChartsProps> = ({
  pipelineByAmountData,
  pipelineByCountData
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pipeline por Valor */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline por Valor e Serviço</CardTitle>
          <CardDescription>Distribuição da receita por tipo de serviço</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pipelineByAmountData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {pipelineByAmountData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pipeline por Quantidade */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline por Quantidade e Serviço</CardTitle>
          <CardDescription>Distribuição dos agendamentos por tipo de serviço</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pipelineByCountData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {pipelineByCountData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPipelineCharts;