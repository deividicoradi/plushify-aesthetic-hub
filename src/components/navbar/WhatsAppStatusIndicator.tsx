import { WhatsAppStatusBadge } from '@/components/whatsapp/WhatsAppStatusBadge';
import { useWhatsAppRESTAPI } from '@/hooks/useWhatsAppRESTAPI';

export const WhatsAppStatusIndicator = () => {
  const { session } = useWhatsAppRESTAPI();
  
  return <WhatsAppStatusBadge session={session} className="ml-2" />;
};