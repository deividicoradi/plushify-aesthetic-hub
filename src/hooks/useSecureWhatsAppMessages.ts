import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SecureWhatsAppMessage {
  id: string;
  session_id: string;
  content: string;
  direction: string;
  contact_name: string | null;
  contact_phone: string | null;
  message_timestamp: string;
  status: string;
}

export const useSecureWhatsAppMessages = (sessionId?: string | null) => {
  const [messages, setMessages] = useState<SecureWhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async (limit = 100, offset = 0) => {
    try {
      setLoading(true);
      setError(null);

      // Use the secure function to get messages
      const { data, error: fetchError } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .order('timestamp', { ascending: false })
        .limit(limit)
        .range(offset, offset + limit - 1);

      if (fetchError) {
        console.error('Error fetching secure messages:', fetchError);
        setError('Failed to load messages securely');
        toast.error('Failed to load messages securely');
        return;
      }

      // Transform the data to match our interface
      const transformedMessages = (data || []).map(msg => ({
        id: msg.id,
        session_id: msg.session_id,
        content: msg.content,
        direction: msg.direction,
        contact_name: msg.contact_name,
        contact_phone: msg.contact_phone,
        message_timestamp: msg.timestamp,
        status: msg.status
      }));

      setMessages(transformedMessages);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Secure message insertion with validation
  const addMessage = async (messageData: {
    session_id: string;
    content: string;
    direction: 'sent' | 'received';
    contact_name?: string;
    contact_phone?: string;
  }) => {
    try {
      // Validate content length (matching our DB constraint)
      if (messageData.content.length > 10000) {
        toast.error('Message content too long (max 10,000 characters)');
        return false;
      }

      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        toast.error('Authentication required');
        return false;
      }

      const { data, error: insertError } = await supabase
        .from('whatsapp_messages')
        .insert({
          user_id: user.data.user.id,
          session_id: messageData.session_id,
          content: messageData.content,
          direction: messageData.direction,
          contact_name: messageData.contact_name || null,
          contact_phone: messageData.contact_phone || null,
          status: 'delivered'
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting secure message:', insertError);
        toast.error('Failed to save message securely');
        return false;
      }

      // Add the new message to the local state
      const newMessage: SecureWhatsAppMessage = {
        id: data.id,
        session_id: data.session_id,
        content: data.content,
        direction: data.direction,
        contact_name: data.contact_name,
        contact_phone: data.contact_phone,
        message_timestamp: data.timestamp,
        status: data.status
      };

      setMessages(prev => [newMessage, ...prev]);
      return true;
    } catch (err) {
      console.error('Unexpected error adding message:', err);
      toast.error('Failed to save message');
      return false;
    }
  };

  // Secure message deletion with RLS protection
  const deleteMessages = async (messageIds: string[], reason = 'user_request') => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        toast.error('Authentication required');
        return false;
      }

      // Delete messages (RLS will ensure only user's own messages are deleted)
      const { error: deleteError } = await supabase
        .from('whatsapp_messages')
        .delete()
        .in('id', messageIds)
        .eq('user_id', user.data.user.id);

      if (deleteError) {
        console.error('Error deleting messages:', deleteError);
        toast.error('Failed to delete messages securely');
        return false;
      }

      // Remove deleted messages from local state
      setMessages(prev => prev.filter(msg => !messageIds.includes(msg.id)));
      toast.success(`Successfully deleted ${messageIds.length} messages`);
      return true;
    } catch (err) {
      console.error('Unexpected error deleting messages:', err);
      toast.error('Failed to delete messages');
      return false;
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [sessionId]);

  return {
    messages,
    loading,
    error,
    fetchMessages,
    addMessage,
    deleteMessages,
    refetch: () => fetchMessages()
  };
};