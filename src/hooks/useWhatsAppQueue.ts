import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface QueueMessage {
  id: string;
  user_id: string;
  session_id: string;
  phone: string;
  message: string;
  contact_name?: string;
  priority: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  retry_count: number;
  max_retries: number;
  scheduled_at: string;
  processed_at?: string;
  failed_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  total: number;
}

export const useWhatsAppQueue = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<QueueMessage[]>([]);
  const [stats, setStats] = useState<QueueStats>({
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    total: 0
  });
  const [loading, setLoading] = useState(false);

  // Enfileirar mensagem
  const enqueueMessage = useCallback(async (
    sessionId: string,
    phone: string,
    message: string,
    contactName?: string,
    priority: number = 0
  ): Promise<string | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.rpc('enqueue_whatsapp_message', {
        p_user_id: user.id,
        p_session_id: sessionId,
        p_phone: phone,
        p_message: message,
        p_contact_name: contactName,
        p_priority: priority
      });

      if (error) throw error;

      toast({
        title: "Mensagem Enfileirada",
        description: `Mensagem para ${phone} adicionada à fila de processamento.`,
      });

      // Reload data
      await loadMessages();
      await loadStats();

      return data;
    } catch (error) {
      console.error('Error enqueueing message:', error);
      toast({
        title: "Erro ao Enfileirar",
        description: "Falha ao adicionar mensagem à fila.",
        variant: "destructive",
      });
      return null;
    }
  }, [user, toast]);

  // Carregar mensagens da fila
  const loadMessages = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('whatsapp_message_queue')
        .select('*')
        .eq('user_id', user.id)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      setMessages((data || []) as QueueMessage[]);
    } catch (error) {
      console.error('Error loading queue messages:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Carregar estatísticas
  const loadStats = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('whatsapp_message_queue')
        .select('status')
        .eq('user_id', user.id);

      if (error) throw error;

      const statusCounts = data.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      setStats({
        pending: statusCounts.pending || 0,
        processing: statusCounts.processing || 0,
        completed: statusCounts.completed || 0,
        failed: statusCounts.failed || 0,
        total: data.length
      });
    } catch (error) {
      console.error('Error loading queue stats:', error);
    }
  }, [user]);

  // Reprocessar mensagem falhada
  const retryMessage = useCallback(async (messageId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('whatsapp_message_queue')
        .update({
          status: 'pending',
          scheduled_at: new Date().toISOString(),
          error_message: null
        })
        .eq('id', messageId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Mensagem Reagendada",
        description: "Mensagem foi colocada novamente na fila para processamento.",
      });

      await loadMessages();
      await loadStats();

      return true;
    } catch (error) {
      console.error('Error retrying message:', error);
      toast({
        title: "Erro no Reprocessamento",
        description: "Falha ao reagendar mensagem.",
        variant: "destructive",
      });
      return false;
    }
  }, [user, toast, loadMessages, loadStats]);

  // Cancelar mensagem
  const cancelMessage = useCallback(async (messageId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('whatsapp_message_queue')
        .update({
          status: 'failed',
          error_message: 'Cancelada pelo usuário',
          failed_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('user_id', user.id)
        .in('status', ['pending', 'processing']);

      if (error) throw error;

      toast({
        title: "Mensagem Cancelada",
        description: "Mensagem foi removida da fila de processamento.",
      });

      await loadMessages();
      await loadStats();

      return true;
    } catch (error) {
      console.error('Error canceling message:', error);
      toast({
        title: "Erro no Cancelamento",
        description: "Falha ao cancelar mensagem.",
        variant: "destructive",
      });
      return false;
    }
  }, [user, toast, loadMessages, loadStats]);

  // Limpar mensagens processadas
  const clearProcessed = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('whatsapp_message_queue')
        .delete()
        .eq('user_id', user.id)
        .in('status', ['completed', 'failed']);

      if (error) throw error;

      toast({
        title: "Fila Limpa",
        description: "Mensagens processadas foram removidas da fila.",
      });

      await loadMessages();
      await loadStats();

      return true;
    } catch (error) {
      console.error('Error clearing processed messages:', error);
      toast({
        title: "Erro na Limpeza",
        description: "Falha ao limpar mensagens processadas.",
        variant: "destructive",
      });
      return false;
    }
  }, [user, toast, loadMessages, loadStats]);

  // Setup realtime subscriptions
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('whatsapp_queue_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whatsapp_message_queue',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          loadMessages();
          loadStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadMessages, loadStats]);

  // Carregar dados iniciais
  useEffect(() => {
    if (user) {
      loadMessages();
      loadStats();
    }
  }, [user, loadMessages, loadStats]);

  return {
    messages,
    stats,
    loading,
    enqueueMessage,
    retryMessage,
    cancelMessage,
    clearProcessed,
    loadMessages,
    loadStats
  };
};