
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

    // Configurar listeners em tempo real para agendamentos
    const appointmentsChannel = supabase
      .channel('reports-appointments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Appointments changed, refreshing reports data:', payload);
          onDataChange();
        }
      )
      .subscribe();

    // Configurar listeners em tempo real para clientes
    const clientsChannel = supabase
      .channel('reports-clients')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Clients changed, refreshing reports data:', payload);
          onDataChange();
        }
      )
      .subscribe();

    // Configurar listeners em tempo real para transações financeiras
    const transactionsChannel = supabase
      .channel('reports-transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'financial_transactions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Financial transactions changed, refreshing reports data:', payload);
          onDataChange();
        }
      )
      .subscribe();

    // Configurar listeners em tempo real para produtos
    const productsChannel = supabase
      .channel('reports-products')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Products changed, refreshing reports data:', payload);
          onDataChange();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(appointmentsChannel);
      supabase.removeChannel(clientsChannel);
      supabase.removeChannel(transactionsChannel);
      supabase.removeChannel(productsChannel);
    };
  }, [user, onDataChange]);
};
