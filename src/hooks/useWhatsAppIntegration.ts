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
  contato_id: string;
  direcao: 'enviada' | 'recebida';
  conteudo: string;
  tipo: string;
  status: string;
  horario: string;
  whatsapp_contatos?: WhatsAppContact;
}

export interface WhatsAppSession {
  id: string | null;
  status: 'conectado' | 'desconectado' | 'pareando' | 'conectando';
  qrCode?: string;
  ready?: boolean;
}

export interface WhatsAppError {
  type: 'auth' | 'network' | 'server' | 'unknown';
  message: string;
  code?: number;
}

const WHATSAPP_SERVER_URL = 'http://31.97.30.241:8787';

export const useWhatsAppIntegration = () => {
  const { user } = useAuth();
  const [session, setSession] = useState<WhatsAppSession>({
    id: null,
    status: 'desconectado'
  });
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<WhatsAppError | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const { toast } = useToast();
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const qrIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup intervals
  const clearIntervals = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (qrIntervalRef.current) {
      clearInterval(qrIntervalRef.current);
      qrIntervalRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Get access token for server requests
  const getAccessToken = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  }, []);

  // Error handler with retry logic
  const handleError = useCallback((error: any, context: string) => {
    console.error(`WhatsApp ${context} error:`, error);
    
    let errorType: WhatsAppError['type'] = 'unknown';
    let message = error.message || 'Erro desconhecido';
    
    if (error.message?.includes('401') || error.message?.includes('403')) {
      errorType = 'auth';
      message = 'Sessão expirada. Faça login novamente.';
    } else if (error.message?.includes('5')) {
      errorType = 'server';
      message = 'Serviço temporariamente indisponível. Tente outra vez.';
    } else if (error.message?.includes('timeout') || error.message?.includes('network')) {
      errorType = 'network';
      message = 'Sem resposta do servidor. Verifique sua internet e tente de novo.';
    }

    setError({ type: errorType, message, code: error.status });
    
    if (errorType === 'auth') {
      // Redirect to login or show re-auth modal
      toast({
        title: "Sessão Expirada",
        description: message,
        variant: "destructive"
      });
    } else if (retryCount < 3 && errorType === 'network') {
      setRetryCount(prev => prev + 1);
    } else {
      toast({
        title: "Erro",
        description: message,
        variant: "destructive"
      });
    }
  }, [toast, retryCount]);

  // Get session status with proper error handling
  const getSessionStatus = useCallback(async (signal?: AbortSignal) => {
    // Don't make requests if user is not authenticated
    if (!user) {
      setSession({ id: null, status: 'desconectado' });
      return;
    }

    try {
      console.log('🔄 Fazendo requisição para WhatsApp edge function...');
      const { data, error } = await supabase.functions.invoke('whatsapp-manager', {
        method: 'GET'
      });

      console.log('📡 Resposta da edge function:', { data, error });

      if (error) {
        console.error('❌ Erro na edge function:', error);
        throw new Error(error.message);
      }

      console.log('✅ Status recebido:', data?.status);
      
      setSession(prev => ({
        ...prev,
        status: data.status || 'desconectado',
        id: data.sessionId || prev.id,
        ready: data.ready || false,
        qrCode: data.qrCode || prev.qrCode
      }));

      setError(null);
      setRetryCount(0);

      // Telemetry
      if (data.status === 'conectado') {
        console.log('whatsapp_status_connected');
      } else if (data.status === 'pareando') {
        console.log('whatsapp_status_pairing');
      }

      return data;
    } catch (error: any) {
      if (!signal?.aborted) {
        handleError(error, 'status check');
      }
      throw error;
    }
  }, [handleError, user]);

  // Get QR code from server
  const getQRCode = useCallback(async (signal?: AbortSignal) => {
    // Don't make requests if user is not authenticated
    if (!user) return;

    try {
      console.log('Requesting QR Code from server');
      const { data, error } = await supabase.functions.invoke('whatsapp-manager', {
        body: { action: 'get-qr' }
      });

      if (error) {
        console.error('QR code request error:', error);
        throw new Error(error.message);
      }

      if (signal?.aborted) return null;

      console.log('QR Code response:', data);

      if (data?.qrCode) {
        setSession(prev => ({
          ...prev,
          qrCode: data.qrCode
        }));
        console.log('QR Code updated in session');
      } else {
        console.warn('No QR Code received from server');
      }

      return data;
    } catch (error: any) {
      if (!signal?.aborted) {
        console.error('QR fetch failed:', error.message);
        handleError(error, 'QR code fetch');
      }
      return null;
    }
  }, [user, handleError]);

  // Connect WhatsApp with proper server communication
  const connectWhatsApp = useCallback(async () => {
    // Don't allow connection if user is not authenticated
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para conectar o WhatsApp",
        variant: "destructive"
      });
      return;
    }

    if (loading) return;
    
    setLoading(true);
    setError(null);
    clearIntervals();
    
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      console.log('🚀 Tentando conectar WhatsApp...');
      console.log('whatsapp_connect_clicked');
      
      const { data, error } = await supabase.functions.invoke('whatsapp-manager', {
        body: { action: 'connect' }
      });

      console.log('📱 Resposta da conexão:', { data, error });

      if (error) {
        console.error('❌ Erro ao conectar:', error);
        throw new Error(error.message);
      }

      if (data?.success) {
        setSession({
          id: data.sessionId ?? null,
          status: data.status || 'pareando',
          qrCode: data.qrCode
        });

        if (data.status === 'conectado') {
          toast({
            title: "WhatsApp Conectado",
            description: "Conectado com sucesso"
          });
        } else if (data.status === 'pareando') {
          toast({
            title: "QR Code Gerado",
            description: "Escaneie o QR Code com seu WhatsApp para conectar"
          });
          
          // Start polling for status updates every 4 seconds
          pollIntervalRef.current = setInterval(async () => {
            try {
              const status = await getSessionStatus(controller.signal);
              if (status?.status === 'conectado') {
                clearIntervals();
                toast({
                  title: "WhatsApp Conectado",
                  description: "Conectado com sucesso"
                });
              }
            } catch (error) {
              // Ignore polling errors unless it's 3+ failures
              if (retryCount >= 3) {
                clearIntervals();
              }
            }
          }, 4000);

          // Start QR code refresh polling every 6 seconds
          qrIntervalRef.current = setInterval(() => {
            getQRCode(controller.signal);
          }, 6000);

          // Initial QR fetch after a short delay
          setTimeout(() => {
            getQRCode(controller.signal);
          }, 1000);

          // Clear polling after 2 minutes
          setTimeout(() => {
            clearIntervals();
          }, 120000);
        }
      } else {
        throw new Error(data?.error || 'Falha ao conectar');
      }
    } catch (error: any) {
      handleError(error, 'connection');
    } finally {
      setLoading(false);
    }
  }, [loading, toast, getSessionStatus, getQRCode, handleError, retryCount, clearIntervals, user]);

  // Disconnect WhatsApp
  const disconnectWhatsApp = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    clearIntervals();
    
    try {
      const { error } = await supabase.functions.invoke('whatsapp-manager', {
        body: { action: 'disconnect' }
      });

      if (error) {
        console.warn('Disconnect error (non-critical):', error.message);
      }

      setSession({
        id: null,
        status: 'desconectado',
        qrCode: undefined
      });

      toast({
        title: "WhatsApp Desconectado",
        description: "Sessão encerrada com sucesso"
      });
    } catch (error: any) {
      console.warn('Disconnect failed (non-critical):', error);
      // Force local disconnect even if server call fails
      setSession({
        id: null,
        status: 'desconectado',
        qrCode: undefined
      });
    } finally {
      setLoading(false);
    }
  }, [toast, clearIntervals, user]);

  // Load messages with pagination support
  const loadMessages = useCallback(async (contactId?: string, limit = 50) => {
    if (!user) return;
    
    try {
      const path = contactId ? `messages?contactId=${contactId}&limit=${limit}` : `messages?limit=${limit}`;
      
      const { data, error } = await supabase.functions.invoke('whatsapp-manager', {
        method: 'GET',
        headers: {
          'X-Request-Path': path
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      setMessages(data.messages || []);
    } catch (error: any) {
      handleError(error, 'load messages');
    }
  }, [handleError, user]);

  // Load contacts
  const loadContacts = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-manager', {
        body: { action: 'get-contacts' }
      });

      if (error) {
        throw new Error(error.message);
      }

      setContacts(data.contacts || []);
    } catch (error: any) {
      handleError(error, 'load contacts');
    }
  }, [handleError, user]);

  // Send message with validation
  const sendMessage = useCallback(async (phone: string, message: string) => {
    if (!user) {
      throw new Error('Você precisa estar logado para enviar mensagens');
    }

    if (!phone || !message.trim()) {
      throw new Error('Telefone e mensagem são obrigatórios');
    }

    // E164 basic validation
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      throw new Error('Número de telefone inválido');
    }

    try {
      console.log('whatsapp_message_sending');
      
      const { data, error } = await supabase.functions.invoke('whatsapp-manager', {
        body: {
          action: 'send-message',
          phone: cleanPhone,
          message: message.trim()
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.success) {
        toast({
          title: "Mensagem Enviada",
          description: "Mensagem enviada com sucesso"
        });
        
        console.log('whatsapp_message_sent');
        
        // Reload data
        await Promise.all([loadMessages(), loadContacts()]);
        
        return data.messageId;
      } else {
        throw new Error(data?.error || 'Falha ao enviar mensagem');
      }
    } catch (error: any) {
      console.log('whatsapp_message_failed');
      handleError(error, 'send message');
      throw error;
    }
  }, [toast, handleError, user, loadMessages, loadContacts]);

  // Retry failed operations
  const retry = useCallback(() => {
    setError(null);
    setRetryCount(0);
    if (session.status === 'desconectado') {
      connectWhatsApp();
    } else {
      getSessionStatus();
    }
  }, [session.status, connectWhatsApp, getSessionStatus]);

  // Initialize and cleanup
  useEffect(() => {
    // Only initialize if user is authenticated
    if (user) {
      getSessionStatus();
      loadContacts();
    }
    
    return () => {
      clearIntervals();
    };
  }, [getSessionStatus, loadContacts, clearIntervals, user]);

  // Realtime subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('whatsapp-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whatsapp_mensagens_temp'
        },
        () => {
          console.log('Nova mensagem WhatsApp detectada');
          loadMessages();
          loadContacts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadMessages, loadContacts]);

  return {
    session,
    messages,
    contacts,
    loading,
    error,
    retryCount,
    connectWhatsApp,
    disconnectWhatsApp,
    sendMessage,
    loadMessages,
    loadContacts,
    getSessionStatus,
    retry,
    clearError: () => setError(null)
  };
};