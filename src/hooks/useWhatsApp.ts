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
      const { data, error } = await supabase.functions.invoke('whatsapp-manager', {
        method: 'GET'
      });

      if (error) throw error;

      setSession(prev => ({
        ...prev,
        status: data.status,
        id: data.sessionId
      }));
    } catch (error) {
      console.error('Erro ao verificar status da sessão:', error);
    }
  }, []);

  const connectWhatsApp = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-manager/connect', {
        method: 'POST'
      });

      if (error) throw error;

      if (data.qrCode) {
        setSession({
          id: data.sessionId,
          status: 'pareando',
          qrCode: data.qrCode
        });
        
        toast({
          title: "QR Code Gerado",
          description: "Escaneie o QR Code com seu WhatsApp para conectar"
        });
      } else {
        setSession({
          id: data.sessionId,
          status: 'conectado'
        });
        
        toast({
          title: "WhatsApp Conectado",
          description: "Sessão já estava ativa"
        });
      }
    } catch (error) {
      console.error('Erro ao conectar WhatsApp:', error);
      toast({
        title: "Erro",
        description: "Falha ao conectar com WhatsApp",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const disconnectWhatsApp = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-manager/disconnect', {
        method: 'POST'
      });

      if (error) throw error;

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

  const sendMessage = useCallback(async (phone: string, message: string, contactName?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-manager/send-message', {
        method: 'POST',
        body: {
          phone,
          message,
          contactName
        }
      });

      if (error) throw error;

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
  }, [toast]);

  const loadMessages = useCallback(async (contactId?: string) => {
    try {
      const params = new URLSearchParams();
      if (contactId) params.append('contactId', contactId);
      params.append('limit', '50');

      const { data, error } = await supabase.functions.invoke(`whatsapp-manager/messages?${params}`, {
        method: 'GET'
      });

      if (error) throw error;

      setMessages(data.messages || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  }, []);

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
          table: 'whatsapp_mensagens'
        },
        () => {
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadMessages]);

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