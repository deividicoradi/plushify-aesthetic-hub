import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Commission {
  id: string;
  user_id: string;
  team_member_id: string;
  appointment_id: string;
  base_amount: number;
  commission_percent: number;
  commission_amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

// teamMemberId: quando informado (Modo Funcionário), filtra só as comissões
// daquele profissional; a query roda sob a sessão do dono (RLS user_id =
// auth.uid()), então o filtro por profissional é feito aqui, no client.
export const useCommissions = (teamMemberId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const queryKey = ['commissions', user?.id, teamMemberId ?? 'all'];

  const { data: commissions = [], isLoading: loading, refetch } = useQuery({
    queryKey,
    enabled: !!user?.id,
    queryFn: async (): Promise<Commission[]> => {
      let query = supabase
        .from('commissions')
        .select('id,user_id,team_member_id,appointment_id,base_amount,commission_percent,commission_amount,status,paid_at,created_at,updated_at')
        .order('created_at', { ascending: false });

      if (teamMemberId) {
        query = query.eq('team_member_id', teamMemberId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Commission[];
    },
    staleTime: 30_000,
  });

  const totals = commissions.reduce(
    (acc, c) => {
      if (c.status !== 'cancelled') acc[c.status] += c.commission_amount;
      return acc;
    },
    { pending: 0, paid: 0 } as Record<'pending' | 'paid', number>
  );

  const markAsPaidMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('commissions')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commissions'] });
      toast({ title: 'Comissão marcada como paga' });
    },
    onError: (error: any) => {
      console.error('Erro ao marcar comissão como paga:', error);
      toast({ title: 'Erro', description: error?.message || 'Não foi possível atualizar a comissão.', variant: 'destructive' });
    },
  });

  return {
    commissions,
    loading,
    totals,
    markAsPaid: (id: string) => markAsPaidMutation.mutateAsync(id),
    refetch,
  };
};
