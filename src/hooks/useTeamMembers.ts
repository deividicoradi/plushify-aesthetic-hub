import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

export interface TeamMember {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  permissions: Json;
  avatar_url?: string;
  status: string;
  hire_date?: string;
  salary?: number;
  created_at: string;
  updated_at: string;
}

export interface TeamMemberInput {
  name: string;
  email?: string;
  phone?: string;
  role: string;
  permissions?: Record<string, boolean>;
  avatar_url?: string;
  status?: 'active' | 'inactive';
  hire_date?: string;
  salary?: number;
}

// React Query (não state local): useTeamLimits() chama este hook de novo
// pra checar o limite de usuários — com state local cada instância tinha
// sua própria cópia da lista, então deletar/adicionar um membro numa tela
// não refletia na contagem usada pelo limite até um remount completo.
export const useTeamMembers = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const queryKey = ['team-members', user?.id];

  const { data: teamMembers = [], isLoading: loading, refetch } = useQuery({
    queryKey,
    enabled: !!user?.id,
    queryFn: async (): Promise<TeamMember[]> => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 60_000,
  });

  const createMutation = useMutation({
    mutationFn: async (memberData: TeamMemberInput) => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('team_members')
        .insert({
          ...memberData,
          user_id: authUser.id,
          permissions: memberData.permissions || {},
        })
        .select()
        .single();

      if (error) throw error;
      return data as TeamMember;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: "Sucesso", description: "Membro adicionado com sucesso!" });
    },
    onError: (error) => {
      console.error('Erro ao criar membro:', error);
      toast({ title: "Erro", description: "Não foi possível adicionar o membro.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, memberData }: { id: string; memberData: Partial<TeamMemberInput> }) => {
      const { data, error } = await supabase
        .from('team_members')
        .update({ ...memberData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as TeamMember;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: "Sucesso", description: "Membro atualizado com sucesso!" });
    },
    onError: (error) => {
      console.error('Erro ao atualizar membro:', error);
      toast({ title: "Erro", description: "Não foi possível atualizar o membro.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('team_members').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: "Sucesso", description: "Membro removido com sucesso!" });
    },
    onError: (error) => {
      console.error('Erro ao remover membro:', error);
      toast({ title: "Erro", description: "Não foi possível remover o membro.", variant: "destructive" });
    },
  });

  return {
    teamMembers,
    loading,
    createTeamMember: (memberData: TeamMemberInput) => createMutation.mutateAsync(memberData),
    updateTeamMember: (id: string, memberData: Partial<TeamMemberInput>) =>
      updateMutation.mutateAsync({ id, memberData }),
    deleteTeamMember: (id: string) => deleteMutation.mutateAsync(id),
    refetch,
  };
};
