import { supabase } from '@/integrations/supabase/client';

export interface WhatsAppStats {
  total_contacts: number;
  messages_sent: number;
  messages_received: number;
  last_activity: string | null;
}

export async function fetchWhatsAppStats(userId: string): Promise<WhatsAppStats> {
  const { data, error } = await supabase.rpc('get_whatsapp_stats', {
    p_user_id: userId
  });

  if (error) throw error;
  
  return data[0] || {
    total_contacts: 0,
    messages_sent: 0,
    messages_received: 0,
    last_activity: null
  };
}

export async function recordPerformanceMetric(
  userId: string,
  sessionId: string,
  metricType: string,
  metricValue: number,
  metricUnit: string = 'count',
  tags: Record<string, any> = {}
) {
  const { error } = await supabase.rpc('record_performance_metric', {
    p_user_id: userId,
    p_session_id: sessionId,
    p_metric_type: metricType,
    p_metric_value: metricValue,
    p_metric_unit: metricUnit,
    p_tags: tags
  });

  if (error) throw error;
}

export async function cleanupExpiredSessions() {
  const { data, error } = await supabase.rpc('cleanup_expired_whatsapp_sessions');
  if (error) throw error;
  return data;
}

export async function enqueueMessage(
  userId: string,
  sessionId: string,
  phone: string,
  message: string,
  contactName?: string,
  priority: number = 0
) {
  const { data, error } = await supabase.rpc('enqueue_whatsapp_message', {
    p_user_id: userId,
    p_session_id: sessionId,
    p_phone: phone,
    p_message: message,
    p_contact_name: contactName,
    p_priority: priority
  });

  if (error) throw error;
  return data;
}