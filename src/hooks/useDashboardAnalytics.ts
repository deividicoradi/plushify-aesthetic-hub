
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardStats } from './useDashboardStats';
import { useReportsData } from './useReportsData';

interface DashboardAnalytics {
  id: string;
  analysis_date: string;
  metrics: any;
  insights: any;
  trends: any;
  recommendations: any;
  created_at: string;
  updated_at: string;
}

export const useDashboardAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<DashboardAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Obter dados para análise
  const dashboardStats = useDashboardStats();
  const reportsData = useReportsData();

  // Gerar insights automáticos baseados nos dados
  const generateInsights = useCallback((stats: any, reports: any) => {
    const insights = [];
    
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
  }, []);

  // Gerar recomendações baseadas nos insights
  const generateRecommendations = useCallback((insights: any[]) => {
    const recommendations = [];

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
  }, []);

  // Salvar análise automática
  const saveAnalysis = useCallback(async () => {
    if (!user || dashboardStats.loading || reportsData.loading) return;

    try {
      setSaving(true);
      
      const insights = generateInsights(dashboardStats, reportsData);
      const recommendations = generateRecommendations(insights);
      
      const trends = {
        revenue_trend: reportsData.metrics?.revenueGrowth || 0,
        client_trend: dashboardStats.newThisMonth || 0,
        appointment_trend: dashboardStats.weeklyAppointments || 0
      };

      const analysisData = {
        user_id: user.id,
        analysis_date: new Date().toISOString().split('T')[0],
        metrics: {
          total_clients: dashboardStats.totalClients,
          monthly_revenue: dashboardStats.monthlyRevenue,
          weekly_appointments: dashboardStats.weeklyAppointments,
          new_clients: dashboardStats.newThisMonth
        },
        insights,
        trends,
        recommendations
      };

      // Verificar se já existe análise para hoje
      const { data: existingAnalysis } = await supabase
        .from('dashboard_analytics')
        .select('id')
        .eq('user_id', user.id)
        .eq('analysis_date', analysisData.analysis_date)
        .single();

      if (existingAnalysis) {
        // Atualizar análise existente
        await supabase
          .from('dashboard_analytics')
          .update(analysisData)
          .eq('id', existingAnalysis.id);
      } else {
        // Criar nova análise
        await supabase
          .from('dashboard_analytics')
          .insert(analysisData);
      }

      await fetchAnalytics();
    } catch (error) {
      console.error('Erro ao salvar análise:', error);
    } finally {
      setSaving(false);
    }
  }, [user, dashboardStats, reportsData, generateInsights, generateRecommendations]);

  // Buscar análises existentes
  const fetchAnalytics = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('dashboard_analytics')
        .select('*')
        .eq('user_id', user.id)
        .order('analysis_date', { ascending: false })
        .limit(30);

      if (error) throw error;
      setAnalytics(data || []);
    } catch (error) {
      console.error('Erro ao buscar análises:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Salvar análise automaticamente quando os dados mudarem
  useEffect(() => {
    if (!dashboardStats.loading && !reportsData.loading && user) {
      const timer = setTimeout(() => {
        saveAnalysis();
      }, 2000); // Aguarda 2 segundos após os dados carregarem

      return () => clearTimeout(timer);
    }
  }, [dashboardStats.loading, reportsData.loading, user, saveAnalysis]);

  // Buscar análises ao montar o componente
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    saving,
    saveAnalysis,
    refetch: fetchAnalytics
  };
};
