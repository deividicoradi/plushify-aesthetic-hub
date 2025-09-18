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
    // Listen for workbox update events
    const handleUpdateAvailable = () => {
      setUpdateAvailable(true);
      toast({
        title: 'Nova versão disponível!',
        description: 'Uma nova versão da aplicação está disponível. Clique para atualizar.',
        duration: 0, // Don't auto-dismiss
      });
    };

    // Listen for service worker update events
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', handleUpdateAvailable);
      
      // Check for updates periodically
      const checkForUpdates = () => {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => {
            registration.update();
          });
        });
      };

      // Check for updates every 5 minutes
      const interval = setInterval(checkForUpdates, 5 * 60 * 1000);
      
      // Check immediately
      checkForUpdates();

      return () => {
        navigator.serviceWorker.removeEventListener('controllerchange', handleUpdateAvailable);
        clearInterval(interval);
      };
    }

    // Fallback for development or non-PWA environments
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Simulate update check by comparing timestamps
        const lastUpdate = localStorage.getItem('app-last-update');
        const now = Date.now();
        
        if (!lastUpdate || now - parseInt(lastUpdate) > 10 * 60 * 1000) { // 10 minutes
          setUpdateAvailable(true);
          localStorage.setItem('app-last-update', now.toString());
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [toast]);

  const handleUpdate = async () => {
    setIsLoading(true);
    
    try {
      // Force update via service worker
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        
        for (const registration of registrations) {
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
          await registration.update();
        }
      }
      
      // Call the update callback
      onUpdate();
      
      // Force page reload to get new version
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Error updating app:', error);
      toast({
        title: 'Erro na atualização',
        description: 'Não foi possível atualizar a aplicação. Tente recarregar a página.',
        variant: 'destructive',
      });
    } finally {
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