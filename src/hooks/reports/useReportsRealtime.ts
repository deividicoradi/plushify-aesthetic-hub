
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface RealtimeHookParams {
  onDataChange: () => void;
}

export const useReportsRealtime = ({ onDataChange }: RealtimeHookParams) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Canal único para todos os eventos de reports (evita múltiplos canais)
    const reportsChannel = supabase
      .channel('reports-realtime-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Appointments changed:', payload.eventType);
          onDataChange();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Clients changed:', payload.eventType);
          onDataChange();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'financial_transactions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Transactions changed:', payload.eventType);
          onDataChange();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Products changed:', payload.eventType);
          onDataChange();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(reportsChannel);
    };
  }, [user?.id, onDataChange]); // user?.id ao invés de user para evitar re-subscribe
};
