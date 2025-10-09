/**
 * Hook de observabilidade para monitorar requisições em desenvolvimento
 * 
 * Mostra avisos quando:
 * - Um endpoint específico recebe >20 req/min
 * - Total de requisições >60/min
 */

import { useEffect, useState } from 'react';
import { requestManager } from '@/utils/requestManager';

interface EndpointStats {
  endpoint: string;
  count: number;
}

export const useRequestStats = () => {
  const [stats, setStats] = useState({
    total: 0,
    cached: 0,
    deduped: 0,
    rateLimited: 0,
    retried: 0,
    aborted: 0,
  });
  
  const [endpointStats, setEndpointStats] = useState<EndpointStats[]>([]);
  
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    
    let lastCheck = Date.now();
    const interval = setInterval(() => {
      const currentStats = requestManager.getStats();
      const now = Date.now();
      const elapsed = (now - lastCheck) / 60000; // minutos
      
      setStats(currentStats);
      
      // Calcular req/min
      const reqPerMin = currentStats.total / elapsed;
      
      // Avisar se total >60/min
      if (reqPerMin > 60) {
        console.warn(
          `[RequestStats] ⚠️ Alto volume de requisições: ${Math.round(reqPerMin)}/min (limite: 60/min)`
        );
      }
      
      lastCheck = now;
    }, 60000); // Verificar a cada 1 minuto
    
    return () => clearInterval(interval);
  }, []);
  
  return {
    stats,
    endpointStats,
  };
};
