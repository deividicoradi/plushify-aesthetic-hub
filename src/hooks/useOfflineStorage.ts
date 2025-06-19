
import { useState, useEffect } from 'react';

interface OfflineQueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  endpoint: string;
  data: any;
  timestamp: number;
}

export const useOfflineStorage = () => {
  const [offlineQueue, setOfflineQueue] = useState<OfflineQueueItem[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);

  useEffect(() => {
    // Carregar queue do localStorage
    const savedQueue = localStorage.getItem('offline-queue');
    if (savedQueue) {
      try {
        setOfflineQueue(JSON.parse(savedQueue));
      } catch (error) {
        console.error('Erro ao carregar queue offline:', error);
      }
    }
  }, []);

  const addToQueue = (item: Omit<OfflineQueueItem, 'id' | 'timestamp'>) => {
    const queueItem: OfflineQueueItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };

    const updatedQueue = [...offlineQueue, queueItem];
    setOfflineQueue(updatedQueue);
    localStorage.setItem('offline-queue', JSON.stringify(updatedQueue));
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
    localStorage.setItem('offline-queue', JSON.stringify(remainingQueue));
    
    setIsProcessingQueue(false);
  };

  const clearQueue = () => {
    setOfflineQueue([]);
    localStorage.removeItem('offline-queue');
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
