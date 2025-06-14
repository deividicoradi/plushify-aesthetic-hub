
export interface RecommendationData {
  type: string;
  title: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
}

export const generateRecommendations = (insights: any[]): RecommendationData[] => {
  const recommendations: RecommendationData[] = [];

  const positiveInsights = insights.filter(i => i.severity === 'positive').length;
  const warningInsights = insights.filter(i => i.severity === 'warning').length;

  if (positiveInsights > warningInsights) {
    recommendations.push({
      type: 'growth_strategy',
      title: 'Estratégia de Crescimento',
      action: 'Considere expandir os serviços que estão performando bem',
      priority: 'high'
    });
  }

  if (warningInsights > 0) {
    recommendations.push({
      type: 'improvement_focus',
      title: 'Foco em Melhorias',
      action: 'Priorize resolver os alertas identificados para otimizar resultados',
      priority: 'medium'
    });
  }

  recommendations.push({
    type: 'automation',
    title: 'Automação',
    action: 'Configure alertas automáticos para monitorar KPIs importantes',
    priority: 'low'
  });

  return recommendations;
};
