import { WhatsAppStatusBadge } from '@/components/whatsapp/WhatsAppStatusBadge';
import { useWhatsAppIntegration } from '@/hooks/useWhatsAppIntegration';

export const WhatsAppStatusIndicator = () => {
  const { session } = useWhatsAppIntegration();
  
  return <WhatsAppStatusBadge session={session} className="ml-2" />;
};