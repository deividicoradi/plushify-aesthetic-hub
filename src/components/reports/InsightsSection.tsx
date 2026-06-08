
import React from 'react';
import { ReportsMetrics } from '@/hooks/useReportsData';
import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics';
import { TrendingUp, AlertTriangle, Target, Lightbulb, Zap, Award, Brain, Save } from 'lucide-react';

interface InsightsSectionProps {
  metrics: ReportsMetrics | null;
  loading?: boolean;
}

export const InsightsSection = ({ metrics, loading = false }: InsightsSectionProps) => {
  const { analytics, saving } = useDashboardAnalytics();
  const latestAnalysis = analytics[0]; // Análise mais recente

  if (loading || !metrics) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#1a1322] p-6 font-[Sora]">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#D65E9A]/10 blur-3xl pointer-events-none" />
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D65E9A]/30 to-[#7B3FA0]/30 border border-[#D65E9A]/30 flex items-center justify-center">
            <Brain className="w-5 h-5 text-[#D65E9A]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Insights Inteligentes</h3>
            <p className="text-xs text-white/50">Carregando análises...</p>
          </div>
        </div>
        <div className="animate-pulse grid gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
              <div className="w-32 h-4 bg-white/10 rounded mb-3" />
              <div className="w-full h-3 bg-white/10 rounded mb-2" />
              <div className="w-3/4 h-3 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Usar insights salvos se disponíveis, senão gerar insights em tempo real
  const savedInsights = latestAnalysis?.insights || [];
  
  const realTimeInsights = [];

  // Insight sobre crescimento de receita
  if (metrics.revenueGrowth > 0) {
    realTimeInsights.push({
      icon: TrendingUp,
      title: '🚀 Crescimento Acelerado',
      message: `Excelente! Sua receita cresceu ${metrics.revenueGrowth.toFixed(1)}% este mês. Continue investindo em marketing digital e programas de fidelização para manter essa trajetória.`,
      type: 'success',
      priority: 'high'
    });
  } else if (metrics.revenueGrowth < -10) {
    realTimeInsights.push({
      icon: AlertTriangle,
      title: '⚠️ Atenção Necessária',
      message: `Detectamos uma queda de ${Math.abs(metrics.revenueGrowth).toFixed(1)}% na receita. Recomendamos analisar a satisfação dos clientes e revisar estratégias de vendas.`,
      type: 'warning',
      priority: 'high'
    });
  }

  // Insight sobre estoque baixo
  if (metrics.lowStockProducts > 0) {
    realTimeInsights.push({
      icon: AlertTriangle,
      title: '📦 Gestão de Estoque',
      message: `${metrics.lowStockProducts} produto(s) com estoque baixo. Configure alertas automáticos para evitar rupturas e otimizar suas vendas.`,
      type: 'warning',
      priority: 'medium'
    });
  }

  // Insight sobre crescimento de clientes
  if (metrics.clientsGrowth > 15) {
    realTimeInsights.push({
      icon: Award,
      title: '🎯 Captação Excepcional',
      message: `Parabéns! Você captou ${metrics.clientsGrowth.toFixed(1)}% mais clientes este mês. Considere implementar um programa de indicação para potencializar ainda mais esse crescimento.`,
      type: 'success',
      priority: 'high'
    });
  }

  // Insight sobre agendamentos
  if (metrics.appointmentsGrowth > 20) {
    realTimeInsights.push({
      icon: Zap,
      title: '💡 Oportunidade de Expansão',
      message: `Com ${metrics.appointmentsGrowth.toFixed(1)}% mais agendamentos, você pode considerar expandir horários de funcionamento ou contratar mais profissionais para atender a demanda crescente.`,
      type: 'opportunity',
      priority: 'medium'
    });
  }

  // Combinar insights salvos e em tempo real - garantindo que todos tenham icon
  const processedSavedInsights = savedInsights.map(insight => ({
    ...insight,
    icon: insight.icon || Lightbulb // Fallback icon
  }));

  const allInsights = [...processedSavedInsights, ...realTimeInsights];

  // Insight sobre meta de receita
  const projectedRevenue = metrics.totalRevenue * (1 + Math.max(metrics.revenueGrowth, 0) / 100);
  allInsights.push({
    icon: Target,
    title: '🎯 Projeção Estratégica',
    message: `Baseado no crescimento atual, você pode alcançar R$ ${projectedRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} no próximo mês. Mantenha o foco nas estratégias que estão funcionando.`,
    type: 'info',
    priority: 'medium'
  });

  // Insight motivacional
  allInsights.push({
    icon: Lightbulb,
    title: '✨ Dica do Expert',
    message: 'Analise seus horários de pico e otimize a agenda para maximizar a receita. Clientes satisfeitos recomendam 3x mais que a média do mercado.',
    type: 'tip',
    priority: 'low'
  });

  const typeStyles: Record<string, { ring: string; iconBg: string; iconColor: string; accent: string; label: string }> = {
    success: {
      ring: 'border-emerald-400/20 hover:border-emerald-400/40',
      iconBg: 'bg-emerald-500/15 border-emerald-400/30',
      iconColor: 'text-emerald-300',
      accent: 'bg-emerald-400',
      label: 'Positivo',
    },
    warning: {
      ring: 'border-amber-400/20 hover:border-amber-400/40',
      iconBg: 'bg-amber-500/15 border-amber-400/30',
      iconColor: 'text-amber-300',
      accent: 'bg-amber-400',
      label: 'Atenção',
    },
    opportunity: {
      ring: 'border-sky-400/20 hover:border-sky-400/40',
      iconBg: 'bg-sky-500/15 border-sky-400/30',
      iconColor: 'text-sky-300',
      accent: 'bg-sky-400',
      label: 'Oportunidade',
    },
    tip: {
      ring: 'border-[#D65E9A]/25 hover:border-[#D65E9A]/50',
      iconBg: 'bg-[#D65E9A]/15 border-[#D65E9A]/30',
      iconColor: 'text-[#D65E9A]',
      accent: 'bg-[#D65E9A]',
      label: 'Dica',
    },
    info: {
      ring: 'border-violet-400/20 hover:border-violet-400/40',
      iconBg: 'bg-violet-500/15 border-violet-400/30',
      iconColor: 'text-violet-300',
      accent: 'bg-violet-400',
      label: 'Insight',
    },
  };

  const getStyle = (type: string) => typeStyles[type] ?? typeStyles.info;

  // Sort by priority
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  const sortedInsights = allInsights
    .filter((insight, index, self) => 
      index === self.findIndex(i => i.title === insight.title) // Remove duplicatas
    )
    .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#1a1322] p-6 font-[Sora]">
      {/* Decorative glows */}
      <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[#D65E9A]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-[#7B3FA0]/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#D65E9A]/30 to-[#7B3FA0]/30 border border-[#D65E9A]/30 flex items-center justify-center shadow-lg shadow-[#D65E9A]/10">
            <Brain className="w-5 h-5 text-[#D65E9A]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
              Insights Inteligentes
              {saving && <Save className="w-3.5 h-3.5 text-[#D65E9A] animate-pulse" />}
            </h3>
            <p className="text-xs text-white/50 mt-0.5">
              Análises automáticas baseadas nos seus dados
              {latestAnalysis && ' · sincronizadas'}
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-medium text-white/60">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D65E9A] animate-pulse" />
          {sortedInsights.length} insights
        </span>
      </div>

      {/* Insights grid */}
      <div className="relative grid gap-3 sm:grid-cols-2">
        {sortedInsights.map((insight, index) => {
          const IconComponent = insight.icon || Lightbulb;
          const style = getStyle(insight.type);
          return (
            <div
              key={index}
              className={`group relative overflow-hidden rounded-2xl border ${style.ring} bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-sm p-4 transition-all duration-300 hover:-translate-y-0.5`}
            >
              {/* Accent bar */}
              <span className={`absolute left-0 top-4 bottom-4 w-[3px] rounded-r ${style.accent} opacity-70`} />

              <div className="flex items-start gap-3 pl-2">
                <div className={`flex-shrink-0 w-9 h-9 rounded-xl border ${style.iconBg} flex items-center justify-center`}>
                  <IconComponent className={`w-4 h-4 ${style.iconColor}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-white text-sm leading-snug">
                      {insight.title}
                    </h4>
                    <span className={`hidden md:inline-block text-[10px] uppercase tracking-wider font-medium px-1.5 py-0.5 rounded ${style.iconBg} ${style.iconColor} border`}>
                      {style.label}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-white/65">
                    {insight.message}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
