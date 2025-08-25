import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  status: 'conectado' | 'desconectado' | 'conectando' | 'pareando';
  qrCode?: string;
}

const getWhatsAppBaseUrl = () => {
  // URL da edge function WhatsApp Manager no Supabase
  return 'https://wmoylybbwikkqbxiqwbq.supabase.co/functions/v1/whatsapp-manager';
};

export const useWhatsApp = () => {
  const [session, setSession] = useState<WhatsAppSession>({
    id: null,
    status: 'desconectado'
  });
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getSessionStatus = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const response = await fetch(`${getWhatsAppBaseUrl()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSession(prev => ({
        ...prev,
        status: data.status,
        id: data.sessionId,
        qrCode: data.qrCode ?? prev.qrCode
      }));
    } catch (error) {
      console.error('Erro ao verificar status da sessão:', error);
    }
  }, []);

  const connectWhatsApp = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Não autenticado');

      const response = await fetch(`${getWhatsAppBaseUrl()}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'connect' }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data?.success) {
        console.log('Resposta do servidor WhatsApp:', data);
        if (data.qrCode) {
          console.log('QR Code recebido:', data.qrCode.substring(0, 50) + '...');
          setSession({
            id: data.sessionId,
            status: 'pareando',
            qrCode: data.qrCode
          });
          
          toast({
            title: "QR Code Gerado",
            description: data.message || "Escaneie o QR Code com seu WhatsApp para conectar"
          });
          
          // Verificar status periodicamente até conectar
          const checkStatus = setInterval(async () => {
            await getSessionStatus();
          }, 5000);
          
          // Limpar interval após 2 minutos
          setTimeout(() => {
            clearInterval(checkStatus);
          }, 120000);
        } else {
          setSession({
            id: data.sessionId,
            status: 'conectado'
          });
          
          toast({
            title: "WhatsApp Conectado",
            description: data.message || "Sessão já estava ativa"
          });
        }
      } else {
        throw new Error(data?.error || 'Falha ao conectar');
      }
    } catch (error) {
      console.error('Erro ao conectar WhatsApp:', error);
      toast({
        title: "Erro",
        description: "Falha ao conectar com WhatsApp: " + (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast, getSessionStatus]);

  const disconnectWhatsApp = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Não autenticado');

      const response = await fetch(`${getWhatsAppBaseUrl()}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'disconnect' }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
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
    } catch (error) {
      console.error('Erro ao desconectar WhatsApp:', error);
      toast({
        title: "Erro",
        description: "Falha ao desconectar WhatsApp",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const loadMessages = useCallback(async (contactId?: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const base = getWhatsAppBaseUrl();
      const url = new URL(`${base}/messages`);
      if (contactId) url.searchParams.set('contactId', contactId);
      url.searchParams.set('limit', '50');

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setMessages(result.messages || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  }, []);

  const sendMessage = useCallback(async (phone: string, message: string, contactName?: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Não autenticado');

      const response = await fetch(`${getWhatsAppBaseUrl()}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send-message',
          phone,
          message,
          contactName
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      toast({
        title: "Mensagem Enviada",
        description: "Mensagem enviada com sucesso"
      });

      // Recarregar mensagens
      await loadMessages();
      
      return data.messageId;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Falha ao enviar mensagem",
        variant: "destructive"
      });
      throw error;
    }
  }, [toast, loadMessages]);


  const loadContacts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_contatos')
        .select('*')
        .order('ultima_interacao', { ascending: false });

      if (error) throw error;

      setContacts(data || []);
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
    }
  }, []);

  // Verificar status da sessão ao montar o componente
  useEffect(() => {
    getSessionStatus();
    loadContacts();
  }, [getSessionStatus, loadContacts]);

  // Configurar realtime para mensagens
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
          console.log('Nova mensagem WhatsApp detectada, recarregando...');
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
    connectWhatsApp,
    disconnectWhatsApp,
    sendMessage,
    loadMessages,
    loadContacts,
    getSessionStatus
  };
};