import { supabase } from '@/integrations/supabase/client';

// Rate limiting for WhatsApp API
const rateLimiter = {
  requests: new Map<string, number[]>(),
  maxRequests: 10,
  windowMs: 60000, // 1 minute
  
  canMakeRequest(endpoint: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(endpoint)) {
      this.requests.set(endpoint, []);
    }
    
    const timestamps = this.requests.get(endpoint)!;
    const validTimestamps = timestamps.filter(ts => ts > windowStart);
    
    this.requests.set(endpoint, validTimestamps);
    
    return validTimestamps.length < this.maxRequests;
  },
  
  recordRequest(endpoint: string): void {
    const now = Date.now();
    if (!this.requests.has(endpoint)) {
      this.requests.set(endpoint, []);
    }
    this.requests.get(endpoint)!.push(now);
  }
};

// WhatsApp-specific error handling
export class WhatsAppError extends Error {
  constructor(
    message: string,
    public readonly code: string = 'WHATSAPP_ERROR',
    public readonly status?: number
  ) {
    super(message);
    this.name = 'WhatsAppError';
  }
}

// Isolated WhatsApp client
export class WhatsAppClient {
  private baseUrl = 'https://wmoylybbwikkqbxiqwbq.supabase.co/functions/v1/whatsapp-api';
  
  async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    // Check rate limit
    if (!rateLimiter.canMakeRequest(endpoint)) {
      throw new WhatsAppError(
        'Muitas requisições para WhatsApp. Tente novamente em 60 segundos.',
        'RATE_LIMIT_EXCEEDED',
        429
      );
    }
    
    const supabaseSession = await supabase.auth.getSession();
    const token = supabaseSession.data.session?.access_token;
    
    if (!token) {
      throw new WhatsAppError(
        'Token de acesso não encontrado. Faça login novamente.',
        'AUTH_REQUIRED',
        401
      );
    }
    
    try {
      rateLimiter.recordRequest(endpoint);
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });
      
      if (response.status === 429) {
        throw new WhatsAppError(
          'Limite de requisições atingido. Aguarde 60 segundos.',
          'RATE_LIMIT_EXCEEDED',
          429
        );
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new WhatsAppError(
          `Erro do servidor WhatsApp: ${errorText}`,
          'SERVER_ERROR',
          response.status
        );
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof WhatsAppError) {
        throw error;
      }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new WhatsAppError(
          'Erro de conexão com WhatsApp. Verifique sua internet.',
          'NETWORK_ERROR'
        );
      }
      
      throw new WhatsAppError(
        'Erro desconhecido no WhatsApp',
        'UNKNOWN_ERROR'
      );
    }
  }
  
  async connect(): Promise<any> {
    return this.makeRequest('/connect', { method: 'POST' });
  }
  
  async disconnect(): Promise<any> {
    return this.makeRequest('/disconnect', { method: 'POST' });
  }
  
  async getStatus(): Promise<any> {
    return this.makeRequest('/status');
  }
  
  async sendMessage(phone: string, message: string, contactName?: string): Promise<any> {
    return this.makeRequest('/send-message', {
      method: 'POST',
      body: JSON.stringify({ phone, message, contact_name: contactName })
    });
  }
  
  async getMessages(contactPhone?: string, limit = 50, offset = 0): Promise<any> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });
    
    if (contactPhone) {
      params.append('contact_phone', contactPhone);
    }
    
    return this.makeRequest(`/messages?${params}`);
  }
  
  async getContacts(): Promise<any> {
    return this.makeRequest('/contacts');
  }
  
  async getStats(): Promise<any> {
    return this.makeRequest('/stats');
  }
}

// Singleton instance
export const whatsappClient = new WhatsAppClient();