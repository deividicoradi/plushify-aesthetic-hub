
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Database, CheckCircle } from 'lucide-react';

export const CacheStatus: React.FC = () => {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Verificar se há atualizações disponíveis
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setIsUpdateAvailable(true);
      });
    }
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    
    try {
      // Recarregar a página para aplicar atualizações
      window.location.reload();
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      setIsUpdating(false);
    }
  };

  if (!isUpdateAvailable) return null;

  return (
    <Card className="fixed bottom-4 left-4 z-50 w-80 bg-card/95 backdrop-blur-sm border-border/50 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Atualização Disponível</CardTitle>
        </div>
        <CardDescription>
          Uma nova versão do Plushify está disponível
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleUpdate} 
          disabled={isUpdating}
          className="w-full"
        >
          {isUpdating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Atualizando...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Atualizar Agora
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
