import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WhatsAppBusinessModal } from './WhatsAppBusinessModal';
import { useWhatsAppIntegration } from '@/hooks/useWhatsAppIntegration';

export const WhatsAppHeaderButton = () => {
  const { session } = useWhatsAppIntegration();

  const getStatusColor = () => {
    switch (session.status) {
      case 'conectado':
        return 'bg-green-500';
      case 'pareando':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <WhatsAppBusinessModal
      trigger={
        <Button variant="ghost" size="sm" className="relative">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className={`w-8 h-8 ${getStatusColor()} rounded-full flex items-center justify-center`}>
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              {/* Status indicator dot */}
              <div 
                className={`absolute -top-1 -right-1 w-3 h-3 ${getStatusColor()} border-2 border-white rounded-full`}
              />
            </div>
            <span className="hidden sm:inline text-sm font-medium">WhatsApp</span>
          </div>
        </Button>
      }
    />
  );
};