// Legacy hook - maintained for backward compatibility
import { 
  useWhatsAppIntegration,
  type WhatsAppContact,
  type WhatsAppMessage,
  type WhatsAppSession
} from './useWhatsAppIntegration';

// Re-export the integration hook as the legacy useWhatsApp
export const useWhatsApp = useWhatsAppIntegration;

// Re-export types
export type { WhatsAppContact, WhatsAppMessage, WhatsAppSession };