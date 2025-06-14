
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportsMetrics } from '@/hooks/useReportsData';
import { TrendingUp, AlertTriangle, Target, Lightbulb, Zap, Award, Brain } from 'lucide-react';

interface InsightsSectionProps {
  metrics: ReportsMetrics | null;
  loading?: boolean;
}

export const InsightsSection = ({ metrics, loading = false }: InsightsSectionProps) => {
  if (loading || !metrics) {
    return (
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary-foreground" />
            </div>
            <CardTitle className="text-xl">Insights Inteligentes</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 bg-muted rounded-lg">
                <div className="w-32 h-5 bg-muted-foreground/20 rounded mb-3"></div>
                <div className="w-full h-4 bg-muted-foreground/20 rounded mb-2"></div>
                <div className="w-3/4 h-4 bg-muted-foreground/20 rounded"></div>
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
      title: '🚀 Crescimento Acelerado',
      message: `Excelente! Sua receita cresceu ${metrics.revenueGrowth.toFixed(1)}% este mês. Continue investindo em marketing digital e programas de fidelização para manter essa trajetória.`,
      type: 'success',
      priority: 'high'
    });
  } else if (metrics.revenueGrowth < -10) {
    insights.push({
      icon: AlertTriangle,
      title: '⚠️ Atenção Necessária',
      message: `Detectamos uma queda de ${Math.abs(metrics.revenueGrowth).toFixed(1)}% na receita. Recomendamos analisar a satisfação dos clientes e revisar estratégias de vendas.`,
      type: 'warning',
      priority: 'high'
    });
  }

  // Insight sobre estoque baixo
  if (metrics.lowStockProducts > 0) {
    insights.push({
      icon: AlertTriangle,
      title: '📦 Gestão de Estoque',
      message: `${metrics.lowStockProducts} produto(s) com estoque baixo. Configure alertas automáticos para evitar rupturas e otimizar suas vendas.`,
      type: 'warning',
      priority: 'medium'
    });
  }

  // Insight sobre crescimento de clientes
  if (metrics.clientsGrowth > 15) {
    insights.push({
      icon: Award,
      title: '🎯 Captação Excepcional',
      message: `Parabéns! Você captou ${metrics.clientsGrowth.toFixed(1)}% mais clientes este mês. Considere implementar um programa de indicação para potencializar ainda mais esse crescimento.`,
      type: 'success',
      priority: 'high'
    });
  }

  // Insight sobre agendamentos
  if (metrics.appointmentsGrowth > 20) {
    insights.push({
      icon: Zap,
      title: '💡 Oportunidade de Expansão',
      message: `Com ${metrics.appointmentsGrowth.toFixed(1)}% mais agendamentos, você pode considerar expandir horários de funcionamento ou contratar mais profissionais para atender a demanda crescente.`,
      type: 'opportunity',
      priority: 'medium'
    });
  }

  // Insight sobre meta de receita
  const projectedRevenue = metrics.totalRevenue * (1 + Math.max(metrics.revenueGrowth, 0) / 100);
  insights.push({
    icon: Target,
    title: '🎯 Projeção Estratégica',
    message: `Baseado no crescimento atual, você pode alcançar R$ ${projectedRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} no próximo mês. Mantenha o foco nas estratégias que estão funcionando.`,
    type: 'info',
    priority: 'medium'
  });

  // Insight motivacional
  insights.push({
    icon: Lightbulb,
    title: '✨ Dica do Expert',
    message: 'Analise seus horários de pico e otimize a agenda para maximizar a receita. Clientes satisfeitos recomendam 3x mais que a média do mercado.',
    type: 'tip',
    priority: 'low'
  });

  const getCardClass = (type: string) => {
    const baseClass = "p-4 rounded-lg border transition-all duration-200 hover:shadow-md";
    
    switch (type) {
      case 'success': 
        return `${baseClass} bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800`;
      case 'warning': 
        return `${baseClass} bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800`;
      case 'opportunity': 
        return `${baseClass} bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800`;
      case 'tip': 
        return `${baseClass} bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-800`;
      default: 
        return `${baseClass} bg-muted border-border`;
    }
  };

  const getTextColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-800 dark:text-green-200';
      case 'warning': return 'text-amber-800 dark:text-amber-200';
      case 'opportunity': return 'text-blue-800 dark:text-blue-200';
      case 'tip': return 'text-purple-800 dark:text-purple-200';
      default: return 'text-foreground';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-600';
      case 'warning': return 'bg-amber-600';
      case 'opportunity': return 'bg-blue-600';
      case 'tip': return 'bg-purple-600';
      default: return 'bg-muted-foreground';
    }
  };

  // Sort by priority
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  const sortedInsights = insights.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Brain className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl">Insights Inteligentes</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Análises automáticas baseadas nos seus dados</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedInsights.map((insight, index) => (
          <div key={index} className={getCardClass(insight.type)}>
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 w-8 h-8 ${getIconColor(insight.type)} rounded-lg flex items-center justify-center`}>
                <insight.icon className="w-4 h-4 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold ${getTextColor(insight.type)} mb-1`}>
                  {insight.title}
                </h4>
                <p className={`text-sm ${getTextColor(insight.type)} opacity-90`}>
                  {insight.message}
                </p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
