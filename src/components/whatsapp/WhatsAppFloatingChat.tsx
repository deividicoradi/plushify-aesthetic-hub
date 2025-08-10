import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { WhatsAppConnectionPanel } from './WhatsAppConnectionPanel';
import { WhatsAppChatInterface } from './WhatsAppChatInterface';
import { useWhatsApp } from '@/hooks/useWhatsApp';

export const WhatsAppFloatingChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { session } = useWhatsApp();

  const getStatusColor = () => {
    switch (session.status) {
      case 'conectado':
        return 'bg-green-500';
      case 'conectando':
      case 'pareando':
        return 'bg-yellow-500';
      default:
        return 'bg-red-500';
    }
  };

  const getStatusText = () => {
    switch (session.status) {
      case 'conectado':
        return 'WhatsApp Conectado';
      case 'conectando':
        return 'Conectando...';
      case 'pareando':
        return 'Pareando dispositivo';
      default:
        return 'WhatsApp Desconectado';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 relative group bg-green-500 hover:bg-green-600"
            aria-label="Abrir WhatsApp Chat"
          >
            <MessageCircle className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-200" />
            
            {/* Indicador de status */}
            <div
              className={`absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-3.5 h-3.5 rounded-full ${getStatusColor()} ring-2 ring-background ${session.status === 'pareando' ? 'animate-pulse' : ''}`}
              aria-live="polite"
              aria-label={getStatusText()}
            />
          </Button>
        </SheetTrigger>

        <SheetContent side="right" className="w-full sm:w-[500px] p-0 flex flex-col h-full">
          <SheetHeader className="p-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-lg font-semibold">WhatsApp</div>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${session.status === 'conectado' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'}`}
                  >
                    {getStatusText()}
                  </Badge>
                </div>
              </SheetTitle>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          <div className="flex-1 flex flex-col">
            {session.status === 'conectado' ? (
              <WhatsAppChatInterface />
            ) : (
              <WhatsAppConnectionPanel />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};