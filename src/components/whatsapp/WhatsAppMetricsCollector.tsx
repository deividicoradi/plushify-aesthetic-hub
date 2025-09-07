import React, { useEffect } from 'react';
import { useMonitoringData } from '@/hooks/useMonitoringData';

interface WhatsAppMetricsCollectorProps {
  sessionId?: string;
  userId?: string;
}

export const WhatsAppMetricsCollector: React.FC<WhatsAppMetricsCollectorProps> = ({
  sessionId,
  userId
}) => {
  const { recordMetric, logEvent } = useMonitoringData();

  // Coletar métricas de performance em tempo real
  useEffect(() => {
    if (!sessionId || !userId) return;

    const collectMetrics = async () => {
      try {
        // Simular coleta de métricas de CPU e Memória
        const cpuUsage = Math.random() * 100;
        const memoryUsage = Math.random() * 100;
        const responseTime = Math.random() * 1000 + 50;

        // Registrar métricas
        await recordMetric('cpu_usage', cpuUsage, 'gauge', { session_id: sessionId });
        await recordMetric('memory_usage', memoryUsage, 'gauge', { session_id: sessionId });
        await recordMetric('response_time', responseTime, 'gauge', { session_id: sessionId });

        // Log de evento de coleta
        await logEvent(
          'debug',
          'metrics_collected',
          'Métricas de performance coletadas',
          { 
            cpu_usage: cpuUsage, 
            memory_usage: memoryUsage, 
            response_time: responseTime 
          },
          userId,
          sessionId
        );

        // Verificar se há alertas a serem criados
        if (cpuUsage > 90) {
          await logEvent(
            'warn',
            'high_cpu_usage',
            `Alto uso de CPU detectado: ${cpuUsage.toFixed(2)}%`,
            { cpu_usage: cpuUsage },
            userId,
            sessionId
          );
        }

        if (memoryUsage > 85) {
          await logEvent(
            'warn',
            'high_memory_usage',
            `Alto uso de memória detectado: ${memoryUsage.toFixed(2)}%`,
            { memory_usage: memoryUsage },
            userId,
            sessionId
          );
        }

        if (responseTime > 800) {
          await logEvent(
            'warn',
            'slow_response',
            `Tempo de resposta lento detectado: ${responseTime.toFixed(2)}ms`,
            { response_time: responseTime },
            userId,
            sessionId
          );
        }
      } catch (error) {
        console.error('Error collecting metrics:', error);
        await logEvent(
          'error',
          'metrics_collection_failed',
          'Falha na coleta de métricas',
          { error: error instanceof Error ? error.message : String(error) },
          userId,
          sessionId
        );
      }
    };

    // Coletar métricas a cada 30 segundos
    collectMetrics();
    const interval = setInterval(collectMetrics, 30000);

    return () => clearInterval(interval);
  }, [sessionId, userId, recordMetric, logEvent]);

  // Este componente não renderiza nada, apenas coleta métricas
  return null;
};