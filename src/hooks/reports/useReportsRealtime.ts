
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface RealtimeHookParams {
  onDataChange: () => void;
}

export const useReportsRealtime = ({ onDataChange }: RealtimeHookParams) => {
  const { user } = useAuth();
  const onDataChangeRef = useRef(onDataChange);
  onDataChangeRef.current = onDataChange;

  useEffect(() => {
    if (!user) return;

    // Nome único por mount para evitar reuso do canal em StrictMode/HMR,
    // que causa "cannot add postgres_changes callbacks after subscribe()".
    const channelName = `reports-realtime-updates-${user.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const reportsChannel = supabase
      .channel(channelName)
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
          onDataChangeRef.current();
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
          onDataChangeRef.current();
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
          onDataChangeRef.current();
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
          onDataChangeRef.current();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(reportsChannel);
    };
  }, [user?.id]);
};
