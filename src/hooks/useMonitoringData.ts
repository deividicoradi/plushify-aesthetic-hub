import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Metric {
  id: string;
  metric_name: string;
  metric_value: number;
  timestamp: string;
  labels: any;
}

export interface LogEntry {
  id: string;
  level: string;
  event_type: string;
  message: string;
  timestamp: string;
  user_id?: string;
  session_id?: string;
  metadata: any;
}

export interface Alert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  acknowledged: boolean;
  created_at: string;
  metadata: any;
}

export interface HealthStatus {
  service_name: string;
  status: string;
  response_time: number;
  error_rate: number;
  last_check: string;
  uptime_percentage: number;
}

export const useMonitoringData = (timeRange: string = '1h') => {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [healthStatus, setHealthStatus] = useState<HealthStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const getTimeFilter = () => {
    const now = new Date();
    switch (timeRange) {
      case '1h':
        return new Date(now.getTime() - 60 * 60 * 1000).toISOString();
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    }
  };

  const loadMetrics = async () => {
    try {
      const timeFilter = getTimeFilter();
      const { data, error } = await supabase
        .from('whatsapp_metrics')
        .select('*')
        .gte('timestamp', timeFilter)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      setMetrics(data || []);
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const loadLogs = async () => {
    try {
      const timeFilter = getTimeFilter();
      const { data, error } = await supabase
        .from('whatsapp_logs')
        .select('*')
        .gte('timestamp', timeFilter)
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  const loadAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_alerts')
        .select('*')
        .eq('resolved', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  const loadHealthStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_health_status')
        .select('*')
        .order('last_check', { ascending: false });

      if (error) throw error;
      setHealthStatus(data || []);
    } catch (error) {
      console.error('Error loading health status:', error);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadMetrics(),
        loadLogs(),
        loadAlerts(),
        loadHealthStatus()
      ]);
    } catch (error) {
      console.error('Error loading monitoring data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados de monitoramento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeAlert = async (alertId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('whatsapp_alerts')
        .update({
          acknowledged: true,
          acknowledged_by: userId,
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;
      
      await loadAlerts();
      toast({
        title: "Alerta reconhecido",
        description: "O alerta foi marcado como visualizado",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível reconhecer o alerta",
        variant: "destructive",
      });
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('whatsapp_alerts')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;
      
      await loadAlerts();
      toast({
        title: "Alerta resolvido",
        description: "O alerta foi marcado como resolvido",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível resolver o alerta",
        variant: "destructive",
      });
    }
  };

  const recordMetric = async (
    metricName: string,
    metricValue: number,
    metricType: string = 'gauge',
    labels: any = {}
  ) => {
    try {
      const { error } = await supabase.rpc('record_whatsapp_metric', {
        p_metric_name: metricName,
        p_metric_value: metricValue,
        p_metric_type: metricType,
        p_labels: labels
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error recording metric:', error);
    }
  };

  const logEvent = async (
    level: string,
    eventType: string,
    message: string,
    metadata: any = {},
    userId?: string,
    sessionId?: string
  ) => {
    try {
      const { error } = await supabase.rpc('log_whatsapp_event', {
        p_user_id: userId || null,
        p_session_id: sessionId || null,
        p_level: level,
        p_event_type: eventType,
        p_message: message,
        p_metadata: metadata
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging event:', error);
    }
  };

  const createAlert = async (
    alertType: string,
    severity: string,
    title: string,
    description: string,
    metadata: any = {}
  ) => {
    try {
      const { error } = await supabase.rpc('create_whatsapp_alert', {
        p_alert_type: alertType,
        p_severity: severity,
        p_title: title,
        p_description: description,
        p_metadata: metadata
      });

      if (error) throw error;
      await loadAlerts();
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [timeRange]);

  return {
    metrics,
    logs,
    alerts,
    healthStatus,
    loading,
    loadAllData,
    acknowledgeAlert,
    resolveAlert,
    recordMetric,
    logEvent,
    createAlert
  };
};