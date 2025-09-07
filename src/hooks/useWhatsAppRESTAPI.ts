import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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
  qr_code?: string;
  last_activity?: string;
  expires_at?: string;
  server_url?: string;
  created_at?: string;
}

export interface WhatsAppStats {
  total_contacts: number;
  messages_sent: number;
  messages_received: number;
  last_activity: string | null;
  response_rate: number;
}

export interface WhatsAppError {
  type: 'auth' | 'network' | 'server' | 'unknown';
  message: string;
  code?: number;
}

const WHATSAPP_API_URL = 'https://wmoylybbwikkqbxiqwbq.supabase.co/functions/v1/whatsapp-api';

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

  // Make authenticated request to API
  const makeAPIRequest = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const supabaseSession = await supabase.auth.getSession();
    const token = supabaseSession.data.session?.access_token;
    
    if (!token) {
      throw new Error('Token de acesso não encontrado');
    }

    const response = await fetch(`${WHATSAPP_API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
  }, [user]);

  // POST /whatsapp/connect
  const connectWhatsApp = useCallback(async () => {
    if (!user) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Connecting to WhatsApp...');
      
      const response = await makeAPIRequest('/connect', {
        method: 'POST'
      });

      if (response.success) {
        setSession({
          id: response.session.id,
          session_id: response.session.session_id,
          status: response.session.status,
          qr_code: response.session.qr_code,
          expires_at: response.session.expires_at
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
      const errorObj: WhatsAppError = {
        type: 'server',
        message: error instanceof Error ? error.message : 'Erro ao conectar'
      };
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
      
      const response = await makeAPIRequest('/disconnect', {
        method: 'POST'
      });

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
      const errorObj: WhatsAppError = {
        type: 'server',
        message: error instanceof Error ? error.message : 'Erro ao desconectar'
      };
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
      const response = await makeAPIRequest('/status');
      
      setSession(prevSession => ({
        ...prevSession,
        status: response.status,
        session_id: response.session_id,
        qr_code: response.qr_code,
        last_activity: response.last_activity,
        expires_at: response.expires_at,
        server_url: response.server_url,
        created_at: response.created_at
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
      
      const response = await makeAPIRequest('/send-message', {
        method: 'POST',
        body: JSON.stringify({
          phone,
          message,
          contact_name: contactName
        })
      });

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
      const errorObj: WhatsAppError = {
        type: 'server',
        message: error instanceof Error ? error.message : 'Erro ao enviar mensagem'
      };
      setError(errorObj);
      
      toast({
        title: "Erro ao Enviar",
        description: errorObj.message,
        variant: "destructive",
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, makeAPIRequest, toast]);

  // GET /whatsapp/stats
  const loadStats = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await makeAPIRequest('/stats');
      setStats(response);
    } catch (error) {
      console.error('Load stats error:', error);
    }
  }, [user, makeAPIRequest]);

  // GET /whatsapp/messages
  const loadMessages = useCallback(async (contactPhone?: string, limit = 50, offset = 0) => {
    if (!user) return;
    
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString()
      });
      
      if (contactPhone) {
        params.append('contact_phone', contactPhone);
      }
      
      const response = await makeAPIRequest(`/messages?${params}`);
      setMessages(response.messages || []);
    } catch (error) {
      console.error('Load messages error:', error);
    }
  }, [user, makeAPIRequest]);

  // GET /whatsapp/contacts
  const loadContacts = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await makeAPIRequest('/contacts');
      setContacts(response.contacts || []);
    } catch (error) {
      console.error('Load contacts error:', error);
    }
  }, [user, makeAPIRequest]);

  // Start status polling
  const startStatusPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    
    pollIntervalRef.current = setInterval(() => {
      getSessionStatus();
    }, 5000); // Poll every 5 seconds
  }, [getSessionStatus]);

  // Setup realtime subscriptions
  useEffect(() => {
    if (!user) return;

    console.log('Setting up realtime subscriptions for user:', user.id);

    // Subscribe to session changes
    const sessionChannel = supabase
      .channel('whatsapp_sessions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whatsapp_sessions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Session change received:', payload);
          if (payload.new) {
            const newData = payload.new as any;
            setSession(prevSession => ({
              ...prevSession,
              status: newData.status,
              qr_code: newData.qr_code,
              last_activity: newData.last_activity
            }));
          }
        }
      )
      .subscribe();

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel('whatsapp_messages_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'whatsapp_messages',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New message received:', payload);
          if (payload.new) {
            setMessages(prev => [payload.new as WhatsAppMessage, ...prev]);
            loadStats(); // Update stats when new message arrives
          }
        }
      )
      .subscribe();

    // Subscribe to stats changes
    const statsChannel = supabase
      .channel('whatsapp_stats_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whatsapp_session_stats',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Stats change received:', payload);
          if (payload.new) {
            const newData = payload.new as any;
            setStats(prev => ({
              ...prev,
              total_contacts: newData.total_contacts,
              messages_sent: newData.messages_sent,
              messages_received: newData.messages_received,
              last_activity: newData.last_activity
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionChannel);
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(statsChannel);
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