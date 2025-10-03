import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UpdateNotificationProps {
  onUpdate: () => void;
}

export const UpdateNotification: React.FC<UpdateNotificationProps> = ({ onUpdate }) => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Usar gerenciador centralizado de SW ao invés de múltiplos listeners
    if ('serviceWorker' in navigator) {
      const { swManager } = require('@/utils/swManager');
      
      const cleanup = swManager.onUpdateAvailable(() => {
        setUpdateAvailable(true);
        toast({
          title: 'Nova versão disponível!',
          description: 'Uma nova versão da aplicação está disponível. Clique para atualizar.',
          duration: 0,
        });
      });

      return cleanup;
    }
  }, [toast]);

  const handleUpdate = async () => {
    setIsLoading(true);
    
    try {
      if ('serviceWorker' in navigator) {
        const { swManager } = require('@/utils/swManager');
        await swManager.activateUpdate();
      } else {
        // Fallback: apenas recarregar
        onUpdate();
        window.location.reload();
      }
    } catch (error) {
      console.error('[Update] Error:', error);
      toast({
        title: 'Erro na atualização',
        description: 'Não foi possível atualizar a aplicação. Tente recarregar a página.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    setUpdateAvailable(false);
  };

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="border-primary bg-background shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Download className="h-4 w-4" />
            Atualização Disponível
          </CardTitle>
          <CardDescription className="text-xs">
            Uma nova versão da aplicação está disponível com melhorias e correções.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Button 
              onClick={handleUpdate} 
              disabled={isLoading}
              size="sm"
              className="flex-1"
            >
              {isLoading ? (
                <RefreshCw className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Download className="h-3 w-3 mr-1" />
              )}
              {isLoading ? 'Atualizando...' : 'Atualizar'}
            </Button>
            <Button 
              onClick={handleDismiss} 
              variant="outline" 
              size="sm"
            >
              Depois
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};