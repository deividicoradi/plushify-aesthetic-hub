import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, X, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PWAUpdatePromptProps {
  onUpdate?: () => void;
}

export const PWAUpdatePrompt: React.FC<PWAUpdatePromptProps> = ({ onUpdate }) => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Verificar se há service worker e se há atualizações
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Uma nova versão foi instalada
        window.location.reload();
      });

      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Nova versão disponível
                setUpdateAvailable(true);
                toast({
                  title: "Atualização Disponível",
                  description: "Uma nova versão do Plushify está disponível!",
                  duration: 5000,
                });
              }
            });
          }
        });
      });
    }
  }, [toast]);

  const handleUpdate = async () => {
    if (!('serviceWorker' in navigator)) return;

    setIsUpdating(true);
    
    try {
      const registration = await navigator.serviceWorker.ready;
      const waiting = registration.waiting;
      
      if (waiting) {
        // Enviar mensagem para o service worker pular a espera
        waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // Aguardar o controllerchange para recarregar
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          onUpdate?.();
          window.location.reload();
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar PWA:', error);
      toast({
        title: "Erro na Atualização",
        description: "Não foi possível atualizar. Tente recarregar a página.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setUpdateAvailable(false);
  };

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-in slide-in-from-right-2 duration-500">
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-2xl backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg text-foreground">Atualização Disponível</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Nova versão do Plushify
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>Uma nova versão com melhorias e correções está disponível.</p>
          </div>

          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleUpdate} 
              disabled={isUpdating}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Atualizando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar Agora
                </>
              )}
            </Button>
            <Button variant="ghost" onClick={handleDismiss} className="w-full text-xs">
              Atualizar Depois
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};