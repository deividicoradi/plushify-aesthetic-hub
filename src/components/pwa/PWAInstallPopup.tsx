
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, X, Smartphone, Monitor, CheckCircle } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export const PWAInstallPopup: React.FC = () => {
  const { isInstallable, installApp, isInstalled } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Verificar se o popup foi dispensado antes
    const dismissed = localStorage.getItem('pwa-popup-dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Mostrar popup após 3 segundos se for instalável
    if (isInstallable && !isInstalled) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled]);

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setIsVisible(false);
      console.log('PWA instalado com sucesso!');
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('pwa-popup-dismissed', 'true');
  };

  const handleRemindLater = () => {
    setIsVisible(false);
    // Lembrar novamente em 24 horas
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    localStorage.setItem('pwa-popup-remind-date', tomorrow.toISOString());
  };

  // Não mostrar se não for instalável, já estiver instalado, foi dispensado ou não está visível
  if (!isInstallable || isInstalled || isDismissed || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-in slide-in-from-right-2 duration-500">
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-2xl backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground font-bold text-lg">P</span>
              </div>
              <div>
                <CardTitle className="text-lg text-foreground">Instalar Plushify</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Acesso rápido e experiência nativa
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
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Funciona offline</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Carregamento mais rápido</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Experiência como app nativo</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 py-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Smartphone className="h-3 w-3" />
              <span>Mobile</span>
            </div>
            <div className="w-px h-4 bg-border"></div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Monitor className="h-3 w-3" />
              <span>Desktop</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button onClick={handleInstall} className="w-full bg-primary hover:bg-primary/90">
              <Download className="h-4 w-4 mr-2" />
              Instalar App
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRemindLater} className="flex-1 text-xs">
                Lembrar depois
              </Button>
              <Button variant="ghost" onClick={handleDismiss} className="flex-1 text-xs">
                Não instalar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
