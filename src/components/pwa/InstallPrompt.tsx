
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export const InstallPrompt: React.FC = () => {
  const { isInstallable, installApp } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  if (!isInstallable || dismissed) return null;

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      console.log('App instalado com sucesso!');
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80 bg-card/95 backdrop-blur-sm border-border/50 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
              <img 
                src="/favicon.svg" 
                alt="Plushify Logo" 
                className="w-5 h-5"
                onError={(e) => {
                  // Fallback para texto se a imagem não carregar
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<span class="text-white font-bold text-sm">P</span>';
                }}
              />
            </div>
            <CardTitle className="text-lg">Instalar Plushify</CardTitle>
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
        <CardDescription>
          Instale o Plushify no seu dispositivo para acesso rápido e experiência nativa
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Smartphone className="h-4 w-4" />
            <span>Mobile</span>
          </div>
          <div className="flex items-center gap-1">
            <Monitor className="h-4 w-4" />
            <span>Desktop</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleInstall} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Instalar App
          </Button>
          <Button variant="outline" onClick={handleDismiss}>
            Agora não
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
