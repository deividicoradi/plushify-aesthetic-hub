import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { whatsappClient, WhatsAppError } from '@/integrations/whatsapp/client';

export interface WhatsAppContact {
  id: string;
  nome: string;
  telefone: string;
  ultima_interacao: string | null;
  cliente_id: string | null;
}

export interface WhatsAppMessage {
  id: string;
  user_id: string;
  session_id: string;
  direction: 'sent' | 'received';
  content: string;
  status: 'pending' | 'delivered' | 'failed' | 'read';
  timestamp: string;
  contact_phone?: string;
  contact_name?: string;
  created_at: string;
}

export interface WhatsAppSession {
  id: string | null;
  session_id?: string;
  status: 'conectado' | 'desconectado' | 'pareando' | 'conectando' | 'expirado';
  last_activity?: string;
  expires_at?: string;
  created_at?: string;
  account_id?: string;
  phone_number_id?: string;
}

export interface WhatsAppStats {
  total_contacts: number;
  messages_sent: number;
  messages_received: number;
  last_activity: string | null;
  response_rate: number;
}

// WhatsAppError moved to client

// Using isolated WhatsApp client

export const useWhatsAppRESTAPI = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [session, setSession] = useState<WhatsAppSession>({
    id: null,
    status: 'desconectado'
  });
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [stats, setStats] = useState<WhatsAppStats>({
    total_contacts: 0,
    messages_sent: 0,
    messages_received: 0,
    last_activity: null,
    response_rate: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<WhatsAppError | null>(null);
  
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Clear error helper
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Use isolated WhatsApp client with error handling
  const makeAPIRequest = useCallback(async (method: keyof typeof whatsappClient, ...args: any[]) => {
    if (!user) {
      throw new WhatsAppError('Usuário não autenticado', 'AUTH_REQUIRED');
    }

    try {
      return await (whatsappClient[method] as any)(...args);
    } catch (error) {
      if (error instanceof WhatsAppError) {
        throw error;
      }
      throw new WhatsAppError('Erro inesperado no WhatsApp', 'UNKNOWN_ERROR');
    }
  }, [user]);

  // POST /whatsapp/connect
  const connectWhatsApp = useCallback(async () => {
    if (!user) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Connecting to WhatsApp...');
      
      const response = await makeAPIRequest('connect');

      if (response.success && response.connected) {
        setSession({
          id: response.account?.id || null,
          session_id: response.account?.id,
          status: 'conectado',
          account_id: response.account?.id,
          phone_number_id: response.account?.phone_number_id,
          created_at: response.account?.created_at
        });

        toast({
          title: "Conexão Iniciada",
          description: response.message,
        });

        // Start polling for status updates
        startStatusPolling();
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Connect error:', error);
      const errorObj = error instanceof WhatsAppError ? error : new WhatsAppError('Erro ao conectar');
      setError(errorObj);
      
      toast({
        title: "Erro de Conexão",
        description: errorObj.message,
        variant: "destructive",
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, makeAPIRequest, toast]);

  // POST /whatsapp/disconnect
  const disconnectWhatsApp = useCallback(async () => {
    if (!user) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Disconnecting from WhatsApp...');
      
      const response = await makeAPIRequest('disconnect');

      if (response.success) {
        setSession({
          id: null,
          status: 'desconectado'
        });
        
        // Stop polling
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }

        toast({
          title: "WhatsApp Desconectado",
          description: response.message,
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Disconnect error:', error);
      const errorObj = error instanceof WhatsAppError ? error : new WhatsAppError('Erro ao desconectar');
      setError(errorObj);
      
      toast({
        title: "Erro de Desconexão", 
        description: errorObj.message,
        variant: "destructive",
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, makeAPIRequest, toast]);

  // GET /whatsapp/status
  const getSessionStatus = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await makeAPIRequest('getStatus');
      
      setSession(prevSession => ({
        ...prevSession,
        status: response.connected ? 'conectado' : 'desconectado',
        session_id: response.account?.id,
        account_id: response.account?.id,
        phone_number_id: response.account?.phone_number_id,
        last_activity: response.account?.updated_at,
        created_at: response.account?.created_at
      }));
      
    } catch (error) {
      console.error('Get status error:', error);
    }
  }, [user, makeAPIRequest]);

  // POST /whatsapp/send-message
  const sendMessage = useCallback(async (phone: string, message: string, contactName?: string) => {
    if (!user) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Sending message to:', phone);
      
      const response = await makeAPIRequest('sendMessage', phone, message, contactName);

      if (response.success) {
        toast({
          title: "Mensagem Enviada",
          description: `Mensagem enviada para ${phone}`,
        });
        
        // Reload messages and stats
        await Promise.all([
          loadMessages(),
          loadStats()
        ]);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Send message error:', error);
      const errorObj = error instanceof WhatsAppError ? error : new WhatsAppError('Erro ao enviar mensagem');
      setError(errorObj);
      
      // Only show toast if it's not a rate limit error (user should see the specific WhatsApp error)
      if (errorObj.status !== 429) {
        toast({
          title: "Erro ao Enviar",
          description: errorObj.message,
          variant: "destructive",
        });
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, makeAPIRequest, toast]);

  // GET /whatsapp/stats
  const loadStats = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await makeAPIRequest('getStats');
      setStats(response);
    } catch (error) {
      console.error('Load stats error:', error);
    }
  }, [user, makeAPIRequest]);

  // GET /whatsapp/messages
  const loadMessages = useCallback(async (contactPhone?: string, limit = 50, offset = 0) => {
    if (!user) return;
    
    try {
      const response = await makeAPIRequest('getMessages', contactPhone, limit, offset);
      setMessages(response.messages || []);
    } catch (error) {
      console.error('Load messages error:', error);
    }
  }, [user, makeAPIRequest]);

  // GET /whatsapp/contacts
  const loadContacts = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await makeAPIRequest('getContacts');
      setContacts(response.contacts || []);
    } catch (error) {
      console.error('Load contacts error:', error);
    }
  }, [user, makeAPIRequest]);

  // Start status polling with exponential backoff
  const startStatusPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    
    // Only poll if session is in connecting or pairing state
    if (session.status === 'conectando' || session.status === 'pareando') {
      pollIntervalRef.current = setInterval(() => {
        getSessionStatus();
      }, 10000); // Poll every 10 seconds instead of 5
    }
  }, [getSessionStatus, session.status]);

  // Setup realtime subscriptions with debouncing
  useEffect(() => {
    if (!user) return;

    let debounceTimeout: NodeJS.Timeout;
    const debouncedStatsLoad = () => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        loadStats();
      }, 2000);
    };

    // Subscribe to WhatsApp account changes
    const sessionChannel = supabase
      .channel(`wa_accounts_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'wa_accounts',
          filter: `tenant_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.new) {
            const newData = payload.new as any;
            setSession(prevSession => ({
              ...prevSession,
              status: newData.status === 'active' ? 'conectado' : 'desconectado',
              account_id: newData.id,
              phone_number_id: newData.phone_number_id,
              last_activity: newData.updated_at
            }));

            // Stop polling if session is connected
            if (newData.status === 'active' && pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
          }
        }
      )
      .subscribe();

    // Subscribe to new messages (debounced)
    const messagesChannel = supabase
      .channel(`wa_messages_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'wa_messages',
          filter: `tenant_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.new) {
            setMessages(prev => [payload.new as WhatsAppMessage, ...prev]);
            debouncedStatsLoad();
          }
        }
      )
      .subscribe();

    return () => {
      clearTimeout(debounceTimeout);
      supabase.removeChannel(sessionChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [user, loadStats]);

  // Initialize data on user login
  useEffect(() => {
    if (user) {
      Promise.all([
        getSessionStatus(),
        loadStats(),
        loadMessages(),
        loadContacts()
      ]);
    } else {
      // Reset state on logout
      setSession({ id: null, status: 'desconectado' });
      setMessages([]);
      setContacts([]);
      setStats({
        total_contacts: 0,
        messages_sent: 0,
        messages_received: 0,
        last_activity: null,
        response_rate: 0
      });
    }
  }, [user, getSessionStatus, loadStats, loadMessages, loadContacts]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // State
    session,
    messages,
    contacts,
    stats,
    loading,
    error,
    
    // Actions
    connectWhatsApp,
    disconnectWhatsApp,
    sendMessage,
    loadMessages,
    loadContacts,
    loadStats,
    getSessionStatus,
    clearError
  };
};