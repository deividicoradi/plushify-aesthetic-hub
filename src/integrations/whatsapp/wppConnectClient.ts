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
      // Get current session to send JWT token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new WhatsAppError('Usuário não autenticado. Faça login novamente.', 'AUTH_REQUIRED', 401);
      }

      const { data, error } = await supabase.functions.invoke('sessao-de-whatsapp', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
        body: { user_id: session.user.id }
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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new WhatsAppError('Usuário não autenticado', 'AUTH_REQUIRED', 401);
      }

      const { data, error } = await supabase.functions.invoke('whatsapp-disconnect', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      return {
        success: true,
        message: data?.message || 'WhatsApp desconectado com sucesso'
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
   * Get session status from database (with polling via Edge Function)
   */
  async getStatus(): Promise<any> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        return {
          connected: false,
          status: 'desconectado',
          session: null
        };
      }

      const { data, error } = await supabase.functions.invoke('whatsapp-status', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error || !data) {
        // Fallback to database if Edge Function fails
        const response = await supabase
          .from('whatsapp_sessions' as any)
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        const dbSession = response.data as any;
        
        return {
          connected: dbSession?.status === 'conectado',
          session: dbSession || null,
          status: dbSession?.status || 'desconectado'
        };
      }

      return {
        connected: data.status === 'conectado',
        status: data.status,
        qrcode: data.qrcode,
        session: data
      };
    } catch (error: any) {
      console.error('WPPConnect get status error:', error);
      return {
        connected: false,
        status: 'desconectado',
        session: null
      };
    }
  }

  /**
   * Send text message
   */
  async sendMessage(phone: string, message: string, contactName?: string): Promise<any> {
    try {
      // Get current session to send JWT token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new WhatsAppError('Usuário não autenticado. Faça login novamente.', 'AUTH_REQUIRED', 401);
      }

      const { data, error } = await supabase.functions.invoke('enviar-mensagem-whatsapp', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
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
