
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportsMetrics } from '@/hooks/useReportsData';
import { TrendingUp, AlertTriangle, Target, Lightbulb, Zap, Award, Brain, ArrowUpRight } from 'lucide-react';

interface InsightsSectionProps {
  metrics: ReportsMetrics | null;
  loading?: boolean;
}

export const InsightsSection = ({ metrics, loading = false }: InsightsSectionProps) => {
  if (loading || !metrics) {
    return (
      <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <CardTitle className="text-xl">Insights Inteligentes</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 bg-muted rounded-xl">
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

  const getBackgroundClass = (type: string, priority: string) => {
    const baseClass = "relative overflow-hidden border rounded-xl p-6 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group";
    
    switch (type) {
      case 'success': 
        return `${baseClass} bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 dark:from-emerald-950/20 dark:to-green-950/20 dark:border-emerald-800`;
      case 'warning': 
        return `${baseClass} bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 dark:from-amber-950/20 dark:to-orange-950/20 dark:border-amber-800`;
      case 'opportunity': 
        return `${baseClass} bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 dark:from-blue-950/20 dark:to-cyan-950/20 dark:border-blue-800`;
      case 'tip': 
        return `${baseClass} bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 dark:from-purple-950/20 dark:to-pink-950/20 dark:border-purple-800`;
      default: 
        return `${baseClass} bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200 dark:from-slate-950/20 dark:to-gray-950/20 dark:border-slate-800`;
    }
  };

  const getTextColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-emerald-800 dark:text-emerald-200';
      case 'warning': return 'text-amber-800 dark:text-amber-200';
      case 'opportunity': return 'text-blue-800 dark:text-blue-200';
      case 'tip': return 'text-purple-800 dark:text-purple-200';
      default: return 'text-slate-800 dark:text-slate-200';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'success': return 'from-emerald-500 to-green-500';
      case 'warning': return 'from-amber-500 to-orange-500';
      case 'opportunity': return 'from-blue-500 to-cyan-500';
      case 'tip': return 'from-purple-500 to-pink-500';
      default: return 'from-slate-500 to-gray-500';
    }
  };

  // Sort by priority
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  const sortedInsights = insights.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

  const patternUrl = "data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='0.1'%3E%3Ccircle cx='10' cy='10' r='1'/%3E%3C/g%3E%3C/svg%3E";

  return (
    <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl">Insights Inteligentes</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Análises automáticas baseadas nos seus dados</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
            <Zap className="w-3 h-3" />
            IA Ativa
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedInsights.map((insight, index) => (
          <div key={index} className={getBackgroundClass(insight.type, insight.priority)}>
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `url("${patternUrl}")` }}></div>
            
            <div className="relative flex items-start gap-4">
              <div className={`flex-shrink-0 w-10 h-10 bg-gradient-to-r ${getIconColor(insight.type)} rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                <insight.icon className="w-5 h-5 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className={`font-semibold text-lg ${getTextColor(insight.type)} leading-tight`}>
                    {insight.title}
                  </h4>
                  {insight.priority === 'high' && (
                    <div className="flex-shrink-0">
                      <ArrowUpRight className={`w-4 h-4 ${getTextColor(insight.type)} opacity-60`} />
                    </div>
                  )}
                </div>
                <p className={`text-sm ${getTextColor(insight.type)} leading-relaxed opacity-90`}>
                  {insight.message}
                </p>
              </div>
            </div>

            {/* Priority indicator */}
            {insight.priority === 'high' && (
              <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
