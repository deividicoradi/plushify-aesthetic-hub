
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface DashboardAnalytics {
  id: string;
  analysis_date: string;
  metrics: any;
  insights: any;
  trends: any;
  recommendations: any;
  created_at: string;
  updated_at: string;
}

export const useAnalyticsData = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<DashboardAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  // Salvar análise automática
  const saveAnalysis = useCallback(async (analysisData: any) => {
    if (!user) return;

    try {
      setSaving(true);
      
      const dataToSave = {
        ...analysisData,
        user_id: user.id,
        analysis_date: new Date().toISOString().split('T')[0],
      };

      // Verificar se já existe análise para hoje
      const { data: existingAnalysis } = await supabase
        .from('dashboard_analytics')
        .select('id')
        .eq('user_id', user.id)
        .eq('analysis_date', dataToSave.analysis_date)
        .single();

      if (existingAnalysis) {
        // Atualizar análise existente
        await supabase
          .from('dashboard_analytics')
          .update(dataToSave)
          .eq('id', existingAnalysis.id);
      } else {
        // Criar nova análise
        await supabase
          .from('dashboard_analytics')
          .insert(dataToSave);
      }

      await fetchAnalytics();
    } catch (error) {
      console.error('Erro ao salvar análise:', error);
    } finally {
      setSaving(false);
    }
  }, [user, fetchAnalytics]);

  return {
    analytics,
    loading,
    saving,
    saveAnalysis,
    fetchAnalytics,
    setSaving
  };
};
