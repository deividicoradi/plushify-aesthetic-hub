import { supabase } from '@/integrations/supabase/client';

export interface WhatsAppStats {
  total_contacts: number;
  messages_sent: number;
  messages_received: number;
  last_activity: string | null;
}

/**
 * Fetch WhatsApp statistics from new Cloud API tables
 */
export async function fetchWhatsAppStats(userId: string): Promise<WhatsAppStats> {
  try {
    // Count contacts
    const { count: contactsCount } = await supabase
      .from('wa_contacts')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', userId);

    // Count sent messages
    const { count: sentCount } = await supabase
      .from('wa_messages')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', userId)
      .eq('direction', 'out');

    // Count received messages
    const { count: receivedCount } = await supabase
      .from('wa_messages')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', userId)
      .eq('direction', 'in');

    // Get last activity
    const { data: lastMessage } = await supabase
      .from('wa_messages')
      .select('timestamp')
      .eq('tenant_id', userId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    return {
      total_contacts: contactsCount || 0,
      messages_sent: sentCount || 0,
      messages_received: receivedCount || 0,
      last_activity: lastMessage?.timestamp || null,
    };
  } catch (error) {
    console.error('Error fetching WhatsApp stats:', error);
    return {
      total_contacts: 0,
      messages_sent: 0,
      messages_received: 0,
      last_activity: null,
    };
  }
}