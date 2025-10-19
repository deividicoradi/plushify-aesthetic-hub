import { supabase } from '@/integrations/supabase/client';

export class WhatsAppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number
  ) {
    super(message);
    this.name = 'WhatsAppError';
  }
}

/**
 * WPPConnect Client - Handles communication with WPPConnect server via Edge Functions
 */
class WPPConnectClient {
  /**
   * Start/connect WhatsApp session
   */
  async connect(): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('sessao-de-whatsapp', {
        method: 'POST'
      });

      if (error) throw error;
      
      if (!data) {
        throw new WhatsAppError('No data received from server', 'NO_DATA');
      }

      return {
        success: data.success || false,
        connected: data.session?.status === 'conectado',
        qr_code: data.session?.qr_code,
        message: data.message,
        session: data.session
      };
    } catch (error: any) {
      console.error('WPPConnect connect error:', error);
      throw new WhatsAppError(
        error.message || 'Erro ao conectar WhatsApp',
        'CONNECTION_ERROR',
        error.status
      );
    }
  }

  /**
   * Disconnect WhatsApp session
   */
  async disconnect(): Promise<any> {
    try {
      // Update local session status to disconnected
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await (supabase
          .from('whatsapp_sessions' as any)
          .update({ 
            status: 'desconectado',
            qr_code: null,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id) as any);
      }

      return {
        success: true,
        message: 'WhatsApp desconectado com sucesso'
      };
    } catch (error: any) {
      console.error('WPPConnect disconnect error:', error);
      throw new WhatsAppError(
        error.message || 'Erro ao desconectar WhatsApp',
        'DISCONNECTION_ERROR',
        error.status
      );
    }
  }

  /**
   * Get session status from database
   */
  async getStatus(): Promise<any> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new WhatsAppError('User not authenticated', 'AUTH_REQUIRED');
      }

      // Direct query with type assertion to bypass type checking
      const response = await supabase
        .from('whatsapp_sessions' as any)
        .select('*')
        .eq('user_id', user.id)
        .single();

      const session = response.data as any;
      const error = response.error;

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
        throw error;
      }

      return {
        connected: session?.status === 'conectado',
        session: session || null,
        status: session?.status || 'desconectado'
      };
    } catch (error: any) {
      console.error('WPPConnect get status error:', error);
      throw new WhatsAppError(
        error.message || 'Erro ao obter status',
        'STATUS_ERROR',
        error.status
      );
    }
  }

  /**
   * Send text message
   */
  async sendMessage(phone: string, message: string, contactName?: string): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('enviar-mensagem-whatsapp', {
        method: 'POST',
        body: {
          phone,
          message,
          contactName
        }
      });

      if (error) throw error;
      
      if (!data || !data.success) {
        throw new WhatsAppError(
          data?.error || 'Erro ao enviar mensagem',
          'SEND_ERROR',
          data?.status
        );
      }

      return {
        success: true,
        message: data.message,
        data: data.data
      };
    } catch (error: any) {
      console.error('WPPConnect send message error:', error);
      
      // Handle specific error cases
      if (error.message?.includes('não conectado')) {
        throw new WhatsAppError(
          'WhatsApp não conectado. Por favor, conecte primeiro.',
          'NOT_CONNECTED',
          409
        );
      }
      
      throw new WhatsAppError(
        error.message || 'Erro ao enviar mensagem',
        'SEND_ERROR',
        error.status
      );
    }
  }
}

// Export singleton instance
export const wppConnectClient = new WPPConnectClient();
