import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

export const useTeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Erro ao buscar membros da equipe:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os membros da equipe.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTeamMember = async (memberData: TeamMemberInput) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('team_members')
        .insert({
          ...memberData,
          user_id: user.id,
          permissions: memberData.permissions || {},
        })
        .select()
        .single();

      if (error) throw error;

      setTeamMembers(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Membro adicionado com sucesso!",
      });

      return data;
    } catch (error) {
      console.error('Erro ao criar membro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o membro.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateTeamMember = async (id: string, memberData: Partial<TeamMemberInput>) => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .update({
          ...memberData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setTeamMembers(prev => 
        prev.map(member => member.id === id ? data : member)
      );

      toast({
        title: "Sucesso",
        description: "Membro atualizado com sucesso!",
      });

      return data;
    } catch (error) {
      console.error('Erro ao atualizar membro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o membro.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteTeamMember = async (id: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTeamMembers(prev => prev.filter(member => member.id !== id));
      toast({
        title: "Sucesso",
        description: "Membro removido com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao remover membro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o membro.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  return {
    teamMembers,
    loading,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember,
    refetch: fetchTeamMembers,
  };
};