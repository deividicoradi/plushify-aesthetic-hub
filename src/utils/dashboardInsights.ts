
export interface InsightData {
  type: string;
  title: string;
  message: string;
  severity: 'positive' | 'warning' | 'neutral';
  value: number;
}

export const generateInsights = (stats: any, reports: any): InsightData[] => {
  const insights: InsightData[] = [];
  
  // Análise de crescimento de clientes
  if (stats.newThisMonth > 0) {
    const growthRate = stats.totalClients > 0 ? (stats.newThisMonth / stats.totalClients) * 100 : 0;
    insights.push({
      type: 'client_growth',
      title: 'Crescimento de Clientes',
      message: `Você captou ${stats.newThisMonth} novos clientes este mês (${growthRate.toFixed(1)}% de crescimento).`,
      severity: growthRate > 10 ? 'positive' : 'neutral',
      value: growthRate
    });
  }

  // Análise de receita
  if (stats.monthlyRevenue > 0) {
    const revenuePerClient = stats.totalClients > 0 ? stats.monthlyRevenue / stats.totalClients : 0;
    insights.push({
      type: 'revenue_analysis',
      title: 'Análise de Receita',
      message: `Receita média por cliente: R$ ${revenuePerClient.toFixed(2)}. ${revenuePerClient > 100 ? 'Excelente ticket médio!' : 'Considere estratégias para aumentar o ticket médio.'}`,
      severity: revenuePerClient > 100 ? 'positive' : 'warning',
      value: revenuePerClient
    });
  }

  // Análise de agendamentos
  if (stats.weeklyAppointments > 0 && stats.totalAppointments > 0) {
    const appointmentRate = (stats.weeklyAppointments / stats.totalAppointments) * 100;
    insights.push({
      type: 'appointment_analysis',
      title: 'Análise de Agendamentos',
      message: `${stats.weeklyAppointments} agendamentos esta semana. ${appointmentRate > 20 ? 'Ótima frequência!' : 'Considere estratégias de retenção.'}`,
      severity: appointmentRate > 20 ? 'positive' : 'neutral',
      value: appointmentRate
    });
  }

  // Análise de tendências (reports data)
  if (reports.metrics) {
    if (reports.metrics.revenueGrowth > 10) {
      insights.push({
        type: 'trend_analysis',
        title: 'Tendência Positiva',
        message: `Crescimento de receita de ${reports.metrics.revenueGrowth.toFixed(1)}% detectado. Continue investindo nas estratégias atuais!`,
        severity: 'positive',
        value: reports.metrics.revenueGrowth
      });
    }

    if (reports.metrics.lowStockProducts > 0) {
      insights.push({
        type: 'inventory_alert',
        title: 'Alerta de Estoque',
        message: `${reports.metrics.lowStockProducts} produto(s) com estoque baixo. Configure reposição automática.`,
        severity: 'warning',
        value: reports.metrics.lowStockProducts
      });
    }
  }

  return insights;
};
