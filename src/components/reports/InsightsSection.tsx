
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportsMetrics } from '@/hooks/useReportsData';
import { TrendingUp, AlertTriangle, Target, Lightbulb } from 'lucide-react';

interface InsightsSectionProps {
  metrics: ReportsMetrics | null;
  loading?: boolean;
}

export const InsightsSection = ({ metrics, loading = false }: InsightsSectionProps) => {
  if (loading || !metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Insights e Recomendações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 bg-gray-100 rounded-lg">
                <div className="w-24 h-4 bg-gray-300 rounded mb-2"></div>
                <div className="w-full h-3 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const insights = [];

  // Insight sobre crescimento de receita
  if (metrics.revenueGrowth > 0) {
    insights.push({
      icon: TrendingUp,
      title: '📈 Crescimento Positivo',
      message: `Sua receita está crescendo ${metrics.revenueGrowth.toFixed(1)}% comparado ao mês anterior. Continue investindo em marketing e atendimento ao cliente.`,
      type: 'success'
    });
  } else if (metrics.revenueGrowth < -10) {
    insights.push({
      icon: AlertTriangle,
      title: '⚠️ Atenção à Receita',
      message: `Sua receita diminuiu ${Math.abs(metrics.revenueGrowth).toFixed(1)}% este mês. Considere revisar estratégias de vendas e retenção de clientes.`,
      type: 'warning'
    });
  }

  // Insight sobre estoque baixo
  if (metrics.lowStockProducts > 0) {
    insights.push({
      icon: AlertTriangle,
      title: '📦 Alerta de Estoque',
      message: `Você tem ${metrics.lowStockProducts} produto(s) com estoque baixo. Considere fazer reposição para evitar perder vendas.`,
      type: 'warning'
    });
  }

  // Insight sobre crescimento de clientes
  if (metrics.clientsGrowth > 15) {
    insights.push({
      icon: Target,
      title: '🎯 Excelente Captação',
      message: `Você está captando novos clientes ${metrics.clientsGrowth.toFixed(1)}% acima do mês anterior! Considere implementar um programa de fidelidade.`,
      type: 'success'
    });
  }

  // Insight sobre agendamentos
  if (metrics.appointmentsGrowth > 20) {
    insights.push({
      icon: Lightbulb,
      title: '💡 Oportunidade de Expansão',
      message: `Seus agendamentos cresceram ${metrics.appointmentsGrowth.toFixed(1)}%. Com base na demanda, considere expandir horários ou contratar mais profissionais.`,
      type: 'info'
    });
  }

  // Insight sobre meta de receita
  const projectedRevenue = metrics.totalRevenue * (1 + metrics.revenueGrowth / 100);
  insights.push({
    icon: Target,
    title: '🎯 Meta Sugerida',
    message: `Com base no crescimento atual, você pode atingir R$ ${projectedRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} de receita no próximo mês.`,
    type: 'info'
  });

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'info': return 'bg-blue-50 border-blue-200';
      default: return 'bg-purple-50 border-purple-200';
    }
  };

  const getTextColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-800';
      case 'warning': return 'text-yellow-800';
      case 'info': return 'text-blue-800';
      default: return 'text-purple-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Insights e Recomendações</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-lg border ${getBackgroundColor(insight.type)}`}
            >
              <h4 className={`font-medium mb-2 ${getTextColor(insight.type)}`}>
                {insight.title}
              </h4>
              <p className={`text-sm ${getTextColor(insight.type)}`}>
                {insight.message}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
