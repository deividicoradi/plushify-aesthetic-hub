import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Clock, RotateCcw } from 'lucide-react';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { useRetry } from '@/hooks/useRetry';

export const WhatsAppMonitoring: React.FC = () => {
  const { session, getSessionStatus } = useWhatsApp();
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [connectionHealth, setConnectionHealth] = useState<'healthy' | 'warning' | 'error'>('healthy');

  const { execute: retryConnection, isLoading: isRetrying } = useRetry(
    async () => {
      await getSessionStatus();
      setLastCheck(new Date());
    },
    { maxAttempts: 3, delay: 2000, backoff: true }
  );

  // Monitoramento automático da conexão
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await getSessionStatus();
        setLastCheck(new Date());
        setConnectionHealth('healthy');
      } catch (error) {
        console.error('Falha no monitoramento:', error);
        setConnectionHealth('error');
      }
    }, 30000); // Check a cada 30 segundos

    return () => clearInterval(interval);
  }, [getSessionStatus]);

  // Detectar problemas de conexão
  useEffect(() => {
    if (session.status === 'conectado') {
      setConnectionHealth('healthy');
    } else if (session.status === 'pareando' || session.status === 'conectando') {
      setConnectionHealth('warning');
    } else {
      setConnectionHealth('error');
    }
  }, [session.status]);

  const getStatusIcon = () => {
    switch (connectionHealth) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = () => {
    switch (session.status) {
      case 'conectado':
        return <Badge variant="default" className="bg-green-500">Conectado</Badge>;
      case 'pareando':
        return <Badge variant="secondary">Pareando</Badge>;
      case 'conectando':
        return <Badge variant="secondary">Conectando</Badge>;
      default:
        return <Badge variant="destructive">Desconectado</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Status da Conexão WhatsApp
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status:</span>
          {getStatusBadge()}
        </div>


        {lastCheck && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Última Verificação:</span>
            <span className="text-sm">{lastCheck.toLocaleTimeString()}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Saúde da Conexão:</span>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm capitalize">{connectionHealth}</span>
          </div>
        </div>

        {connectionHealth === 'error' && (
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => retryConnection()}
              disabled={isRetrying}
              className="w-full"
            >
              <RotateCcw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Reconectando...' : 'Tentar Reconectar'}
            </Button>
          </div>
        )}

        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
          <p className="font-semibold mb-1">Monitoramento Automático:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Verificação de status a cada 30 segundos</li>
            <li>Reconexão automática em caso de falha</li>
            <li>Detecção de problemas de conectividade</li>
            <li>Persistência de sessão entre reinicializações</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};