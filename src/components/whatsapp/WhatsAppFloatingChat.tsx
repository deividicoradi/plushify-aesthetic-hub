import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const WhatsAppFloatingChat: React.FC = () => {
  const supportNumber = "5549999150421"; // Número de suporte
  
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("Olá! Preciso de ajuda com o Plushify.");
    const phone = supportNumber;
    const isMobile = /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);

    const mobileDeepLink = `whatsapp://send?phone=${phone}&text=${message}`;
    const desktopWebLink = `https://web.whatsapp.com/send?phone=${phone}&text=${message}`;
    const waMeFallback = `https://wa.me/${phone}?text=${message}`;

    // Prefer deep link on mobile, Web WhatsApp on desktop; fall back to wa.me
    const targetUrl = isMobile ? mobileDeepLink : desktopWebLink;
    try {
      window.location.href = targetUrl;
    } catch (e) {
      window.location.href = waMeFallback;
    }
  };
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={handleWhatsAppClick}
        size="icon"
        className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 group bg-green-500 hover:bg-green-600"
        aria-label="Entrar em contato via WhatsApp"
      >
        <MessageCircle className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-200" />
      </Button>
    </div>
  );
};