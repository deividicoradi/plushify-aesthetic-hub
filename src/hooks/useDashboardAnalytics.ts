
import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardStats } from './useDashboardStats';
import { useReportsData } from './useReportsData';
import { useAnalyticsData } from './useAnalyticsData';

export const useDashboardAnalytics = () => {
  const { user } = useAuth();
  
  // Obter dados básicos
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

  // Criar análise apenas quando solicitado
  const createAndSaveAnalysis = useCallback(async () => {
    if (!user || dashboardStats.loading || reportsData.loading) return;

    try {
      // Analytics simplificado apenas com métricas básicas
      const analysisData = {
        metrics: {
          total_clients: dashboardStats.totalClients,
          monthly_revenue: dashboardStats.monthlyRevenue,
          weekly_appointments: dashboardStats.weeklyAppointments,
          new_clients: dashboardStats.newThisMonth
        },
        insights: [],
        trends: {
          revenue_trend: reportsData.metrics?.revenueGrowth || 0,
          client_trend: dashboardStats.newThisMonth || 0,
          appointment_trend: dashboardStats.weeklyAppointments || 0
        },
        recommendations: []
      };

      await saveAnalysis(analysisData);
    } catch (error) {
      console.error('Erro ao criar análise:', error);
    }
  }, [user, dashboardStats, reportsData, saveAnalysis]);

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
