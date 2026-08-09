import { MessageCircle } from "lucide-react";

const WHATSAPP_URL =
  "https://wa.me/5549988734549?text=Ol%C3%A1!%20Vi%20sobre%20o%20Plushify%20e%20tenho%20interesse%20em%20conhecer%20melhor%20o%20sistema.%20Poderia%20me%20passar%20mais%20informa%C3%A7%C3%B5es%3F";

export const WhatsAppFloatingButton = () => {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com a gente no WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:scale-105 transition-all"
    >
      <MessageCircle className="w-7 h-7" />
    </a>
  );
};
