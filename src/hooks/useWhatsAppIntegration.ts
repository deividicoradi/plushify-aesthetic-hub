import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSecureWhatsAppAuth } from './useSecureWhatsAppAuth';
import { getWhatsAppCircuitBreaker } from '@/utils/whatsappCircuitBreaker';

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
  
  // Get circuit breaker instance
  const circuitBreaker = getWhatsAppCircuitBreaker();
  
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
  const initializationRef = useRef<boolean>(false);
  const lastRequestTimeRef = useRef<number>(0);

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

  // Circuit Breaker Logic - agora usando o circuit breaker centralizado
  const checkCircuitBreaker = useCallback(() => {
    return circuitBreaker.canMakeRequest();
  }, [circuitBreaker]);

  const recordFailure = useCallback((error?: Error) => {
    circuitBreaker.recordFailure(error);
  }, [circuitBreaker]);

  const recordSuccess = useCallback(() => {
    circuitBreaker.recordSuccess();
  }, [circuitBreaker]);

  // Rate limiting adicional para evitar spam
  const isRateLimited = useCallback(() => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTimeRef.current;
    
    if (timeSinceLastRequest < 1000) { // Mínimo 1 segundo entre requisições
      console.log('[WHATSAPP-RATE] ⚠️ Rate limited - too frequent requests');
      return true;
    }
    
    lastRequestTimeRef.current = now;
    return false;
  }, []);

  // Fazer requisição segura com proteções múltiplas
  const makeSecureRequest = useCallback(async (endpoint: string, options: any = {}) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // Check rate limiting interno
    if (isRateLimited()) {
      throw new Error('Rate limit interno - aguarde antes de fazer nova requisição');
    }

    // Check circuit breaker
    if (!checkCircuitBreaker()) {
      const cbState = circuitBreaker.getState();
      const timeUntilRetry = cbState.nextRetryTime ? 
        Math.ceil((cbState.nextRetryTime - Date.now()) / 1000) : 0;
      throw new Error(`Circuit breaker ativo - tente novamente em ${timeUntilRetry} segundos`);
    }

    circuitBreaker.startRequest();

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
  }, [user, checkRateLimit, getValidToken, whatsappSession, checkCircuitBreaker, isRateLimited, circuitBreaker]);

  // Error handler with circuit breaker
  const handleError = useCallback((error: any, context: string) => {
    console.error(`[WHATSAPP-ERROR] ${context}:`, error);
    recordFailure();
    
    let errorType: WhatsAppError['type'] = 'unknown';
    let message = error.message || 'Erro desconhecido';
    
    if (error.message?.includes('401') || error.message?.includes('403')) {
      errorType = 'auth';
      message = 'Sessão expirada. Faça login novamente.';
    } else if (error.message?.includes('5')) {
      errorType = 'server';
      message = 'Serviço temporariamente indisponível. Tente outra vez.';
    } else if (error.message?.includes('timeout') || error.message?.includes('network') || error.message?.includes('ERR_INSUFFICIENT_RESOURCES')) {
      errorType = 'network';
      message = 'Sem resposta do servidor. Verifique sua internet e tente de novo.';
    } else if (error.message?.includes('Circuit breaker')) {
      errorType = 'network';
      message = 'Serviço temporariamente bloqueado devido a falhas consecutivas.';
    }

    setError({ type: errorType, message, code: error.status });
    
    if (errorType === 'auth') {
      toast({
        title: "Sessão Expirada",
        description: message,
        variant: "destructive"
      });
    } else if (errorType !== 'network') { // Don't spam for network errors
      toast({
        title: "Erro",
        description: message,
        variant: "destructive"
      });
    }
  }, [toast, recordFailure]);

  // Get session status with secure authentication
  const getSessionStatus = useCallback(async (signal?: AbortSignal) => {
    if (!user?.id || !whatsappSession?.session_id) {
      setSession({ id: null, status: 'desconectado' });
      return;
    }

    if (!checkCircuitBreaker()) {
      return;
    }

    try {
      console.log('[WHATSAPP-REQUEST] 📡 Getting session status...');
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

      recordSuccess();
      setError(null);
      setRetryCount(0);
      console.log('[WHATSAPP-REQUEST] ✅ Session status success:', data.status);

      return data;
    } catch (error: any) {
      if (!signal?.aborted) {
        handleError(error, 'status check');
      }
      throw error;
    }
  }, [user?.id, whatsappSession?.session_id, whatsappSession?.status, makeSecureRequest, checkCircuitBreaker, recordSuccess, handleError]);

  // Get QR code from server
  const getQRCode = useCallback(async (signal?: AbortSignal) => {
    if (!user?.id) return;

    if (!checkCircuitBreaker()) {
      return null;
    }

    try {
      console.log('[WHATSAPP-REQUEST] 📱 Requesting QR Code...');
      let data: any = null;
      
      try {
        const res = await supabase.functions.invoke('whatsapp-manager', {
          body: { action: 'get-qr' }
        });
        if (res.error) throw res.error;
        data = res.data;
      } catch (efErr: any) {
        console.warn('[WHATSAPP-FALLBACK] Edge Function unavailable, falling back to direct server:', efErr?.message);
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

      if (data?.qrCode) {
        setSession(prev => ({
          ...prev,
          qrCode: data.qrCode
        }));
        recordSuccess();
        console.log('[WHATSAPP-REQUEST] ✅ QR Code updated');
      }

      return data;
    } catch (error: any) {
      if (!signal?.aborted) {
        console.error('[WHATSAPP-ERROR] QR fetch failed:', error.message);
        handleError(error, 'QR code fetch');
      }
      return null;
    }
  }, [user?.id, makeSecureRequest, checkCircuitBreaker, recordSuccess, handleError]);

  // Connect WhatsApp with secure authentication
  const connectWhatsApp = useCallback(async () => {
    if (!user?.id || !whatsappSession?.session_id) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para conectar o WhatsApp",
        variant: "destructive"
      });
      return;
    }

    if (loading) return;
    
    if (!checkCircuitBreaker()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    clearIntervals();
    
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      console.log('[WHATSAPP-REQUEST] 🔗 Connecting WhatsApp...');
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

        recordSuccess();

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
          
          // Start polling with circuit breaker check
          pollIntervalRef.current = setInterval(async () => {
            if (checkCircuitBreaker()) {
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
                console.warn('[WHATSAPP-POLL] Polling error (ignoring):', error);
              }
            }
          }, 4000);

          // QR refresh with circuit breaker
          qrIntervalRef.current = setInterval(() => {
            if (checkCircuitBreaker()) {
              getQRCode(controller.signal);
            }
          }, 6000);

          // Initial QR fetch
          setTimeout(() => {
            if (checkCircuitBreaker()) {
              getQRCode(controller.signal);
            }
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
  }, [loading, user?.id, whatsappSession?.session_id, toast, clearIntervals, makeSecureRequest, checkCircuitBreaker, recordSuccess, handleError, getSessionStatus, getQRCode]);

  // Disconnect WhatsApp
  const disconnectWhatsApp = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    clearIntervals();
    
    try {
      console.log('[WHATSAPP-REQUEST] 🔌 Disconnecting WhatsApp...');
      const { error } = await supabase.functions.invoke('whatsapp-manager', {
        body: { action: 'disconnect' }
      });
      if (error) throw error;
      recordSuccess();
    } catch (efErr: any) {
      console.warn('[WHATSAPP-FALLBACK] Edge Function disconnect failed, using direct server:', efErr?.message);
      try {
        const response = await makeSecureRequest('/', {
          method: 'POST',
          body: JSON.stringify({ action: 'disconnect' })
        });
        if (!response.ok) {
          console.warn('[WHATSAPP-WARNING] Direct disconnect returned non-OK:', response.status, response.statusText);
        } else {
          recordSuccess();
        }
      } catch (directErr) {
        console.warn('[WHATSAPP-WARNING] Direct disconnect failed:', directErr);
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
  }, [toast, clearIntervals, user, makeSecureRequest, recordSuccess]);

  // Load messages with circuit breaker
  const loadMessages = useCallback(async (contactId?: string, limit = 50) => {
    if (!user) return;
    
    if (!checkCircuitBreaker()) {
      console.log('[WHATSAPP-CIRCUIT] ❌ Messages load blocked by circuit breaker');
      return;
    }
    
    try {
      console.log('[WHATSAPP-REQUEST] 📨 Loading messages...');
      const path = contactId ? `messages?contactId=${contactId}&limit=${limit}` : `messages?limit=${limit}`;
      
      try {
        const { data, error } = await supabase.functions.invoke('whatsapp-manager', {
          method: 'GET',
          headers: {
            'X-Request-Path': path
          }
        });

        if (error) throw new Error(error.message);
        setMessages(data.messages || []);
        recordSuccess();
        console.log('[WHATSAPP-REQUEST] ✅ Messages loaded via Edge Function');
        return;
      } catch (efErr: any) {
        console.warn('[WHATSAPP-FALLBACK] Edge Function loadMessages failed, falling back to direct server:', efErr?.message);
        const response = await makeSecureRequest(`/${path.startsWith('/') ? path.slice(1) : path}`, {
          method: 'GET'
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        setMessages(data.messages || []);
        recordSuccess();
        console.log('[WHATSAPP-REQUEST] ✅ Messages loaded via direct server');
      }
    } catch (error: any) {
      handleError(error, 'load messages');
    }
  }, [user, makeSecureRequest, checkCircuitBreaker, recordSuccess, handleError]);

  // Load contacts with circuit breaker and controlled calls
  const loadContacts = useCallback(async () => {
    if (!user) return;
    
    if (!checkCircuitBreaker()) {
      console.log('[WHATSAPP-CIRCUIT] ❌ Contacts load blocked by circuit breaker');
      return;
    }
    
    try {
      console.log('[WHATSAPP-REQUEST] 👥 Loading contacts...');
      
      try {
        const { data, error } = await supabase.functions.invoke('whatsapp-manager', {
          body: { action: 'get-contacts' }
        });

        if (error) throw new Error(error.message);
        setContacts(data.contacts || []);
        recordSuccess();
        console.log('[WHATSAPP-REQUEST] ✅ Contacts loaded via Edge Function:', data.contacts?.length || 0);
        return;
      } catch (efErr: any) {
        console.warn('[WHATSAPP-FALLBACK] Edge Function loadContacts failed, falling back to direct server:', efErr?.message);
        const response = await makeSecureRequest('/', {
          method: 'POST',
          body: JSON.stringify({ action: 'get-contacts' })
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        setContacts(data.contacts || []);
        recordSuccess();
        console.log('[WHATSAPP-REQUEST] ✅ Contacts loaded via direct server:', data.contacts?.length || 0);
      }
    } catch (error: any) {
      handleError(error, 'load contacts');
    }
  }, [user, makeSecureRequest, checkCircuitBreaker, recordSuccess, handleError]);

  // Send message with validation and circuit breaker
  const sendMessage = useCallback(async (phone: string, message: string) => {
    if (!user) {
      throw new Error('Você precisa estar logado para enviar mensagens');
    }

    if (!phone || !message.trim()) {
      throw new Error('Telefone e mensagem são obrigatórios');
    }

    if (!checkCircuitBreaker()) {
      throw new Error('Serviço temporariamente indisponível. Tente novamente em alguns instantes.');
    }

    // E164 basic validation
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      throw new Error('Número de telefone inválido');
    }

    try {
      console.log('[WHATSAPP-REQUEST] 📤 Sending message...');
      
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
        recordSuccess();
        toast({
          title: "Mensagem Enviada",
          description: "Mensagem enviada com sucesso"
        });
        
        console.log('[WHATSAPP-REQUEST] ✅ Message sent successfully');
        
        // Reload data with rate limiting
        setTimeout(() => {
          Promise.all([loadMessages(), loadContacts()]);
        }, 1000);
        
        return data.messageId;
      } else {
        throw new Error(data?.error || 'Falha ao enviar mensagem');
      }
    } catch (error: any) {
      console.log('[WHATSAPP-ERROR] Message send failed:', error);
      handleError(error, 'send message');
      throw error;
    }
  }, [toast, user, loadMessages, loadContacts, checkCircuitBreaker, recordSuccess, handleError]);

  // Retry com reset do circuit breaker
  const retry = useCallback(() => {
    console.log('[WHATSAPP-RETRY] 🔄 Manual retry triggered - resetting circuit breaker');
    setError(null);
    setRetryCount(0);
    circuitBreaker.reset();
    
    if (session.status === 'desconectado') {
      connectWhatsApp();
    } else {
      getSessionStatus();
    }
  }, [session.status, connectWhatsApp, getSessionStatus, circuitBreaker]);

  // CONTROLLED Initialize - only once per user session
  useEffect(() => {
    if (user?.id && !initializationRef.current) {
      initializationRef.current = true;
      console.log('[WHATSAPP-INIT] 🚀 Initializing WhatsApp integration for user:', user.id);
      
      // Initialize with delay to avoid rapid calls
      setTimeout(() => {
        getSessionStatus();
      }, 500);
      
      setTimeout(() => {
        loadContacts();
      }, 1000);
    }
    
    return () => {
      clearIntervals();
    };
  }, [user?.id]); // Only user.id dependency

  // CONTROLLED Realtime subscriptions - with debouncing
  useEffect(() => {
    if (!user?.id) return;

    let debounceTimeout: NodeJS.Timeout;
    
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
          console.log('[WHATSAPP-REALTIME] 📨 New message detected - debouncing reload...');
          clearTimeout(debounceTimeout);
          debounceTimeout = setTimeout(() => {
            if (checkCircuitBreaker()) {
              console.log('[WHATSAPP-REALTIME] ⚡ Reloading data...');
              loadMessages();
              loadContacts();
            }
          }, 2000); // 2 second debounce
        }
      )
      .subscribe();

    return () => {
      clearTimeout(debounceTimeout);
      supabase.removeChannel(channel);
    };
  }, [user?.id]); // Only user.id dependency

  // Reset quando usuário muda
  useEffect(() => {
    if (!user) {
      initializationRef.current = false;
      setSession({ id: null, status: 'desconectado' });
      setMessages([]);
      setContacts([]);
      setError(null);
      circuitBreaker.reset();
      console.log('[WHATSAPP-RESET] 🔄 User changed - resetting state');
    }
  }, [user?.id, circuitBreaker]);

  return {
    session,
    messages,
    contacts,
    loading,
    error,
    retryCount,
    circuitBreaker: circuitBreaker.getState(),
    connectWhatsApp,
    disconnectWhatsApp,
    sendMessage,
    loadMessages,
    loadContacts,
    getSessionStatus,
    retry,
    clearError: () => setError(null),
    getDebugInfo: () => circuitBreaker.getDebugInfo()
  };
};