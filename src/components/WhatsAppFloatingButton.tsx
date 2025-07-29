import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const WhatsAppFloatingButton: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/5549999150421?text=Ol%C3%A1!%20Vi%20sobre%20o%20Plushify%20e%20tenho%20interesse%20em%20conhecer%20melhor%20o%20sistema.%20Poderia%20me%20passar%20mais%20informa%C3%A7%C3%B5es%3F', '_blank');
    setShowTooltip(false);
  };

  const toggleTooltip = () => {
    setShowTooltip(!showTooltip);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Tooltip/Popup */}
      {showTooltip && (
        <div className="absolute bottom-16 right-0 mb-2 animate-in slide-in-from-bottom-2 duration-200">
          <Card className="w-80 max-w-[calc(100vw-3rem)] bg-background/95 backdrop-blur-sm border shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">Atendimento WhatsApp</p>
                    <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Online agora</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTooltip}
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                Fale conosco pelo WhatsApp – Resposta rápida garantida!
              </p>
              
              <Button 
                onClick={handleWhatsAppClick}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
                size="sm"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Chamar no WhatsApp
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Floating Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={toggleTooltip}
              size="icon"
              className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 group"
              aria-label="Abrir atendimento WhatsApp"
            >
              <MessageCircle className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-200" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="bg-background border shadow-md">
            <p className="text-sm">Fale conosco</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};