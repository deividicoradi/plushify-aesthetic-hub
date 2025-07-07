import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, X, PhoneCall } from 'lucide-react';

export const WhatsAppPopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Verificar se o popup foi dispensado antes
    const dismissed = localStorage.getItem('whatsapp-popup-dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Mostrar popup após 5 segundos
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/5549999150421?text=Ol%C3%A1!%20Vi%20sobre%20o%20Plushify%20e%20tenho%20interesse%20em%20conhecer%20melhor%20o%20sistema.%20Poderia%20me%20passar%20mais%20informa%C3%A7%C3%B5es%3F', '_blank');
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('whatsapp-popup-dismissed', 'true');
  };

  const handleRemindLater = () => {
    setIsVisible(false);
    // Lembrar novamente em 1 hora
    const oneHourLater = new Date();
    oneHourLater.setHours(oneHourLater.getHours() + 1);
    localStorage.setItem('whatsapp-popup-remind-date', oneHourLater.toISOString());
  };

  // Não mostrar se foi dispensado ou não está visível
  if (isDismissed || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 max-w-sm animate-in slide-in-from-left-2 duration-500">
      <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800 shadow-2xl backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg text-foreground">Fale Conosco</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Tire suas dúvidas pelo WhatsApp
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
            <p className="mb-2">💬 Olá! Precisa de ajuda?</p>
            <p>Nossa equipe está pronta para esclarecer suas dúvidas sobre o <span className="font-semibold text-primary">Plushify</span>.</p>
          </div>

          <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Online agora</span>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleWhatsAppClick} 
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              <PhoneCall className="h-4 w-4 mr-2" />
              Chamar no WhatsApp
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRemindLater} className="flex-1 text-xs">
                Lembrar depois
              </Button>
              <Button variant="ghost" onClick={handleDismiss} className="flex-1 text-xs">
                Não mostrar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};