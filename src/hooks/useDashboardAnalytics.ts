
import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardStats } from './useDashboardStats';
import { useReportsData } from './useReportsData';
import { useAnalyticsData } from './useAnalyticsData';
import { generateInsights } from '@/utils/dashboardInsights';
import { generateRecommendations } from '@/utils/dashboardRecommendations';

export const useDashboardAnalytics = () => {
  const { user } = useAuth();
  
  // Obter dados para análise
  const dashboardStats = useDashboardStats();
  const reportsData = useReportsData();
  
  // Gerenciar dados de analytics
  const {
    analytics,
    loading,
    saving,
    saveAnalysis,
    fetchAnalytics
  } = useAnalyticsData();

  // Criar e salvar análise automática
  const createAndSaveAnalysis = useCallback(async () => {
    if (!user || dashboardStats.loading || reportsData.loading) return;

    try {
      const insights = generateInsights(dashboardStats, reportsData);
      const recommendations = generateRecommendations(insights);
      
      const trends = {
        revenue_trend: reportsData.metrics?.revenueGrowth || 0,
        client_trend: dashboardStats.newThisMonth || 0,
        appointment_trend: dashboardStats.weeklyAppointments || 0
      };

      const analysisData = {
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

      await saveAnalysis(analysisData);
    } catch (error) {
      console.error('Erro ao criar e salvar análise:', error);
    }
  }, [user, dashboardStats, reportsData, saveAnalysis]);

  // Salvar análise automaticamente quando os dados mudarem
  useEffect(() => {
    if (!dashboardStats.loading && !reportsData.loading && user) {
      const timer = setTimeout(() => {
        createAndSaveAnalysis();
      }, 2000); // Aguarda 2 segundos após os dados carregarem

      return () => clearTimeout(timer);
    }
  }, [dashboardStats.loading, reportsData.loading, user, createAndSaveAnalysis]);

  // Buscar análises ao montar o componente
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    saving,
    saveAnalysis: createAndSaveAnalysis,
    refetch: fetchAnalytics
  };
};
