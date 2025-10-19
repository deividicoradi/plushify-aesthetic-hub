import { useEffect, useRef } from 'react';
import { wppConnectClient } from '@/integrations/whatsapp/wppConnectClient';

interface UseWhatsAppPollingProps {
  isConnecting: boolean;
  onStatusChange: (status: string, qrCode?: string) => void;
  pollingInterval?: number; // milliseconds
}

/**
 * Hook para fazer polling do status do WhatsApp durante a conexão
 * Polling é feito apenas quando isConnecting = true
 */
export const useWhatsAppPolling = ({
  isConnecting,
  onStatusChange,
  pollingInterval = 3000 // 3 segundos (conforme especificado: 3-5s)
}: UseWhatsAppPollingProps) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false);

  useEffect(() => {
    const pollStatus = async () => {
      if (isPollingRef.current) return; // Prevent concurrent polls
      
      isPollingRef.current = true;
      try {
        const statusResult = await wppConnectClient.getStatus();
        
        // Se conectou, parar polling
        if (statusResult.status === 'conectado') {
          onStatusChange('conectado');
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        } else if (statusResult.status === 'pareando') {
          // Ainda pareando, atualizar QR code se houver
          onStatusChange('pareando', statusResult.qrcode);
        } else {
          // Desconectado ou erro
          onStatusChange(statusResult.status || 'desconectado');
        }
      } catch (error) {
        console.error('Polling error:', error);
        onStatusChange('erro');
      } finally {
        isPollingRef.current = false;
      }
    };

    // Iniciar polling quando isConnecting = true
    if (isConnecting && !intervalRef.current) {
      console.log('Starting WhatsApp status polling...');
      
      // Poll imediatamente
      pollStatus();
      
      // Depois a cada pollingInterval
      intervalRef.current = setInterval(pollStatus, pollingInterval);
    }

    // Parar polling quando isConnecting = false
    if (!isConnecting && intervalRef.current) {
      console.log('Stopping WhatsApp status polling...');
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Cleanup ao desmontar
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isConnecting, onStatusChange, pollingInterval]);

  // Função para forçar uma verificação manual
  const forceCheck = async () => {
    try {
      const statusResult = await wppConnectClient.getStatus();
      onStatusChange(statusResult.status || 'desconectado', statusResult.qrcode);
      return statusResult;
    } catch (error) {
      console.error('Force check error:', error);
      onStatusChange('erro');
      throw error;
    }
  };

  return { forceCheck };
};
