import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSecureWhatsAppAuth } from './useSecureWhatsAppAuth';

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
  const { 
    whatsappSession, 
    getValidToken, 
    checkRateLimit, 
    cleanup 
  } = useSecureWhatsAppAuth();
  
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

  // Fazer requisição segura com rate limiting e token
  const makeSecureRequest = useCallback(async (endpoint: string, options: any = {}) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // Verificar rate limiting
    const canProceed = await checkRateLimit(endpoint);
    if (!canProceed) {
      throw new Error('Rate limit excedido');
    }

    // Obter token válido
    const token = await getValidToken();
    if (!token) {
      throw new Error('Token inválido ou expirado');
    }

    // Configurar URL do servidor baseado na sessão
    const serverUrl = whatsappSession?.server_url || WHATSAPP_SERVER_URL;
    
    return fetch(`${serverUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
  }, [user, checkRateLimit, getValidToken, whatsappSession]);

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

  // Get session status with secure authentication
  const getSessionStatus = useCallback(async (signal?: AbortSignal) => {
    if (!user || !whatsappSession) {
      setSession({ id: null, status: 'desconectado' });
      return;
    }

    try {
      const response = await makeSecureRequest('/', { 
        method: 'GET',
        signal 
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      setSession(prev => ({
        ...prev,
        status: data.status || 'desconectado',
        id: data.sessionId || whatsappSession.session_id,
        ready: data.ready || false,
        qrCode: data.qrCode || prev.qrCode
      }));

      // Atualizar sessão no banco se status mudou
      if (data.status !== whatsappSession.status) {
        await supabase
          .from('whatsapp_sessions')
          .update({ 
            status: data.status,
            qr_code: data.qrCode,
            last_activity: new Date().toISOString()
          })
          .eq('user_id', user.id);
      }

      setError(null);
      setRetryCount(0);

      return data;
    } catch (error: any) {
      if (!signal?.aborted) {
        handleError(error, 'status check');
      }
      throw error;
    }
  }, [handleError, user, whatsappSession, makeSecureRequest]);

  // Get QR code from server
  const getQRCode = useCallback(async (signal?: AbortSignal) => {
    // Don't make requests if user is not authenticated
    if (!user) return;

    try {
      console.log('Requesting QR Code from server');
      let data: any = null;
      // Try Edge Function first, then gracefully fall back to direct server
      try {
        const res = await supabase.functions.invoke('whatsapp-manager', {
          body: { action: 'get-qr' }
        });
        if (res.error) throw res.error;
        data = res.data;
      } catch (efErr: any) {
        console.warn('Edge Function unavailable, falling back to direct server request:', efErr?.message);
        const response = await makeSecureRequest('/', {
          method: 'POST',
          body: JSON.stringify({ action: 'get-qr' }),
          signal
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        data = await response.json();
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
  }, [user, handleError, makeSecureRequest]);

  // Connect WhatsApp with secure authentication
  const connectWhatsApp = useCallback(async () => {
    if (!user || !whatsappSession) {
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
      const response = await makeSecureRequest('/', {
        method: 'POST',
        body: JSON.stringify({ action: 'connect' }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

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
      if (error) throw error;
    } catch (efErr: any) {
      console.warn('Edge Function disconnect failed, using direct server request:', efErr?.message);
      try {
        const response = await makeSecureRequest('/', {
          method: 'POST',
          body: JSON.stringify({ action: 'disconnect' })
        });
        if (!response.ok) {
          console.warn('Direct disconnect returned non-OK:', response.status, response.statusText);
        }
      } catch (directErr) {
        console.warn('Direct disconnect failed:', directErr);
      }
    } finally {
      setSession({
        id: null,
        status: 'desconectado',
        qrCode: undefined
      });

      toast({
        title: "WhatsApp Desconectado",
        description: "Sessão encerrada com sucesso"
      });

      setLoading(false);
    }
  }, [toast, clearIntervals, user, makeSecureRequest]);

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
  }, [handleError, user, makeSecureRequest]);

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
  }, [handleError, user, makeSecureRequest]);

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
  }, [toast, handleError, user, loadMessages, loadContacts, makeSecureRequest]);

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