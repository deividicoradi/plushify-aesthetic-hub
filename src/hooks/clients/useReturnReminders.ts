import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface LapsedClient {
  id: string;
  name: string;
  phone: string | null;
  last_visit: string;
  return_reminder_sent_at: string | null;
  daysSinceVisit: number;
}

// Cliente "sumido": tem pelo menos uma visita concluída registrada (last_visit
// não nulo, mantido pelo trigger trg_update_client_last_visit) e essa visita
// já passou do limiar de dias sem retorno. Clientes que nunca visitaram
// (last_visit nulo) não entram aqui — ainda não há "retorno" a lembrar.
const LAPSED_THRESHOLD_DAYS = 30;

export const useReturnReminders = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['clients', 'return-reminders', user?.id],
    enabled: !!user?.id,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, phone, last_visit, return_reminder_sent_at')
        .eq('user_id', user!.id)
        .not('last_visit', 'is', null)
        .order('last_visit', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const lapsedClients: LapsedClient[] = useMemo(() => {
    const today = new Date();
    return (query.data || [])
      .map((c) => ({
        ...c,
        daysSinceVisit: differenceInCalendarDays(today, parseISO(c.last_visit as string)),
      }))
      .filter((c) => c.daysSinceVisit >= LAPSED_THRESHOLD_DAYS) as LapsedClient[];
  }, [query.data]);

  const markReminderSent = async (clientId: string) => {
    if (!user?.id) return;
    await supabase
      .from('clients')
      .update({ return_reminder_sent_at: new Date().toISOString() })
      .eq('id', clientId)
      .eq('user_id', user.id);

    queryClient.invalidateQueries({ queryKey: ['clients', 'return-reminders', user.id] });
  };

  return {
    lapsedClients,
    isLoading: query.isLoading,
    markReminderSent,
    thresholdDays: LAPSED_THRESHOLD_DAYS,
  };
};
