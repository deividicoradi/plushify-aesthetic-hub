
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface OfflineQueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  endpoint: string;
  data: any;
  timestamp: number;
}

export const useOfflineStorage = () => {
  const { user } = useAuth();
  // Scope the offline queue key per-user to prevent one account replaying another
  // account's queued mutations on a shared browser.
  const queueKey = user?.id ? `offline-queue:${user.id}` : 'offline-queue:anon';
  const [offlineQueue, setOfflineQueue] = useState<OfflineQueueItem[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);

  useEffect(() => {
    // Carregar queue do localStorage
    const savedQueue = localStorage.getItem(queueKey);
    if (savedQueue) {
      try {
        setOfflineQueue(JSON.parse(savedQueue));
      } catch (error) {
        console.error('Erro ao carregar queue offline:', error);
      }
    } else {
      setOfflineQueue([]);
    }
  }, [queueKey]);

  const addToQueue = (item: Omit<OfflineQueueItem, 'id' | 'timestamp'>) => {
    const queueItem: OfflineQueueItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };

    const updatedQueue = [...offlineQueue, queueItem];
    setOfflineQueue(updatedQueue);
    localStorage.setItem(queueKey, JSON.stringify(updatedQueue));
  };

  const processQueue = async () => {
    if (isProcessingQueue || offlineQueue.length === 0) return;

    setIsProcessingQueue(true);
    const successfulItems: string[] = [];

    for (const item of offlineQueue) {
      try {
        // Simular processamento de item da queue
        console.log('Processando item offline:', item);
        
        // Aqui você faria a requisição real para a API
        // await api.request(item.endpoint, item.data, item.type);
        
        successfulItems.push(item.id);
      } catch (error) {
        console.error('Erro ao processar item da queue:', error);
      }
    }

    // Remover itens processados com sucesso
    const remainingQueue = offlineQueue.filter(item => !successfulItems.includes(item.id));
    setOfflineQueue(remainingQueue);
    localStorage.setItem(queueKey, JSON.stringify(remainingQueue));
    
    setIsProcessingQueue(false);
  };

  const clearQueue = () => {
    setOfflineQueue([]);
    localStorage.removeItem(queueKey);
  };

  return {
    offlineQueue,
    addToQueue,
    processQueue,
    clearQueue,
    isProcessingQueue,
    queueLength: offlineQueue.length
  };
};
