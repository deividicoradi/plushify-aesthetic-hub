// Legacy hook - now using REST API
import { 
  useWhatsAppRESTAPI,
  type WhatsAppContact,
  type WhatsAppMessage,
  type WhatsAppSession
} from './useWhatsAppRESTAPI';

// Re-export the REST API hook as the legacy useWhatsApp
export const useWhatsApp = useWhatsAppRESTAPI;

// Re-export types
export type { WhatsAppContact, WhatsAppMessage, WhatsAppSession };